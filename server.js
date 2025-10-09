import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';
import nodemailer from 'nodemailer';
import axios from 'axios';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

dotenv.config();

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg, .jpeg and .pdf format allowed!'));
    }
  }
});

// Middleware

// Security: Helmet for HTTP headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://www.google.com', 'https://www.gstatic.com'],
      frameSrc: ["'self'", 'https://www.google.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
    },
  },
}));

// Security: CORS with allowed origins
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true // Allow cookies
}));

// Security: Cookie parser
app.use(cookieParser());

app.use(express.json());

// Security: HTTPS enforcement (only in production)
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}

// Only serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
}

app.use('/uploads', express.static(uploadsDir));

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'alfakhama_rental',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const promisePool = pool.promise();

// Test database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    return;
  }
  console.log('Successfully connected to MySQL database');
  connection.release();
});

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Verify email configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Email configuration error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// reCAPTCHA verification middleware
const verifyRecaptcha = async (req, res, next) => {
  const recaptchaToken = req.body.recaptchaToken;

  if (!recaptchaToken) {
    return res.status(400).json({ success: false, error: 'reCAPTCHA token is required' });
  }

  try {
    const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
      params: {
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: recaptchaToken
      }
    });

    if (!response.data.success) {
      return res.status(400).json({ success: false, error: 'reCAPTCHA verification failed' });
    }

    // reCAPTCHA verified successfully, continue to next middleware
    next();
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return res.status(500).json({ success: false, error: 'reCAPTCHA verification error' });
  }
};

// ==================== ADMIN AUTHENTICATION ====================

