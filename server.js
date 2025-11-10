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
import XLSX from 'xlsx';

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

// CRITICAL: Trust proxy when running behind cPanel/Apache/Nginx
// This is required for express-rate-limit to work correctly
app.set('trust proxy', true);

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
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://www.google.com', 'https://www.gstatic.com', 'https://challenges.cloudflare.com'],
      frameSrc: ["'self'", 'https://www.google.com', 'https://challenges.cloudflare.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'http://localhost:*', 'http://192.168.1.124:*'],
      connectSrc: ["'self'", 'https://challenges.cloudflare.com'],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin images
}));

// Security: CORS with allowed origins
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc, same-origin requests)
    if (!origin) return callback(null, true);

    // Check if origin is in allowed list
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      // Exact match
      if (allowedOrigin === origin) return true;
      // Also check without protocol (handle http vs https)
      const originWithoutProtocol = origin.replace(/^https?:\/\//, '');
      const allowedWithoutProtocol = allowedOrigin.replace(/^https?:\/\//, '');
      return originWithoutProtocol === allowedWithoutProtocol;
    });

    if (!isAllowed) {
      console.warn(`CORS blocked origin: ${origin}`);
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
// Skip HTTPS redirect for API routes to prevent redirect responses on POST requests
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    // Skip redirect for API and uploads routes
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }

    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
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
  host: process.env.EMAIL_HOST || 'al-fakhamah-car-rent.com',
  port: parseInt(process.env.EMAIL_PORT) || 465,
  secure: process.env.EMAIL_SECURE === 'true' || true, // true for 465, false for 587
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

// reCAPTCHA verification middleware (Legacy)
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

// Cloudflare Turnstile verification middleware
const verifyTurnstile = async (req, res, next) => {
  const turnstileToken = req.body.turnstileToken;

  if (!turnstileToken) {
    return res.status(400).json({ success: false, error: 'Turnstile token is required' });
  }

  try {
    const response = await axios.post('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: turnstileToken,
      remoteip: req.ip || req.connection.remoteAddress
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.data.success) {
      console.error('Turnstile verification failed:', response.data);
      return res.status(400).json({
        success: false,
        error: 'Turnstile verification failed',
        errors: response.data['error-codes']
      });
    }

    // Turnstile verified successfully, continue to next middleware
    next();
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return res.status(500).json({ success: false, error: 'Turnstile verification error' });
  }
};




// ==================== COMPREHENSIVE ERROR HANDLING UTILITY ====================

/**
 * Enhanced error handler for development debugging
 * Provides detailed error information including stack traces in development mode
 * @param {Error} error - The error object
 * @param {string} context - Context where error occurred (e.g., 'Login endpoint', 'Create booking')
 * @param {object} req - Express request object
 * @param {object} additionalInfo - Any additional debugging information
 */
const logDetailedError = (error, context, req = null, additionalInfo = {}) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  const errorDetails = {
    timestamp: new Date().toISOString(),
    context,
    error: {
      message: error.message,
      name: error.name,
      code: error.code,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage,
      stack: isDevelopment ? error.stack : undefined
    },
    request: req ? {
      method: req.method,
      url: req.originalUrl,
      body: req.body,
      params: req.params,
      query: req.query,
      ip: req.ip,
      userAgent: req.get('user-agent')
    } : undefined,
    ...additionalInfo
  };

  console.error('\n==================== ERROR DETAILS ====================');
  console.error(JSON.stringify(errorDetails, null, 2));
  console.error('======================================================\n');

  return errorDetails;
};

/**
 * Send error response with detailed information in development mode
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - User-friendly error message
 * @param {object} errorDetails - Detailed error information from logDetailedError
 */
const sendErrorResponse = (res, statusCode, message, errorDetails = null) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  const response = {
    success: false,
    error: message,
    ...(isDevelopment && errorDetails ? { debug: errorDetails } : {})
  };

  return res.status(statusCode).json(response);
};

// ==================== ADMIN AUTHENTICATION ====================

// Security: Rate limiting for login endpoint
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // Limit each IP to 20 login requests per windowMs (more lenient for CGNAT)
  message: { success: false, message: 'Too many login attempts from this IP. Please try again after 10 minutes.' },
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

