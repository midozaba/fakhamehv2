import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import multer from 'multer';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, testConnection } from './database/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Test database connection on startup
testConnection();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg, .jpeg, and .pdf files are allowed!'));
    }
  }
});

// Create uploads directory if it doesn't exist
import fs from 'fs';
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Booking submission endpoint
app.post('/api/bookings', upload.fields([
  { name: 'idDocument', maxCount: 1 },
  { name: 'passportDocument', maxCount: 1 }
]), async (req, res) => {
  try {
    const bookingData = JSON.parse(req.body.bookingData);
    const files = req.files;

    // Validate required fields
    const requiredFields = ['pickupDate', 'returnDate', 'insurance'];
    const customerInfoFields = ['name', 'email', 'phone', 'license', 'street', 'city', 'country'];

    for (const field of requiredFields) {
      if (!bookingData[field]) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }

    for (const field of customerInfoFields) {
      if (!bookingData.customerInfo?.[field]) {
        return res.status(400).json({ error: `Missing required customer info: ${field}` });
      }
    }

    // Validate files
    if (!files?.idDocument || !files?.passportDocument) {
      return res.status(400).json({ error: 'ID and passport documents are required' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bookingData.customerInfo.email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate dates
    const pickupDate = new Date(bookingData.pickupDate);
    const returnDate = new Date(bookingData.returnDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (pickupDate < today) {
      return res.status(400).json({ error: 'Pickup date cannot be in the past' });
    }

    if (returnDate <= pickupDate) {
      return res.status(400).json({ error: 'Return date must be after pickup date' });
    }

    // Prepare email content
    const emailContent = `
      <h2>New Car Rental Booking</h2>
      <h3>Car Details</h3>
      <p><strong>Brand:</strong> ${bookingData.car.car_barnd}</p>
      <p><strong>Type:</strong> ${bookingData.car.CAR_TYPE}</p>
      <p><strong>Model:</strong> ${bookingData.car.CAR_MODEL}</p>
      <p><strong>Color:</strong> ${bookingData.car.car_color}</p>

      <h3>Booking Details</h3>
      <p><strong>Pickup Date:</strong> ${bookingData.pickupDate}</p>
      <p><strong>Return Date:</strong> ${bookingData.returnDate}</p>
      <p><strong>Duration:</strong> ${bookingData.days} days</p>
      <p><strong>Insurance:</strong> ${bookingData.insurance}</p>

      <h3>Additional Services</h3>
      <p>${bookingData.additionalServices.join(', ') || 'None'}</p>

      <h3>Customer Information</h3>
      <p><strong>Name:</strong> ${bookingData.customerInfo.name}</p>
      <p><strong>Email:</strong> ${bookingData.customerInfo.email}</p>
      <p><strong>Phone:</strong> ${bookingData.customerInfo.phone}</p>
      <p><strong>License Number:</strong> ${bookingData.customerInfo.license}</p>

      <h3>Address</h3>
      <p><strong>Street:</strong> ${bookingData.customerInfo.street}</p>
      <p><strong>City:</strong> ${bookingData.customerInfo.city}</p>
      <p><strong>Area:</strong> ${bookingData.customerInfo.area || 'N/A'}</p>
      <p><strong>Postal Code:</strong> ${bookingData.customerInfo.postalCode || 'N/A'}</p>
      <p><strong>Country:</strong> ${bookingData.customerInfo.country}</p>

      <h3>Pricing</h3>
      <p><strong>Base Price:</strong> ${bookingData.pricing.basePrice} JOD</p>
      <p><strong>Insurance Price:</strong> ${bookingData.pricing.insurancePrice} JOD</p>
      <p><strong>Services Price:</strong> ${bookingData.pricing.servicesPrice} JOD</p>
      <p><strong>Airport Pickup:</strong> ${bookingData.pricing.airportPickupPrice || 0} JOD</p>
      <p><strong>Total Price:</strong> ${bookingData.pricing.total} JOD</p>
    `;

    // Prepare email attachments
    const attachments = [
      {
        filename: files.idDocument[0].originalname,
        path: files.idDocument[0].path
      },
      {
        filename: files.passportDocument[0].originalname,
        path: files.passportDocument[0].path
      }
    ];

    // Send email to admin
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `New Booking: ${bookingData.car.car_barnd} ${bookingData.car.CAR_TYPE}`,
      html: emailContent,
      attachments: attachments
    });

    // Send confirmation email to customer
    const customerEmailContent = `
      <h2>Booking Confirmation</h2>
      <p>Dear ${bookingData.customerInfo.name},</p>
      <p>Thank you for your booking! We have received your request for:</p>
      <p><strong>${bookingData.car.car_barnd} ${bookingData.car.CAR_TYPE}</strong></p>
      <p><strong>Pickup Date:</strong> ${bookingData.pickupDate}</p>
      <p><strong>Return Date:</strong> ${bookingData.returnDate}</p>
      <p><strong>Total Price:</strong> ${bookingData.pricing.total} JOD</p>
      <p>We will review your booking and contact you shortly to confirm the details.</p>
      <br>
      <p>Best regards,</p>
      <p>Al Fakhama Car Rental Team</p>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: bookingData.customerInfo.email,
      subject: 'Booking Confirmation - Al Fakhama Car Rental',
      html: customerEmailContent
    });

    // Save booking to database
    const insertBookingQuery = `
      INSERT INTO bookings (
        car_id, car_brand, car_type, car_model, car_color,
        customer_name, customer_email, customer_phone, customer_license,
        street, city, area, postal_code, country,
        pickup_date, return_date, days,
        insurance_type, additional_services,
        base_price, insurance_price, services_price, airport_pickup_price, total_price,
        id_document_path, passport_document_path,
        status
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9,
        $10, $11, $12, $13, $14,
        $15, $16, $17,
        $18, $19,
        $20, $21, $22, $23, $24,
        $25, $26,
        $27
      ) RETURNING booking_id
    `;

    const bookingValues = [
      bookingData.car.car_id || null,
      bookingData.car.car_barnd,
      bookingData.car.CAR_TYPE,
      bookingData.car.CAR_MODEL,
      bookingData.car.car_color,
      bookingData.customerInfo.name,
      bookingData.customerInfo.email,
      bookingData.customerInfo.phone,
      bookingData.customerInfo.license,
      bookingData.customerInfo.street,
      bookingData.customerInfo.city,
      bookingData.customerInfo.area || null,
      bookingData.customerInfo.postalCode || null,
      bookingData.customerInfo.country,
      bookingData.pickupDate,
      bookingData.returnDate,
      bookingData.days,
      bookingData.insurance,
      bookingData.additionalServices,
      bookingData.pricing.basePrice,
      bookingData.pricing.insurancePrice,
      bookingData.pricing.servicesPrice,
      bookingData.pricing.airportPickupPrice || 0,
      bookingData.pricing.total,
      files.idDocument[0].path,
      files.passportDocument[0].path,
      'pending'
    ];

    const result = await query(insertBookingQuery, bookingValues);
    const bookingId = result.rows[0].booking_id;

    res.status(200).json({
      success: true,
      message: 'Booking submitted successfully',
      bookingId: bookingId
    });

  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({
      error: 'Failed to process booking',
      details: error.message
    });
  }
});

// Contact form submission endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Prepare email content
    const emailContent = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
      <p><strong>Subject:</strong> ${subject || 'No subject'}</p>
      <h3>Message:</h3>
      <p>${message}</p>
    `;

    // Send email to admin
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      replyTo: email,
      subject: `Contact Form: ${subject || 'New Message'}`,
      html: emailContent
    });

    // Send confirmation email to customer
    const customerEmailContent = `
      <h2>Thank You for Contacting Us</h2>
      <p>Dear ${name},</p>
      <p>We have received your message and will get back to you as soon as possible.</p>
      <p>Here's a copy of your message:</p>
      <blockquote style="border-left: 4px solid #1e40af; padding-left: 16px; color: #555;">
        ${message}
      </blockquote>
      <br>
      <p>Best regards,</p>
      <p>Al Fakhama Car Rental Team</p>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'We Received Your Message - Al Fakhama Car Rental',
      html: customerEmailContent
    });

    // Save contact message to database
    const insertMessageQuery = `
      INSERT INTO contact_messages (
        name, email, phone, subject, message, status
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING message_id
    `;

    const messageValues = [
      name,
      email,
      phone || null,
      subject || null,
      message,
      'new'
    ];

    const result = await query(insertMessageQuery, messageValues);
    const messageId = result.rows[0].message_id;

    res.status(200).json({
      success: true,
      message: 'Message sent successfully',
      messageId: messageId
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      error: 'Failed to send message',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ========================================
// ADMIN API ENDPOINTS
// ========================================

// Get all bookings (with optional filters)
app.get('/api/bookings', async (req, res) => {
  try {
    const { status, email, limit = 50, offset = 0 } = req.query;

    let queryText = 'SELECT * FROM bookings WHERE 1=1';
    const queryParams = [];
    let paramCount = 1;

    if (status) {
      queryText += ` AND status = $${paramCount}`;
      queryParams.push(status);
      paramCount++;
    }

    if (email) {
      queryText += ` AND customer_email ILIKE $${paramCount}`;
      queryParams.push(`%${email}%`);
      paramCount++;
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(parseInt(limit), parseInt(offset));

    const result = await query(queryText, queryParams);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM bookings WHERE 1=1';
    const countParams = [];
    let countParamNum = 1;

    if (status) {
      countQuery += ` AND status = $${countParamNum}`;
      countParams.push(status);
      countParamNum++;
    }

    if (email) {
      countQuery += ` AND customer_email ILIKE $${countParamNum}`;
      countParams.push(`%${email}%`);
    }

    const countResult = await query(countQuery, countParams);

    res.status(200).json({
      success: true,
      data: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings', details: error.message });
  }
});

// Get single booking by ID
app.get('/api/bookings/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM bookings WHERE booking_id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking', details: error.message });
  }
});

// Update booking status
app.patch('/api/bookings/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const result = await query(
      'UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE booking_id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = result.rows[0];

    // Update car status based on booking status
    if (booking.car_id) {
      let carStatus = null;

      if (status === 'confirmed' || status === 'in_progress') {
        // Car is rented
        carStatus = 'rented';
      } else if (status === 'completed' || status === 'cancelled') {
        // Car becomes available again - but only if no other active bookings exist
        const activeBookings = await query(
          `SELECT COUNT(*) FROM bookings
           WHERE car_id = $1 AND booking_id != $2
           AND status IN ('confirmed', 'in_progress')`,
          [booking.car_id, id]
        );

        if (parseInt(activeBookings.rows[0].count) === 0) {
          carStatus = 'available';
        }
      }

      if (carStatus) {
        await query(
          'UPDATE cars SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE car_id = $2',
          [carStatus, booking.car_id]
        );
      }
    }

    res.status(200).json({
      success: true,
      message: 'Booking status updated',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Failed to update booking status', details: error.message });
  }
});

// Get all contact messages (with optional filters)
app.get('/api/contact-messages', async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    let queryText = 'SELECT * FROM contact_messages WHERE 1=1';
    const queryParams = [];
    let paramCount = 1;

    if (status) {
      queryText += ` AND status = $${paramCount}`;
      queryParams.push(status);
      paramCount++;
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(parseInt(limit), parseInt(offset));

    const result = await query(queryText, queryParams);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM contact_messages WHERE 1=1';
    const countParams = [];

    if (status) {
      countQuery += ` AND status = $1`;
      countParams.push(status);
    }

    const countResult = await query(countQuery, countParams);

    res.status(200).json({
      success: true,
      data: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages', details: error.message });
  }
});

// Update contact message status
app.patch('/api/contact-messages/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['new', 'read', 'replied', 'archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const result = await query(
      'UPDATE contact_messages SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE message_id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Message status updated',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating message status:', error);
    res.status(500).json({ error: 'Failed to update message status', details: error.message });
  }
});

// Get all cars from database
app.get('/api/cars', async (req, res) => {
  try {
    const { status, brand, limit = 100, offset = 0 } = req.query;

    let queryText = 'SELECT * FROM cars WHERE 1=1';
    const queryParams = [];
    let paramCount = 1;

    if (status) {
      queryText += ` AND status = $${paramCount}`;
      queryParams.push(status);
      paramCount++;
    }

    if (brand) {
      queryText += ` AND car_barnd ILIKE $${paramCount}`;
      queryParams.push(`%${brand}%`);
      paramCount++;
    }

    queryText += ` ORDER BY car_barnd, car_type LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(parseInt(limit), parseInt(offset));

    const result = await query(queryText, queryParams);

    res.status(200).json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Error fetching cars:', error);
    res.status(500).json({ error: 'Failed to fetch cars', details: error.message });
  }
});

// Create new car
app.post('/api/cars', async (req, res) => {
  try {
    const {
      car_barnd,
      car_type,
      car_model,
      car_num,
      price_per_day,
      price_per_week,
      price_per_month,
      car_color,
      mileage,
      status,
      image_url
    } = req.body;

    // Validate required fields
    if (!car_barnd || !car_type || !car_model || !car_num || !price_per_day || !price_per_week || !price_per_month || !car_color) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if car number already exists
    const existingCar = await query('SELECT car_id FROM cars WHERE car_num = $1', [car_num]);
    if (existingCar.rows.length > 0) {
      return res.status(400).json({ error: 'Car number already exists' });
    }

    const insertQuery = `
      INSERT INTO cars (
        car_barnd, car_type, car_model, car_num,
        price_per_day, price_per_week, price_per_month,
        car_color, mileage, status, image_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    // Convert empty strings to null for numeric fields
    const values = [
      car_barnd,
      car_type,
      parseInt(car_model),
      parseInt(car_num),
      parseFloat(price_per_day),
      parseFloat(price_per_week),
      parseFloat(price_per_month),
      car_color,
      mileage ? parseInt(mileage) : null,
      status || 'available',
      image_url || null
    ];

    const result = await query(insertQuery, values);

    res.status(201).json({
      success: true,
      message: 'Car created successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error creating car:', error);
    res.status(500).json({ error: 'Failed to create car', details: error.message });
  }
});

// Update car
app.put('/api/cars/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      car_barnd,
      car_type,
      car_model,
      car_num,
      price_per_day,
      price_per_week,
      price_per_month,
      car_color,
      mileage,
      status,
      image_url
    } = req.body;

    // Check if car exists
    const existingCar = await query('SELECT car_id FROM cars WHERE car_id = $1', [id]);
    if (existingCar.rows.length === 0) {
      return res.status(404).json({ error: 'Car not found' });
    }

    // Check if car number is being changed and if it already exists
    if (car_num) {
      const duplicateCar = await query(
        'SELECT car_id FROM cars WHERE car_num = $1 AND car_id != $2',
        [car_num, id]
      );
      if (duplicateCar.rows.length > 0) {
        return res.status(400).json({ error: 'Car number already exists' });
      }
    }

    const updateQuery = `
      UPDATE cars SET
        car_barnd = COALESCE($1, car_barnd),
        car_type = COALESCE($2, car_type),
        car_model = COALESCE($3, car_model),
        car_num = COALESCE($4, car_num),
        price_per_day = COALESCE($5, price_per_day),
        price_per_week = COALESCE($6, price_per_week),
        price_per_month = COALESCE($7, price_per_month),
        car_color = COALESCE($8, car_color),
        mileage = COALESCE($9, mileage),
        status = COALESCE($10, status),
        image_url = COALESCE($11, image_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE car_id = $12
      RETURNING *
    `;

    // Convert empty strings to null for numeric fields
    const values = [
      car_barnd || null,
      car_type || null,
      car_model ? parseInt(car_model) : null,
      car_num ? parseInt(car_num) : null,
      price_per_day ? parseFloat(price_per_day) : null,
      price_per_week ? parseFloat(price_per_week) : null,
      price_per_month ? parseFloat(price_per_month) : null,
      car_color || null,
      mileage ? parseInt(mileage) : null,
      status || null,
      image_url || null,
      id
    ];

    const result = await query(updateQuery, values);

    res.status(200).json({
      success: true,
      message: 'Car updated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating car:', error);
    res.status(500).json({ error: 'Failed to update car', details: error.message });
  }
});

// Delete car
app.delete('/api/cars/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if car exists
    const existingCar = await query('SELECT car_id FROM cars WHERE car_id = $1', [id]);
    if (existingCar.rows.length === 0) {
      return res.status(404).json({ error: 'Car not found' });
    }

    // Check if car has ANY bookings (including completed ones)
    const allBookings = await query(
      `SELECT COUNT(*) FROM bookings WHERE car_id = $1`,
      [id]
    );

    if (parseInt(allBookings.rows[0].count) > 0) {
      return res.status(400).json({
        error: 'Cannot delete car with booking history',
        details: `This car has ${allBookings.rows[0].count} booking(s) associated with it. For data integrity, cars with booking history cannot be deleted. You can mark the car as 'unavailable' instead.`
      });
    }

    const result = await query('DELETE FROM cars WHERE car_id = $1 RETURNING *', [id]);

    res.status(200).json({
      success: true,
      message: 'Car deleted successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error deleting car:', error);
    res.status(500).json({ error: 'Failed to delete car', details: error.message });
  }
});

// Get dashboard statistics
app.get('/api/admin/stats', async (req, res) => {
  try {
    // Get various statistics
    const totalBookings = await query('SELECT COUNT(*) FROM bookings');
    const pendingBookings = await query("SELECT COUNT(*) FROM bookings WHERE status = 'pending'");
    const confirmedBookings = await query("SELECT COUNT(*) FROM bookings WHERE status = 'confirmed'");
    const totalRevenue = await query('SELECT SUM(total_price) FROM bookings WHERE status IN ($1, $2)', ['confirmed', 'completed']);
    const totalCars = await query('SELECT COUNT(*) FROM cars');
    const availableCars = await query("SELECT COUNT(*) FROM cars WHERE status = 'available'");
    const newMessages = await query("SELECT COUNT(*) FROM contact_messages WHERE status = 'new'");

    // Recent bookings
    const recentBookings = await query(
      'SELECT booking_id, customer_name, car_brand, car_type, pickup_date, total_price, status FROM bookings ORDER BY created_at DESC LIMIT 5'
    );

    res.status(200).json({
      success: true,
      stats: {
        bookings: {
          total: parseInt(totalBookings.rows[0].count),
          pending: parseInt(pendingBookings.rows[0].count),
          confirmed: parseInt(confirmedBookings.rows[0].count)
        },
        revenue: {
          total: parseFloat(totalRevenue.rows[0].sum || 0)
        },
        cars: {
          total: parseInt(totalCars.rows[0].count),
          available: parseInt(availableCars.rows[0].count)
        },
        messages: {
          new: parseInt(newMessages.rows[0].count)
        }
      },
      recentBookings: recentBookings.rows
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics', details: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