// Security: Rate limiting for login endpoint
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: { success: false, message: 'Too many login attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

// JWT Secret (no fallback - must be set in environment)
const JWT_SECRET = process.env.JWT_SECRET;

// JWT Authentication Middleware (supports both cookie and header)
const authenticateToken = (req, res, next) => {
  // Try to get token from cookie first, then from Authorization header
  let token = req.cookies.adminToken;

  if (!token) {
    const authHeader = req.headers['authorization'];
    token = authHeader && authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Helper function to log login attempts
const logLoginAttempt = async (username, success, ip, userAgent) => {
  try {
    await promisePool.execute(
      `INSERT INTO login_attempts (username, success, ip_address, user_agent, attempted_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [username, success, ip, userAgent]
    );
  } catch (error) {
    console.error('Error logging login attempt:', error);
  }
};

// Admin Login Endpoint (with rate limiting)
app.post('/api/admin/login', loginLimiter, async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('user-agent') || 'Unknown';

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    // Get user from database
    const [users] = await promisePool.execute(
      'SELECT * FROM admin_users WHERE username = ? AND is_active = TRUE',
      [username]
    );

    if (users.length === 0) {
      // Log failed attempt
      await logLoginAttempt(username, false, ip, userAgent);
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const user = users[0];

    // Compare password with bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      // Log failed attempt
      await logLoginAttempt(username, false, ip, userAgent);
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    // Update last login time
    await promisePool.execute(
      'UPDATE admin_users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    // Log successful attempt
    await logLoginAttempt(username, true, ip, userAgent);

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set token in httpOnly cookie
    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Return success with token (for backward compatibility) and user info
    res.json({
      success: true,
      token, // Still send token for clients that don't support cookies
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    // Log failed attempt
    await logLoginAttempt(req.body.username || 'unknown', false, ip, userAgent);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
});

// Verify Token Endpoint (optional - for checking if user is still authenticated)
app.get('/api/admin/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      username: req.user.username,
      role: req.user.role
    }
  });
});

// Logout Endpoint (clears cookie)
app.post('/api/admin/logout', (req, res) => {
  res.clearCookie('adminToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.json({ success: true, message: 'Logged out successfully' });
});

// ==================== END ADMIN AUTHENTICATION ====================

// Email templates
const sendCustomerConfirmationEmail = async (booking, customer, car) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: customer.email,
    subject: 'Booking Confirmation - Al-Fakhama Car Rental',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1e3a8a 0%, #475569 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-label { font-weight: bold; color: #1e3a8a; }
          .total { font-size: 20px; color: #1e3a8a; font-weight: bold; padding-top: 15px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚗 Booking Confirmed!</h1>
            <p>Thank you for choosing Al-Fakhama Car Rental</p>
          </div>
          <div class="content">
            <p>Dear <strong>${customer.full_name}</strong>,</p>
            <p>Your booking has been successfully confirmed. Here are your booking details:</p>

            <div class="booking-details">
              <h2 style="color: #1e3a8a; margin-top: 0;">Booking Information</h2>
              <div class="detail-row">
                <span class="detail-label">Booking ID:</span>
                <span>#${booking.rental_id}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Car:</span>
                <span>${car.car_barnd} ${car.car_type} (${car.car_model})</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Pickup Date:</span>
                <span>${booking.rental_start}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Return Date:</span>
                <span>${booking.rental_end}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Rental Type:</span>
                <span>${booking.rental_type}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Insurance:</span>
                <span>${booking.insurance_type}</span>
              </div>
              ${booking.additional_services ? `
              <div class="detail-row">
                <span class="detail-label">Additional Services:</span>
                <span>${JSON.parse(booking.additional_services).join(', ')}</span>
              </div>
              ` : ''}
              <div class="detail-row total">
                <span class="detail-label">Total Price:</span>
                <span>JOD ${booking.total_price}</span>
              </div>
            </div>
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <p style="margin: 0;"><strong>⚠️ Important:</strong></p>
              <p style="margin: 5px 0 0 0;">Please bring your driver's license and the documents you uploaded when picking up the vehicle.</p>
            </div>

            <div style="margin-top: 20px; text-align: center;">
              <p>If you have any questions, please contact us:</p>
              <p><strong>📞 Phone:</strong> +962 7 9999 9999</p>
              <p><strong>📧 Email:</strong> ${process.env.EMAIL_USER}</p>
            </div>
          </div>
          <div class="footer">
            <p>Al-Fakhama Car Rental - Premium Car Rental Service</p>
            <p>This is an automated email, please do not reply directly to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  return transporter.sendMail(mailOptions);
};

const sendAdminNotificationEmail = async (booking, customer, car) => {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: adminEmail,
    subject: `New Booking #${booking.rental_id} - ${customer.full_name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 700px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .section { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          .label { font-weight: bold; color: #dc2626; min-width: 150px; }
          .alert { background: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 New Booking Received</h1>
            <p>Action Required: Review booking details</p>
          </div>
          <div class="content">
            <div class="alert">
              <strong>⚡ New booking #${booking.rental_id} requires your attention</strong>
            </div>

            <div class="section">
              <h2 style="color: #dc2626; margin-top: 0;">Customer Information</h2>
              <div class="detail-row">
                <span class="label">Name:</span>
                <span>${customer.full_name}</span>
              </div>
              <div class="detail-row">
                <span class="label">Email:</span>
                <span>${customer.email}</span>
              </div>
              <div class="detail-row">
                <span class="label">Phone:</span>
                <span>${customer.phone}</span>
              </div>
              <div class="detail-row">
                <span class="label">Address:</span>
                <span>${customer.address}</span>
              </div>
              <div class="detail-row">
                <span class="label">Driver's License:</span>
                <span>${customer.driver_license}</span>
              </div>
            </div>

            <div class="section">
              <h2 style="color: #dc2626; margin-top: 0;">Booking Details</h2>
              <div class="detail-row">
                <span class="label">Booking ID:</span>
                <span>#${booking.rental_id}</span>
              </div>
              <div class="detail-row">
                <span class="label">Car:</span>
                <span>${car.car_barnd} ${car.car_type} (${car.car_model}) - ${car.car_color}</span>
              </div>
              <div class="detail-row">
                <span class="label">Car Number:</span>
                <span>${car.car_num}</span>
              </div>
              <div class="detail-row">
                <span class="label">Pickup Date:</span>
                <span>${booking.rental_start}</span>
              </div>
              <div class="detail-row">
                <span class="label">Return Date:</span>
                <span>${booking.rental_end}</span>
              </div>
              <div class="detail-row">
                <span class="label">Rental Type:</span>
                <span>${booking.rental_type}</span>
              </div>
              <div class="detail-row">
                <span class="label">Insurance:</span>
                <span>${booking.insurance_type}</span>
              </div>
              ${booking.additional_services ? `
              <div class="detail-row">
                <span class="label">Additional Services:</span>
                <span>${JSON.parse(booking.additional_services).join(', ')}</span>
              </div>
              ` : ''}
              <div class="detail-row" style="font-size: 18px; color: #dc2626; font-weight: bold; border: none; padding-top: 15px;">
                <span class="label">Total Price:</span>
                <span>JOD ${booking.total_price}</span>
              </div>
            </div>

            ${booking.id_document || booking.passport_document ? `
            <div class="section">
              <h2 style="color: #dc2626; margin-top: 0;">📎 Uploaded Documents</h2>
              ${booking.id_document ? `<p>✓ ID Document: ${booking.id_document}</p>` : ''}
              ${booking.passport_document ? `<p>✓ Passport Document: ${booking.passport_document}</p>` : ''}
              <p style="color: #6b7280; font-size: 14px;">Documents are stored in the /uploads folder on the server</p>
            </div>
            ` : ''}

            <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <p style="margin: 0; color: #1e40af;"><strong>📋 Next Steps:</strong></p>
              <ol style="margin: 10px 0 0 0; color: #1e40af;">
                <li>Review the customer documents</li>
                <li>Verify car availability</li>
                <li>Contact customer to confirm pickup details</li>
                <li>Update booking status in admin panel</li>
              </ol>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  };

  return transporter.sendMail(mailOptions);
};

// API Routes

// Get all cars
app.get('/api/cars', async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM cars';
    const params = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY id DESC';

    const [rows] = await promisePool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching cars:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch cars' });
  }
});

// Get car by ID
app.get('/api/cars/:id', async (req, res) => {
  try {
    const [rows] = await promisePool.query('SELECT * FROM cars WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Car not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching car:', error);
    res.status(500).json({ error: 'Failed to fetch car' });
  }
});

// Get available cars
app.get('/api/cars/status/available', async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      'SELECT * FROM cars WHERE status = ? ORDER BY id DESC',
      ['available']
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching available cars:', error);
    res.status(500).json({ error: 'Failed to fetch available cars' });
  }
});

// Delete car
app.delete('/api/cars/:id', async (req, res) => {
  try {
    const [result] = await promisePool.query('DELETE FROM cars WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Car not found' });
    }

    res.json({ success: true, message: 'Car deleted successfully' });
  } catch (error) {
    console.error('Error deleting car:', error);
    res.status(500).json({ success: false, error: 'Failed to delete car' });
  }
});