// Helper function to log admin actions
const logAdminAction = async (adminUser, action, entityType, entityId, description, oldData, newData, req) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent') || 'Unknown';

    await promisePool.execute(
      `INSERT INTO admin_action_logs
       (admin_id, admin_username, admin_role, action, entity_type, entity_id, description, old_data, new_data, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        adminUser.id,
        adminUser.username,
        adminUser.role,
        action,
        entityType,
        entityId,
        description,
        oldData ? JSON.stringify(oldData) : null,
        newData ? JSON.stringify(newData) : null,
        ip,
        userAgent
      ]
    );
  } catch (error) {
    console.error('Error logging admin action:', error);
  }
};

// Middleware to check if user has developer role
const requireDeveloperRole = (req, res, next) => {
  if (req.user.role !== 'developer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Developer role required.'
    });
  }
  next();
};

// Admin Login Endpoint (with rate limiting)
app.post('/api/admin/login', loginLimiter, async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('user-agent') || 'Unknown';

  console.log('[LOGIN] Request received:', { username: req.body?.username, ip, userAgent });

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    // Check username-based rate limiting (last 30 minutes)
    const [recentFailedAttempts] = await promisePool.execute(
      `SELECT COUNT(*) as failCount
       FROM login_attempts
       WHERE username = ?
       AND success = FALSE
       AND attempted_at > DATE_SUB(NOW(), INTERVAL 30 MINUTE)`,
      [username]
    );

    const failedAttempts = recentFailedAttempts[0].failCount;

    // Lock account after 10 failed attempts in 30 minutes
    if (failedAttempts >= 10) {
      await logLoginAttempt(username, false, ip, userAgent);
      return res.status(429).json({
        success: false,
        message: 'Account temporarily locked due to too many failed login attempts. Please try again in 30 minutes or contact support.'
      });
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

    // Log successful login attempt
    await logLoginAttempt(username, true, ip, userAgent);

    // Log admin action for successful login
    await logAdminAction(
      { id: user.id, username: user.username, role: user.role },
      'LOGIN',
      null,
      null,
      `User ${username} logged in successfully`,
      null,
      null,
      req
    );

    // Generate JWT token with extended expiration (30 days)
    // Session will be cleared on browser close via sessionStorage
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Set token in httpOnly cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-site in production (requires secure)
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: '/'
    };

    // Add domain in production if specified
    if (process.env.COOKIE_DOMAIN) {
      cookieOptions.domain = process.env.COOKIE_DOMAIN;
    }

    res.cookie('adminToken', token, cookieOptions);

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
    const errorDetails = logDetailedError(error, 'Admin Login', req, {
      attemptedUsername: req.body?.username,
      ip,
      userAgent
    });

    // Log failed attempt
    try {
      await logLoginAttempt(req.body.username || 'unknown', false, ip, userAgent);
    } catch (logError) {
      console.error('Failed to log login attempt:', logError);
    }

    return sendErrorResponse(
      res,
      500,
      'Login failed due to server error. Please try again or contact support.',
      errorDetails
    );
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
app.post('/api/admin/logout', authenticateToken, async (req, res) => {
  try {
    // Log admin action for logout
    await logAdminAction(
      req.user,
      'LOGOUT',
      null,
      null,
      `User ${req.user.username} logged out`,
      null,
      null,
      req
    );

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/'
    };

    if (process.env.COOKIE_DOMAIN) {
      cookieOptions.domain = process.env.COOKIE_DOMAIN;
    }

    res.clearCookie('adminToken', cookieOptions);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    // Still clear cookie even if logging fails
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/'
    };

    if (process.env.COOKIE_DOMAIN) {
      cookieOptions.domain = process.env.COOKIE_DOMAIN;
    }

    res.clearCookie('adminToken', cookieOptions);
    res.json({ success: true, message: 'Logged out successfully' });
  }
});

// ==================== END ADMIN AUTHENTICATION ====================

// Email templates
const sendCustomerConfirmationEmail = async (booking, customer, car) => {
  const mailOptions = {
    from: `Al-Fakhama Car Rental <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: customer.email,
    replyTo: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    subject: 'Booking Confirmation - Al-Fakhama Car Rental',
    headers: {
      'X-Mailer': 'Al-Fakhama Car Rental',
      'X-Priority': '1',
      'Importance': 'high'
    },
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
  // Support multiple admin emails separated by commas
  const adminEmails = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  const emailList = adminEmails.split(',').map(email => email.trim()).filter(email => email);

  const mailOptions = {
    from: `Al-Fakhama Car Rental <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: emailList.join(', '),
    replyTo: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    subject: `New Booking #${booking.rental_id} - ${customer.full_name}`,
    headers: {
      'X-Mailer': 'Al-Fakhama Car Rental',
      'X-Priority': '1',
      'Importance': 'high'
    },
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
    const { status, search, car_type, car_num } = req.query;
    let query = 'SELECT * FROM cars';
    const params = [];
    const conditions = [];

    // By default, only show available cars to public users
    // Admin can override with ?status=all or ?status=rented query parameter
    if (status && status !== 'all') {
      conditions.push('status = ?');
      params.push(status);
    } else if (!status) {
      // No status parameter = show only available cars
      conditions.push('status = ?');
      params.push('available');
    }
    // If status=all, show all cars (no status filter)

    // Search filter - searches across car_num, car_type, and car_barnd
    if (search) {
      conditions.push('(car_num LIKE ? OR car_type LIKE ? OR car_barnd LIKE ?)');
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    // Filter by specific car type
    if (car_type) {
      conditions.push('car_type LIKE ?');
      params.push(`%${car_type}%`);
    }

    // Filter by specific car number
    if (car_num) {
      conditions.push('car_num LIKE ?');
      params.push(`%${car_num}%`);
    }

    // Add WHERE clause if there are conditions
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY id DESC';

    const [rows] = await promisePool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    const errorDetails = logDetailedError(error, 'Get Cars', req, { filters: req.query });
    return sendErrorResponse(res, 500, 'Failed to fetch cars', errorDetails);
  }
});