// Create/Update car (admin endpoint)
app.post('/api/cars', async (req, res) => {
  try {
    const { car_barnd, car_type, car_model, car_num, price_per_day, price_per_week, price_per_month, car_color, mileage, status, image_url } = req.body;

    const [result] = await promisePool.query(
      'INSERT INTO cars (car_barnd, car_type, car_model, car_num, price_per_day, price_per_week, price_per_month, car_color, mileage, status, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [car_barnd, car_type, car_model, car_num, price_per_day, price_per_week, price_per_month, car_color, mileage, status || 'available', image_url]
    );

    res.status(201).json({ success: true, message: 'Car created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating car:', error);
    res.status(500).json({ success: false, error: 'Failed to create car' });
  }
});

// Update car (bardo admin endpoint)
app.put('/api/cars/:id', async (req, res) => {
  try {
    const { car_barnd, car_type, car_model, car_num, price_per_day, price_per_week, price_per_month, car_color, mileage, status, image_url } = req.body;

    const [result] = await promisePool.query(
      'UPDATE cars SET car_barnd = ?, car_type = ?, car_model = ?, car_num = ?, price_per_day = ?, price_per_week = ?, price_per_month = ?, car_color = ?, mileage = ?, status = ?, image_url = ? WHERE id = ?',
      [car_barnd, car_type, car_model, car_num, price_per_day, price_per_week, price_per_month, car_color, mileage, status, image_url, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Car not found' });
    }

    res.json({ success: true, message: 'Car updated successfully' });
  } catch (error) {
    console.error('Error updating car:', error);
    res.status(500).json({ success: false, error: 'Failed to update car' });
  }
});

// Create a new rental/booking
app.post('/api/rentals', async (req, res) => {
  const connection = await promisePool.getConnection();

  try {
    await connection.beginTransaction();

    const { car_id, customer, rental_start, rental_end, rental_type, total_price } = req.body;

    // Check if car is available
    const [carRows] = await connection.query('SELECT status FROM cars WHERE id = ?', [car_id]);
    if (carRows.length === 0) {
      throw new Error('Car not found');
    }
    if (carRows[0].status !== 'available') {
      throw new Error('Car is not available');
    }

    // Insert or get customer
    let customer_id;
    const [existingCustomer] = await connection.query(
      'SELECT id FROM customers WHERE email = ?',
      [customer.email]
    );

    if (existingCustomer.length > 0) {
      customer_id = existingCustomer[0].id;
      // Update customer info
      await connection.query(
        'UPDATE customers SET full_name = ?, phone = ?, address = ?, driver_license = ? WHERE id = ?',
        [customer.full_name, customer.phone, customer.address, customer.driver_license, customer_id]
      );
    } else {
      const [result] = await connection.query(
        'INSERT INTO customers (full_name, email, phone, address, driver_license) VALUES (?, ?, ?, ?, ?)',
        [customer.full_name, customer.email, customer.phone, customer.address, customer.driver_license]
      );
      customer_id = result.insertId;
    }

    // Create rental
    const [rentalResult] = await connection.query(
      'INSERT INTO rentals (car_id, customer_id, rental_start, rental_end, rental_type, total_price, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [car_id, customer_id, rental_start, rental_end, rental_type, total_price, 'active']
    );

    // Update car status
    await connection.query('UPDATE cars SET status = ? WHERE id = ?', ['rented', car_id]);

    await connection.commit();

    res.status(201).json({
      message: 'Rental created successfully',
      rental_id: rentalResult.insertId
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating rental:', error);
    res.status(500).json({ error: error.message || 'Failed to create rental' });
  } finally {
    connection.release();
  }
});

// Get all rentals
app.get('/api/rentals', async (req, res) => {
  try {
    const [rows] = await promisePool.query(`
      SELECT r.*, c.full_name, c.email, c.phone,
             cars.car_barnd, cars.car_type, cars.car_model, cars.car_num
      FROM rentals r
      JOIN customers c ON r.customer_id = c.id
      JOIN cars ON r.car_id = cars.id
      ORDER BY r.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching rentals:', error);
    res.status(500).json({ error: 'Failed to fetch rentals' });
  }
});

// Get rental by ID
app.get('/api/rentals/:id', async (req, res) => {
  try {
    const [rows] = await promisePool.query(`
      SELECT r.*, c.full_name, c.email, c.phone, c.address, c.driver_license,
             cars.car_barnd, cars.car_type, cars.car_model, cars.car_num, cars.car_color
      FROM rentals r
      JOIN customers c ON r.customer_id = c.id
      JOIN cars ON r.car_id = cars.id
      WHERE r.id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Rental not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching rental:', error);
    res.status(500).json({ error: 'Failed to fetch rental' });
  }
});

// Complete rental (return car)
app.patch('/api/rentals/:id/complete', async (req, res) => {
  const connection = await promisePool.getConnection();

  try {
    await connection.beginTransaction();

    const [rental] = await connection.query('SELECT car_id FROM rentals WHERE id = ?', [req.params.id]);
    if (rental.length === 0) {
      throw new Error('Rental not found');
    }

    await connection.query('UPDATE rentals SET status = ? WHERE id = ?', ['completed', req.params.id]);
    await connection.query('UPDATE cars SET status = ? WHERE id = ?', ['available', rental[0].car_id]);

    await connection.commit();

    res.json({ message: 'Rental completed successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error completing rental:', error);
    res.status(500).json({ error: error.message || 'Failed to complete rental' });
  } finally {
    connection.release();
  }
});

// Contact form submission
app.post('/api/contact', verifyRecaptcha, async (req, res) => {
  try {
    const { name, email, message } = req.body;

    await promisePool.query(
      'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)',
      [name, email, message]
    );

    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error saving contact message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get all contact messages (admin endpoint)
app.get('/api/contact-messages', async (req, res) => {
  try {
    const [rows] = await promisePool.query(`
      SELECT
        id as message_id,
        name,
        email,
        message,
        status,
        created_at
      FROM contact_messages
      ORDER BY created_at DESC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch messages' });
  }
});

// Update contact message status (admin endpoint)
app.patch('/api/contact-messages/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const [result] = await promisePool.query(
      'UPDATE contact_messages SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }

    res.json({ success: true, message: 'Message status updated successfully' });
  } catch (error) {
    console.error('Error updating message status:', error);
    res.status(500).json({ success: false, error: 'Failed to update message status' });
  }
});

// Create a new booking with file uploads
app.post('/api/bookings', upload.fields([
  { name: 'idDocument', maxCount: 1 },
  { name: 'passportDocument', maxCount: 1 }
]), async (req, res) => {
  // Verify reCAPTCHA for multipart form data
  const recaptchaToken = req.body.recaptchaToken;
  if (!recaptchaToken) {
    return res.status(400).json({ success: false, error: 'reCAPTCHA token is required' });
  }

  try {
    const recaptchaResponse = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
      params: {
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: recaptchaToken
      }
    });

    if (!recaptchaResponse.data.success) {
      return res.status(400).json({ success: false, error: 'reCAPTCHA verification failed' });
    }
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return res.status(500).json({ success: false, error: 'reCAPTCHA verification error' });
  }

  const connection = await promisePool.getConnection();

  try {
    await connection.beginTransaction();

    const bookingData = JSON.parse(req.body.bookingData);
    const { car, pickupDate, returnDate, days, insurance, additionalServices, customerInfo, pricing } = bookingData;

    // Get uploaded file paths
    const idDocumentPath = req.files?.idDocument?.[0]?.filename || null;
    const passportDocumentPath = req.files?.passportDocument?.[0]?.filename || null;

    // Check if car is available
    const [carRows] = await connection.query('SELECT status FROM cars WHERE id = ?', [car.id]);
    if (carRows.length === 0) {
      throw new Error('Car not found');
    }
    if (carRows[0].status !== 'available') {
      throw new Error('Car is not available');
    }

    // Prepare address string
    const address = `${customerInfo.street}, ${customerInfo.city}${customerInfo.area ? ', ' + customerInfo.area : ''}${customerInfo.postalCode ? ', ' + customerInfo.postalCode : ''}, ${customerInfo.country}`;

    // Insert or get customer
    let customer_id;
    const [existingCustomer] = await connection.query(
      'SELECT id FROM customers WHERE email = ?',
      [customerInfo.email]
    );

    if (existingCustomer.length > 0) {
      customer_id = existingCustomer[0].id;
      // Update customer info
      await connection.query(
        'UPDATE customers SET full_name = ?, phone = ?, address = ?, driver_license = ? WHERE id = ?',
        [customerInfo.name, customerInfo.phone, address, customerInfo.license, customer_id]
      );
    } else {
      const [result] = await connection.query(
        'INSERT INTO customers (full_name, email, phone, address, driver_license) VALUES (?, ?, ?, ?, ?)',
        [customerInfo.name, customerInfo.email, customerInfo.phone, address, customerInfo.license]
      );
      customer_id = result.insertId;
    }

    // Determine rental type based on days
    let rental_type = 'daily';
    if (days >= 30) rental_type = 'monthly';
    else if (days >= 7) rental_type = 'weekly';

    // Create rental with additional data
    const [rentalResult] = await connection.query(
      `INSERT INTO rentals (car_id, customer_id, rental_start, rental_end, rental_type, total_price, status, insurance_type, additional_services, id_document, passport_document)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        car.id,
        customer_id,
        pickupDate,
        returnDate,
        rental_type,
        pricing.total,
        'pending',
        insurance,
        JSON.stringify(additionalServices),
        idDocumentPath,
        passportDocumentPath
      ]
    );

    // Update car status to rented
    await connection.query('UPDATE cars SET status = ? WHERE id = ?', ['rented', car.id]);

    await connection.commit();

    // Fetch complete booking data for emails
    const [customerData] = await connection.query('SELECT * FROM customers WHERE id = ?', [customer_id]);
    const [carData] = await connection.query('SELECT * FROM cars WHERE id = ?', [car.id]);

    const bookingEmailData = {
      rental_id: rentalResult.insertId,
      rental_start: pickupDate,
      rental_end: returnDate,
      rental_type,
      total_price: pricing.total,
      insurance_type: insurance,
      additional_services: JSON.stringify(additionalServices),
      id_document: idDocumentPath,
      passport_document: passportDocumentPath
    };

    // Send emails asynchronously (don't wait for them)
    Promise.all([
      sendCustomerConfirmationEmail(bookingEmailData, customerData[0], carData[0]),
      sendAdminNotificationEmail(bookingEmailData, customerData[0], carData[0])
    ]).then(() => {
      console.log('Booking confirmation emails sent successfully');
    }).catch((error) => {
      console.error('Error sending booking emails:', error);
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      rental_id: rentalResult.insertId
    });
  } catch (error) {
    await connection.rollback();

    // Delete uploaded files if booking failed
    if (req.files?.idDocument?.[0]) {
      fs.unlinkSync(path.join(uploadsDir, req.files.idDocument[0].filename));
    }
    if (req.files?.passportDocument?.[0]) {
      fs.unlinkSync(path.join(uploadsDir, req.files.passportDocument[0].filename));
    }

    console.error('Error creating booking:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to create booking' });
  } finally {
    connection.release();
  }
});

// Get all bookings (admin endpoint)
app.get('/api/bookings', async (req, res) => {
  try {
    const [rows] = await promisePool.query(`
      SELECT
        r.id as booking_id,
        r.car_id,
        r.customer_id,
        r.rental_start as pickup_date,
        r.rental_end as return_date,
        DATEDIFF(r.rental_end, r.rental_start) as days,
        r.rental_type,
        r.total_price,
        r.status,
        r.insurance_type,
        r.additional_services,
        r.id_document,
        r.passport_document,
        r.created_at,
        r.updated_at,
        c.full_name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        c.address,
        c.driver_license as customer_license,
        cars.car_barnd as car_brand,
        cars.car_type,
        cars.car_model,
        cars.car_num,
        cars.car_color,
        cars.price_per_day,
        cars.price_per_week,
        cars.price_per_month
      FROM rentals r
      JOIN customers c ON r.customer_id = c.id
      JOIN cars ON r.car_id = cars.id
      ORDER BY r.created_at DESC
    `);

    // Parse address and calculate pricing breakdown for each booking
    const bookingsWithDetails = rows.map(booking => {
      // Parse address
      const addressParts = booking.address ? booking.address.split(', ') : [];
      const street = addressParts[0] || '';
      const city = addressParts[1] || '';
      const area = addressParts[2] || '';
      const country = addressParts[addressParts.length - 1] || '';
      const postal_code = addressParts.length > 3 ? addressParts[addressParts.length - 2] : '';

      // Calculate pricing breakdown
      let basePrice = 0;
      const days = booking.days || 1;

      if (booking.rental_type === 'monthly') {
        const months = Math.ceil(days / 30);
        basePrice = booking.price_per_month * months;
      } else if (booking.rental_type === 'weekly') {
        const weeks = Math.ceil(days / 7);
        basePrice = booking.price_per_week * weeks;
      } else {
        basePrice = booking.price_per_day * days;
      }

      // Calculate insurance price
      const insurancePricePerDay = booking.insurance_type === 'premium' ? 15
        : booking.insurance_type === 'full' ? 10
        : 5;
      const insurancePrice = insurancePricePerDay * days;

      // Calculate services price
      let servicesPrice = 0;
      if (booking.additional_services) {
        try {
          const services = JSON.parse(booking.additional_services);
          const servicePrices = {
            phone: 3,
            wifi: 2,
            gps: 2,
            childSeat: 1,
            airportPickup: 25 // one-time fee
          };

          services.forEach(service => {
            if (service === 'airportPickup') {
              servicesPrice += servicePrices[service];
            } else {
              servicesPrice += (servicePrices[service] || 0) * days;
            }
          });
        } catch (e) {
          console.error('Error parsing services:', e);
        }
      }

      return {
        ...booking,
        street,
        city,
        area,
        country,
        postal_code,
        base_price: basePrice,
        insurance_price: insurancePrice,
        services_price: servicesPrice
      };
    });

    res.json({ success: true, data: bookingsWithDetails });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch bookings' });
  }
});

// Get booking by ID
app.get('/api/bookings/:id', async (req, res) => {
  try {
    const [rows] = await promisePool.query(`
      SELECT r.*, c.full_name, c.email, c.phone, c.address, c.driver_license,
             cars.car_barnd, cars.car_type, cars.car_model, cars.car_num, cars.car_color
      FROM rentals r
      JOIN customers c ON r.customer_id = c.id
      JOIN cars ON r.car_id = cars.id
      WHERE r.id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// Update booking status
app.patch('/api/bookings/:id/status', async (req, res) => {
  const connection = await promisePool.getConnection();

  try {
    await connection.beginTransaction();

    const { status } = req.body;
    const [rental] = await connection.query('SELECT car_id FROM rentals WHERE id = ?', [req.params.id]);

    if (rental.length === 0) {
      throw new Error('Booking not found');
    }

    await connection.query('UPDATE rentals SET status = ? WHERE id = ?', [status, req.params.id]);

    // Update car status based on rental status
    if (status === 'completed' || status === 'cancelled') {
      await connection.query('UPDATE cars SET status = ? WHERE id = ?', ['available', rental[0].car_id]);
    } else if (status === 'active') {
      await connection.query('UPDATE cars SET status = ? WHERE id = ?', ['rented', rental[0].car_id]);
    }

    await connection.commit();

    res.json({ success: true, message: 'Booking status updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating booking status:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to update booking status' });
  } finally {
    connection.release();
  }
});

// Admin statistics endpoint
app.get('/api/admin/stats', async (req, res) => {
  try {
    const [totalCars] = await promisePool.query('SELECT COUNT(*) as count FROM cars');
    const [availableCars] = await promisePool.query('SELECT COUNT(*) as count FROM cars WHERE status = ?', ['available']);
    const [rentedCars] = await promisePool.query('SELECT COUNT(*) as count FROM cars WHERE status = ?', ['rented']);
    const [totalBookings] = await promisePool.query('SELECT COUNT(*) as count FROM rentals');
    const [activeBookings] = await promisePool.query('SELECT COUNT(*) as count FROM rentals WHERE status = ?', ['active']);
    const [pendingBookings] = await promisePool.query('SELECT COUNT(*) as count FROM rentals WHERE status = ?', ['pending']);
    const [confirmedBookings] = await promisePool.query('SELECT COUNT(*) as count FROM rentals WHERE status = ?', ['completed']);
    const [totalRevenue] = await promisePool.query('SELECT SUM(total_price) as total FROM rentals WHERE status IN (?, ?)', ['active', 'completed']);
    const [newMessages] = await promisePool.query('SELECT COUNT(*) as count FROM contact_messages WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)');
    const [recentBookings] = await promisePool.query(`
      SELECT r.id as booking_id, c.full_name as customer_name,
             cars.car_barnd as car_brand, cars.car_type,
             r.rental_start as pickup_date, r.total_price, r.status
      FROM rentals r
      JOIN customers c ON r.customer_id = c.id
      JOIN cars ON r.car_id = cars.id
      ORDER BY r.created_at DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      stats: {
        cars: {
          total: totalCars[0].count,
          available: availableCars[0].count,
          rented: rentedCars[0].count
        },
        bookings: {
          total: totalBookings[0].count,
          active: activeBookings[0].count,
          pending: pendingBookings[0].count,
          confirmed: confirmedBookings[0].count
        },
        revenue: {
          total: parseFloat(totalRevenue[0].total) || 0
        },
        messages: {
          new: newMessages[0].count
        },
        recentBookings: recentBookings
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch statistics' });
  }
});

// Reviews/Testimonials endpoints

// Get approved reviews for public display
app.get('/api/reviews', async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      'SELECT id, customer_name, rating, comment, created_at FROM reviews WHERE status = ? ORDER BY is_featured DESC, created_at DESC',
      ['approved']
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Get all reviews (admin)
app.get('/api/admin/reviews', async (req, res) => {
  try {
    const [rows] = await promisePool.query(
      'SELECT * FROM reviews ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Submit review (customer endpoint - pending approval) with reCAPTCHA verification
app.post('/api/reviews/submit', verifyRecaptcha, async (req, res) => {
  try {
    const { customer_name, rating, comment } = req.body;

    if (!customer_name || !rating || !comment) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
    }

    const [result] = await promisePool.query(
      'INSERT INTO reviews (customer_name, rating, comment, is_featured, status) VALUES (?, ?, ?, ?, ?)',
      [customer_name, rating, comment, false, 'pending']
    );

    res.status(201).json({ success: true, message: 'Review submitted successfully', id: result.insertId });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ success: false, error: 'Failed to submit review' });
  }
});

// Create review (admin)
app.post('/api/reviews', async (req, res) => {
  try {
    const { customer_name, rating, comment, is_featured, status } = req.body;

    const [result] = await promisePool.query(
      'INSERT INTO reviews (customer_name, rating, comment, is_featured, status) VALUES (?, ?, ?, ?, ?)',
      [customer_name, rating, comment, is_featured || false, status || 'approved']
    );

    res.status(201).json({ success: true, message: 'Review created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ success: false, error: 'Failed to create review' });
  }
});

// Update review (admin)
app.put('/api/reviews/:id', async (req, res) => {
  try {
    const { customer_name, rating, comment, is_featured, status } = req.body;

    const [result] = await promisePool.query(
      'UPDATE reviews SET customer_name = ?, rating = ?, comment = ?, is_featured = ?, status = ? WHERE id = ?',
      [customer_name, rating, comment, is_featured, status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    res.json({ success: true, message: 'Review updated successfully' });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ success: false, error: 'Failed to update review' });
  }
});

// Delete review (admin)
app.delete('/api/reviews/:id', async (req, res) => {
  try {
    const [result] = await promisePool.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ success: false, error: 'Failed to delete review' });
  }
});

// Serve React app for all other routes (production only)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

//Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