// Get car by ID
app.get('/api/cars/:id', async (req, res) => {
  try {
    const [rows] = await promisePool.query('SELECT * FROM cars WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Car not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    const errorDetails = logDetailedError(error, 'Get Car by ID', req, { carId: req.params.id });
    return sendErrorResponse(res, 500, 'Failed to fetch car', errorDetails);
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
    const errorDetails = logDetailedError(error, 'Get Available Cars', req);
    return sendErrorResponse(res, 500, 'Failed to fetch available cars', errorDetails);
  }
});

// Delete car (admin endpoint)
app.delete('/api/cars/:id', authenticateToken, async (req, res) => {
  try {
    // Get car data before deletion for logging
    const [cars] = await promisePool.query('SELECT * FROM cars WHERE id = ?', [req.params.id]);
    const oldCarData = cars[0];

    const [result] = await promisePool.query('DELETE FROM cars WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Car not found' });
    }

    // Log the deletion
    await logAdminAction(
      req.user,
      'DELETE',
      'car',
      parseInt(req.params.id),
      `Deleted car: ${oldCarData?.car_barnd} ${oldCarData?.car_model} (${oldCarData?.car_num})`,
      oldCarData,
      null,
      req
    );

    res.json({ success: true, message: 'Car deleted successfully' });
  } catch (error) {
    const errorDetails = logDetailedError(error, 'Delete Car', req, {
      carId: req.params.id,
      adminUser: req.user
    });
    return sendErrorResponse(res, 500, 'Failed to delete car', errorDetails);
  }
});

// Create car with image upload (admin endpoint)
app.post('/api/cars', authenticateToken, upload.single('carImage'), async (req, res) => {
  try {
    const { car_barnd, car_type, car_model, car_num, price_per_day, price_per_week, price_per_month, car_color, mileage, status, car_category } = req.body;

    // Get uploaded image filename if exists
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    // Convert empty strings to null for optional fields
    const mileageValue = mileage && mileage !== '' ? mileage : null;
    const categoryValue = car_category && car_category !== '' ? car_category : null;
    const statusValue = status && status !== '' ? status : 'available';

    const [result] = await promisePool.query(
      'INSERT INTO cars (car_barnd, car_type, car_model, car_num, price_per_day, price_per_week, price_per_month, car_color, mileage, status, image_url, car_category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [car_barnd, car_type, car_model, car_num, price_per_day, price_per_week, price_per_month, car_color, mileageValue, statusValue, image_url, categoryValue]
    );

    const newCarData = {
      id: result.insertId,
      car_barnd, car_type, car_model, car_num,
      price_per_day, price_per_week, price_per_month,
      car_color, mileage: mileageValue, status: statusValue,
      image_url, car_category: categoryValue
    };

    // Log the creation
    await logAdminAction(
      req.user,
      'CREATE',
      'car',
      result.insertId,
      `Created car: ${car_barnd} ${car_model} (${car_num})`,
      null,
      newCarData,
      req
    );

    res.status(201).json({ success: true, message: 'Car created successfully', id: result.insertId });
  } catch (error) {
    // Delete uploaded file if car creation failed
    try {
      if (req.file) {
        fs.unlinkSync(path.join(uploadsDir, req.file.filename));
      }
    } catch (fileError) {
      console.error('Error deleting uploaded file:', fileError);
    }

    const errorDetails = logDetailedError(error, 'Create Car', req, {
      carData: req.body,
      uploadedFile: req.file?.filename,
      adminUser: req.user
    });

    return sendErrorResponse(res, 500, 'Failed to create car', errorDetails);
  }
});

// Update car with image upload (admin endpoint)
app.put('/api/cars/:id', authenticateToken, upload.single('carImage'), async (req, res) => {
  try {
    const { car_barnd, car_type, car_model, car_num, price_per_day, price_per_week, price_per_month, car_color, mileage, status, car_category } = req.body;

    // Get current car to check for old image and for logging
    const [currentCar] = await promisePool.query('SELECT * FROM cars WHERE id = ?', [req.params.id]);

    if (currentCar.length === 0) {
      // Delete uploaded file if car not found
      if (req.file) {
        fs.unlinkSync(path.join(uploadsDir, req.file.filename));
      }
      return res.status(404).json({ success: false, error: 'Car not found' });
    }

    // If new image uploaded, use it; otherwise keep the old one
    let image_url = currentCar[0].image_url;
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
      // Delete old image file if exists
      if (currentCar[0].image_url && currentCar[0].image_url.startsWith('/uploads/')) {
        const oldImagePath = path.join(__dirname, currentCar[0].image_url);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    // Convert empty strings to null for optional fields
    const mileageValue = mileage && mileage !== '' ? mileage : null;
    const categoryValue = car_category && car_category !== '' ? car_category : null;

    const [result] = await promisePool.query(
      'UPDATE cars SET car_barnd = ?, car_type = ?, car_model = ?, car_num = ?, price_per_day = ?, price_per_week = ?, price_per_month = ?, car_color = ?, mileage = ?, status = ?, image_url = ?, car_category = ? WHERE id = ?',
      [car_barnd, car_type, car_model, car_num, price_per_day, price_per_week, price_per_month, car_color, mileageValue, status, image_url, categoryValue, req.params.id]
    );

    const newCarData = {
      car_barnd, car_type, car_model, car_num,
      price_per_day, price_per_week, price_per_month,
      car_color, mileage: mileageValue, status,
      image_url, car_category: categoryValue
    };

    // Log the update
    await logAdminAction(
      req.user,
      'UPDATE',
      'car',
      parseInt(req.params.id),
      `Updated car: ${car_barnd} ${car_model} (${car_num})`,
      currentCar[0],
      newCarData,
      req
    );

    res.json({ success: true, message: 'Car updated successfully' });
  } catch (error) {
    console.error('Error updating car:', error);
    // Delete uploaded file if update failed
    if (req.file) {
      fs.unlinkSync(path.join(uploadsDir, req.file.filename));
    }
    res.status(500).json({ success: false, error: 'Failed to update car' });
  }
});

// Bulk upload car images (admin endpoint)
app.post('/api/cars/bulk-upload-images', authenticateToken, upload.array('carImages', 100), async (req, res) => {
  const uploadedFiles = req.files || [];
  const results = {
    success: [],
    failed: [],
    skipped: []
  };

  try {
    // Process each uploaded file
    for (const file of uploadedFiles) {
      try {
        // Extract car number from filename (e.g., "7041195.jpg" -> 7041195)
        const filenameWithoutExt = path.parse(file.filename).name;
        const originalFilenameWithoutExt = path.parse(file.originalname).name;

        // Try to extract car_num from original filename first (more reliable)
        const carNumMatch = originalFilenameWithoutExt.match(/(\d{7})/);

        if (!carNumMatch) {
          results.skipped.push({
            filename: file.originalname,
            reason: 'Could not extract 7-digit car number from filename. Please name files like "7041195.jpg"'
          });
          // Delete the uploaded file since we can't use it
          fs.unlinkSync(path.join(uploadsDir, file.filename));
          continue;
        }

        const car_num = parseInt(carNumMatch[1]);

        // Find car by car_num
        const [cars] = await promisePool.query('SELECT * FROM cars WHERE car_num = ?', [car_num]);

        if (cars.length === 0) {
          results.failed.push({
            filename: file.originalname,
            car_num,
            reason: `No car found with car number ${car_num}`
          });
          // Delete the uploaded file since we can't use it
          fs.unlinkSync(path.join(uploadsDir, file.filename));
          continue;
        }

        const car = cars[0];
        const image_url = `/uploads/${file.filename}`;

        // Delete old image file if exists
        if (car.image_url && car.image_url.startsWith('/uploads/')) {
          const oldImagePath = path.join(__dirname, car.image_url);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }

        // Update car with new image
        await promisePool.query(
          'UPDATE cars SET image_url = ? WHERE id = ?',
          [image_url, car.id]
        );

        // Log the update
        await logAdminAction(
          req.user,
          'UPDATE',
          'car',
          car.id,
          `Bulk uploaded image for car: ${car.car_barnd} ${car.car_model} (${car_num})`,
          { image_url: car.image_url },
          { image_url },
          req
        );

        results.success.push({
          filename: file.originalname,
          car_num,
          car: `${car.car_barnd} ${car.car_type} (${car.car_model})`
        });

      } catch (error) {
        console.error('Error processing file:', file.originalname, error);
        results.failed.push({
          filename: file.originalname,
          reason: error.message
        });
        // Try to delete the file if it still exists
        try {
          if (fs.existsSync(path.join(uploadsDir, file.filename))) {
            fs.unlinkSync(path.join(uploadsDir, file.filename));
          }
        } catch (unlinkError) {
          console.error('Error deleting file:', unlinkError);
        }
      }
    }

    res.json({
      success: true,
      message: `Processed ${uploadedFiles.length} files: ${results.success.length} uploaded, ${results.failed.length} failed, ${results.skipped.length} skipped`,
      results
    });

  } catch (error) {
    console.error('Error in bulk upload:', error);
    // Clean up any uploaded files
    uploadedFiles.forEach(file => {
      try {
        if (fs.existsSync(path.join(uploadsDir, file.filename))) {
          fs.unlinkSync(path.join(uploadsDir, file.filename));
        }
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    });
    res.status(500).json({ success: false, error: 'Bulk upload failed', details: error.message });
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
app.post('/api/contact', verifyTurnstile, async (req, res) => {
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
app.get('/api/contact-messages', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT
        id as message_id,
        name,
        email,
        message,
        status,
        created_at
      FROM contact_messages
    `;

    const params = [];

    // Add status filter based on query parameter
    if (status === 'all') {
      // Show all messages including archived
      // No WHERE clause needed
    } else if (status) {
      // Show specific status
      query += ' WHERE status = ?';
      params.push(status);
    } else {
      // Default: show all non-archived messages
      query += ' WHERE status != ?';
      params.push('archived');
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await promisePool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    const errorDetails = logDetailedError(error, 'Get Contact Messages', req, { filters: req.query });
    return sendErrorResponse(res, 500, 'Failed to fetch contact messages', errorDetails);
  }
});

// Update contact message status (admin endpoint)
app.patch('/api/contact-messages/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;

    // Get old status for logging
    const [messages] = await promisePool.query('SELECT status FROM contact_messages WHERE id = ?', [req.params.id]);
    const oldStatus = messages[0]?.status;

    const [result] = await promisePool.query(
      'UPDATE contact_messages SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }

    // Log the status change
    await logAdminAction(
      req.user,
      'STATUS_CHANGE',
      'message',
      parseInt(req.params.id),
      `Changed message #${req.params.id} status from "${oldStatus}" to "${status}"`,
      { status: oldStatus },
      { status },
      req
    );

    res.json({ success: true, message: 'Message status updated successfully' });
  } catch (error) {
    const errorDetails = logDetailedError(error, 'Update Contact Message Status', req, {
      messageId: req.params.id,
      newStatus: req.body.status,
      adminUser: req.user
    });
    return sendErrorResponse(res, 500, 'Failed to update message status', errorDetails);
  }
});

// Create a new booking with file uploads
app.post('/api/bookings', upload.fields([
  { name: 'idDocument', maxCount: 1 },
  { name: 'passportDocument', maxCount: 1 }
]), async (req, res) => {
  // Verify Turnstile for multipart form data
  const turnstileToken = req.body.turnstileToken;
  if (!turnstileToken) {
    return res.status(400).json({ success: false, error: 'Turnstile token is required' });
  }

  try {
    const turnstileResponse = await axios.post('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: turnstileToken,
      remoteip: req.ip || req.connection.remoteAddress
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!turnstileResponse.data.success) {
      console.error('Turnstile verification failed:', turnstileResponse.data);
      return res.status(400).json({
        success: false,
        error: 'Turnstile verification failed',
        errors: turnstileResponse.data['error-codes']
      });
    }
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return res.status(500).json({ success: false, error: 'Turnstile verification error' });
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

    // DO NOT mark car as rented yet - only after admin approval
    // Car status remains 'available' until admin approves the booking

    await connection.commit();

    // Fetch complete booking data for admin notification email ONLY
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

    // Send ONLY admin notification email - customer email will be sent after approval
    sendAdminNotificationEmail(bookingEmailData, customerData[0], carData[0])
      .then(() => {
        console.log('Admin notification email sent successfully');
      })
      .catch((error) => {
        console.error('Error sending admin notification email:', error);
      });

    res.status(201).json({
      success: true,
      message: 'Booking request submitted successfully. Please wait for admin confirmation.',
      rental_id: rentalResult.insertId
    });
  } catch (error) {
    await connection.rollback();

    // Delete uploaded files if booking failed
    try {
      if (req.files?.idDocument?.[0]) {
        fs.unlinkSync(path.join(uploadsDir, req.files.idDocument[0].filename));
      }
      if (req.files?.passportDocument?.[0]) {
        fs.unlinkSync(path.join(uploadsDir, req.files.passportDocument[0].filename));
      }
    } catch (fileError) {
      console.error('Error deleting uploaded files:', fileError);
    }

    const errorDetails = logDetailedError(error, 'Create Booking', req, {
      carId: req.body?.bookingData ? JSON.parse(req.body.bookingData)?.car?.id : null,
      uploadedFiles: {
        idDocument: req.files?.idDocument?.[0]?.filename,
        passportDocument: req.files?.passportDocument?.[0]?.filename
      }
    });

    return sendErrorResponse(
      res,
      500,
      error.message || 'Failed to create booking. Please try again or contact support.',
      errorDetails
    );
  } finally {
    connection.release();
  }
});

// Get all bookings (admin endpoint)
app.get('/api/bookings', authenticateToken, async (req, res) => {
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
            childSeat: 1
          };

          services.forEach(service => {
            servicesPrice += (servicePrices[service] || 0) * days;
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
    const errorDetails = logDetailedError(error, 'Get All Bookings', req);
    return sendErrorResponse(res, 500, 'Failed to fetch bookings', errorDetails);
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
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    const errorDetails = logDetailedError(error, 'Get Booking by ID', req, { bookingId: req.params.id });
    return sendErrorResponse(res, 500, 'Failed to fetch booking', errorDetails);
  }
});

// Update booking status (admin endpoint)
app.patch('/api/bookings/:id/status', authenticateToken, async (req, res) => {
  const connection = await promisePool.getConnection();

  try {
    await connection.beginTransaction();

    const { status } = req.body;

    // Get full booking details including customer and car information
    const [bookingRows] = await connection.query(`
      SELECT
        r.*,
        c.full_name, c.email, c.phone, c.address, c.driver_license,
        cars.car_barnd, cars.car_type, cars.car_model, cars.car_num, cars.car_color
      FROM rentals r
      JOIN customers c ON r.customer_id = c.id
      JOIN cars ON r.car_id = cars.id
      WHERE r.id = ?
    `, [req.params.id]);

    if (bookingRows.length === 0) {
      throw new Error('Booking not found');
    }

    const booking = bookingRows[0];

    // Update booking status
    await connection.query('UPDATE rentals SET status = ? WHERE id = ?', [status, req.params.id]);

    // Update car status based on rental status
    if (status === 'completed' || status === 'cancelled') {
      await connection.query('UPDATE cars SET status = ? WHERE id = ?', ['available', booking.car_id]);
    } else if (status === 'active') {
      // Admin approved the booking - mark car as rented
      await connection.query('UPDATE cars SET status = ? WHERE id = ?', ['rented', booking.car_id]);
    }

    await connection.commit();

    // Log the status change
    await logAdminAction(
      req.user,
      'STATUS_CHANGE',
      'booking',
      parseInt(req.params.id),
      `Changed booking #${req.params.id} status from "${booking.status}" to "${status}"`,
      { status: booking.status },
      { status },
      req
    );

    // If status is changed to 'active', send confirmation email to customer
    if (status === 'active') {
      const customerData = {
        full_name: booking.full_name,
        email: booking.email,
        phone: booking.phone,
        address: booking.address,
        driver_license: booking.driver_license
      };

      const carData = {
        car_barnd: booking.car_barnd,
        car_type: booking.car_type,
        car_model: booking.car_model,
        car_num: booking.car_num,
        car_color: booking.car_color
      };

      const bookingEmailData = {
        rental_id: booking.id,
        rental_start: booking.rental_start,
        rental_end: booking.rental_end,
        rental_type: booking.rental_type,
        total_price: booking.total_price,
        insurance_type: booking.insurance_type,
        additional_services: booking.additional_services,
        id_document: booking.id_document,
        passport_document: booking.passport_document
      };

      // Send confirmation email to customer asynchronously
      sendCustomerConfirmationEmail(bookingEmailData, customerData, carData)
        .then(() => {
          console.log(`Confirmation email sent to customer for booking #${booking.id}`);
        })
        .catch((error) => {
          console.error('Error sending customer confirmation email:', error);
        });
    }

    res.json({ success: true, message: 'Booking status updated successfully' });
  } catch (error) {
    await connection.rollback();

    const errorDetails = logDetailedError(error, 'Update Booking Status', req, {
      bookingId: req.params.id,
      newStatus: req.body.status,
      adminUser: req.user
    });

    return sendErrorResponse(
      res,
      500,
      error.message || 'Failed to update booking status',
      errorDetails
    );
  } finally {
    connection.release();
  }
});

// Admin statistics endpoint
app.get('/api/admin/stats', authenticateToken, async (req, res) => {
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
app.get('/api/admin/reviews', authenticateToken, async (req, res) => {
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

// Submit review (customer endpoint - pending approval) with Turnstile verification
app.post('/api/reviews/submit', verifyTurnstile, async (req, res) => {
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
app.post('/api/reviews', authenticateToken, async (req, res) => {
  try {
    const { customer_name, rating, comment, is_featured, status } = req.body;

    const [result] = await promisePool.query(
      'INSERT INTO reviews (customer_name, rating, comment, is_featured, status) VALUES (?, ?, ?, ?, ?)',
      [customer_name, rating, comment, is_featured || false, status || 'approved']
    );

    const newReviewData = {
      id: result.insertId,
      customer_name, rating, comment,
      is_featured: is_featured || false,
      status: status || 'approved'
    };

    // Log the creation
    await logAdminAction(
      req.user,
      'CREATE',
      'review',
      result.insertId,
      `Created review by ${customer_name} with ${rating} stars`,
      null,
      newReviewData,
      req
    );

    res.status(201).json({ success: true, message: 'Review created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ success: false, error: 'Failed to create review' });
  }
});

// Update review (admin)
app.put('/api/reviews/:id', authenticateToken, async (req, res) => {
  try {
    const { customer_name, rating, comment, is_featured, status } = req.body;

    // Get old review data for logging
    const [reviews] = await promisePool.query('SELECT * FROM reviews WHERE id = ?', [req.params.id]);
    const oldReviewData = reviews[0];

    const [result] = await promisePool.query(
      'UPDATE reviews SET customer_name = ?, rating = ?, comment = ?, is_featured = ?, status = ? WHERE id = ?',
      [customer_name, rating, comment, is_featured, status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    const newReviewData = {
      customer_name, rating, comment, is_featured, status
    };

    // Log the update
    await logAdminAction(
      req.user,
      'UPDATE',
      'review',
      parseInt(req.params.id),
      `Updated review #${req.params.id} by ${customer_name}`,
      oldReviewData,
      newReviewData,
      req
    );

    res.json({ success: true, message: 'Review updated successfully' });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ success: false, error: 'Failed to update review' });
  }
});

// Delete review (admin)
app.delete('/api/reviews/:id', authenticateToken, async (req, res) => {
  try {
    // Get review data before deletion for logging
    const [reviews] = await promisePool.query('SELECT * FROM reviews WHERE id = ?', [req.params.id]);
    const oldReviewData = reviews[0];

    const [result] = await promisePool.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    // Log the deletion
    await logAdminAction(
      req.user,
      'DELETE',
      'review',
      parseInt(req.params.id),
      `Deleted review #${req.params.id} by ${oldReviewData?.customer_name}`,
      oldReviewData,
      null,
      req
    );

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ success: false, error: 'Failed to delete review' });
  }
});

// ==================== DEVELOPER ROLE ENDPOINTS ====================

// Get all admin users (developer only)
app.get('/api/admin/users', authenticateToken, requireDeveloperRole, async (req, res) => {
  try {
    const [users] = await promisePool.query(
      'SELECT id, username, full_name, role, created_at, last_login, is_active FROM admin_users ORDER BY created_at DESC'
    );
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch admin users' });
  }
});

// Get action logs with filtering (developer only)
app.get('/api/admin/action-logs', authenticateToken, requireDeveloperRole, async (req, res) => {
  try {
    const { startDate, endDate, adminId, action, entityType, limit = 100, offset = 0 } = req.query;

    let query = 'SELECT * FROM admin_action_logs WHERE 1=1';
    const params = [];

    if (startDate) {
      query += ' AND created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND created_at <= ?';
      params.push(endDate);
    }

    if (adminId) {
      query += ' AND admin_id = ?';
      params.push(adminId);
    }

    if (action) {
      query += ' AND action = ?';
      params.push(action);
    }

    if (entityType) {
      query += ' AND entity_type = ?';
      params.push(entityType);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [logs] = await promisePool.query(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM admin_action_logs WHERE 1=1';
    const countParams = [];

    if (startDate) {
      countQuery += ' AND created_at >= ?';
      countParams.push(startDate);
    }

    if (endDate) {
      countQuery += ' AND created_at <= ?';
      countParams.push(endDate);
    }

    if (adminId) {
      countQuery += ' AND admin_id = ?';
      countParams.push(adminId);
    }

    if (action) {
      countQuery += ' AND action = ?';
      countParams.push(action);
    }

    if (entityType) {
      countQuery += ' AND entity_type = ?';
      countParams.push(entityType);
    }

    const [countResult] = await promisePool.query(countQuery, countParams);

    res.json({
      success: true,
      data: logs,
      total: countResult[0].total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching action logs:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch action logs' });
  }
});

// Export action logs to Excel (developer only)
app.get('/api/admin/action-logs/export', authenticateToken, requireDeveloperRole, async (req, res) => {
  try {
    const { startDate, endDate, adminId, action, entityType } = req.query;

    let query = 'SELECT * FROM admin_action_logs WHERE 1=1';
    const params = [];

    if (startDate) {
      query += ' AND created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND created_at <= ?';
      params.push(endDate);
    }

    if (adminId) {
      query += ' AND admin_id = ?';
      params.push(adminId);
    }

    if (action) {
      query += ' AND action = ?';
      params.push(action);
    }

    if (entityType) {
      query += ' AND entity_type = ?';
      params.push(entityType);
    }

    query += ' ORDER BY created_at DESC';

    const [logs] = await promisePool.query(query, params);

    // Get login attempts for separate sheet
    let loginQuery = 'SELECT * FROM login_attempts WHERE 1=1';
    const loginParams = [];

    if (startDate) {
      loginQuery += ' AND attempted_at >= ?';
      loginParams.push(startDate);
    }

    if (endDate) {
      loginQuery += ' AND attempted_at <= ?';
      loginParams.push(endDate);
    }

    loginQuery += ' ORDER BY attempted_at DESC';

    const [loginAttempts] = await promisePool.query(loginQuery, loginParams);

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Summary Sheet
    const summaryData = [
      ['Activity Report Summary'],
      ['Generated:', new Date().toLocaleString()],
      ['Generated By:', req.user.username],
      ['Date Range:', startDate || 'All', 'to', endDate || 'All'],
      [''],
      ['Total Actions:', logs.length],
      ['Total Login Attempts:', loginAttempts.length],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Detailed Actions Sheet
    const actionsData = logs.map(log => {
      // Helper function to safely parse JSON data
      const parseJsonData = (data) => {
        if (!data) return 'N/A';
        // If it's already an object, stringify it
        if (typeof data === 'object') return JSON.stringify(data);
        // If it's a string, try to parse and re-stringify
        try {
          return JSON.stringify(JSON.parse(data));
        } catch (e) {
          // If parsing fails, return as-is
          return data;
        }
      };

      return {
        'ID': log.id,
        'Timestamp': new Date(log.created_at).toLocaleString(),
        'Admin User': log.admin_username,
        'Role': log.admin_role,
        'Action': log.action,
        'Entity Type': log.entity_type || 'N/A',
        'Entity ID': log.entity_id || 'N/A',
        'Description': log.description,
        'Old Data': parseJsonData(log.old_data),
        'New Data': parseJsonData(log.new_data),
        'IP Address': log.ip_address,
        'User Agent': log.user_agent
      };
    });

    if (actionsData.length > 0) {
      const actionsSheet = XLSX.utils.json_to_sheet(actionsData);
      XLSX.utils.book_append_sheet(workbook, actionsSheet, 'Detailed Actions');
    }

    // Login Events Sheet
    const loginData = loginAttempts.map(attempt => ({
      'ID': attempt.id,
      'Timestamp': new Date(attempt.attempted_at).toLocaleString(),
      'Username': attempt.username,
      'Success': attempt.success ? 'Yes' : 'No',
      'IP Address': attempt.ip_address,
      'User Agent': attempt.user_agent
    }));

    if (loginData.length > 0) {
      const loginSheet = XLSX.utils.json_to_sheet(loginData);
      XLSX.utils.book_append_sheet(workbook, loginSheet, 'Login Events');
    }

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set headers for file download
    const filename = `activity-logs-${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    res.send(buffer);
  } catch (error) {
    console.error('Error exporting action logs:', error);
    res.status(500).json({ success: false, error: 'Failed to export action logs' });
  }
});

// ==================== END DEVELOPER ROLE ENDPOINTS ====================

// Serve React app for all other routes (production only)
// IMPORTANT: This must be the LAST route, and must NOT match /api/* or /uploads/* routes
if (process.env.NODE_ENV === 'production') {
  // Serve static files from dist folder
  app.use(express.static(path.join(__dirname, 'dist')));

  // Only serve index.html for non-API routes (catch-all for client-side routing)
  app.get(/^(?!\/api|\/uploads).*$/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

//Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
