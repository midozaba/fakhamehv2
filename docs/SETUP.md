# Backend Integration Setup Guide

## Overview
This guide explains how to set up and use the backend API for the Al Fakhama Car Rental application.

## Features Implemented
- ✅ Booking form submission with file uploads (ID and passport documents)
- ✅ Contact form submission with email notifications
- ✅ Input validation on both frontend and backend
- ✅ Success/error notifications using react-toastify
- ✅ Email confirmations to customers and admin

## Prerequisites
- Node.js installed
- Gmail account for sending emails (or other email service)

## Setup Instructions

### 1. Configure Environment Variables
Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

Edit the `.env` file with your email credentials:

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
ADMIN_EMAIL=admin@example.com

# Server Configuration
PORT=3001
```

**Important for Gmail users:**
- You need to use an "App Password" instead of your regular Gmail password
- Go to Google Account Settings → Security → 2-Step Verification → App Passwords
- Generate an app password and use it in the `.env` file

### 2. Install Dependencies
All dependencies are already installed. If you need to reinstall:

```bash
npm install
```

### 3. Run the Application

**Option A: Run both frontend and backend together (Recommended)**
```bash
npm run dev
```

**Option B: Run separately**
```bash
# Terminal 1 - Frontend (Vite)
npm run dev:client

# Terminal 2 - Backend (Express)
npm run dev:server
```

The application will run on:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## API Endpoints

### 1. Booking Submission
**POST** `/api/bookings`

**Content-Type:** `multipart/form-data`

**Body:**
- `bookingData` (JSON string): Booking information including car details, dates, insurance, services, customer info, and pricing
- `idDocument` (file): Customer ID or residence card
- `passportDocument` (file): Customer passport

**Response:**
```json
{
  "success": true,
  "message": "Booking submitted successfully",
  "bookingId": "BK-1234567890"
}
```

### 2. Contact Form Submission
**POST** `/api/contact`

**Content-Type:** `application/json`

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+962777123456",
  "subject": "Inquiry about rental",
  "message": "I would like to know more about..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully"
}
```

### 3. Health Check
**GET** `/api/health`

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-10-02T12:00:00.000Z"
}
```

## Validation Rules

### Booking Form
- All required fields must be filled:
  - Customer name, email, phone, license number
  - Address: street, city, country
  - Pickup and return dates
  - Insurance selection
  - ID and passport documents
- Email must be in valid format
- Pickup date cannot be in the past
- Return date must be after pickup date
- File uploads must be images (jpg, png) or PDF
- File size limit: 5MB per file

### Contact Form
- Required fields: name, email, message
- Email must be in valid format
- Phone and subject are optional

## Features

### Toast Notifications
- Success notifications when forms are submitted successfully
- Error notifications with specific error messages
- Loading indicators during submission
- RTL support for Arabic language

### Email Notifications

**For Bookings:**
- Admin receives detailed booking information with attachments
- Customer receives confirmation email

**For Contact Form:**
- Admin receives the message with customer details
- Customer receives confirmation that message was received

## File Uploads
- Uploaded files are stored in the `uploads/` directory
- Files are automatically organized with unique names
- Supported formats: JPG, PNG, PDF
- Maximum file size: 5MB

## Error Handling
- Frontend validation before submission
- Backend validation with descriptive error messages
- Network error handling
- File upload validation

## Security Considerations
1. Always use environment variables for sensitive data
2. Never commit `.env` file to version control
3. Use app-specific passwords for email services
4. Validate all inputs on both frontend and backend
5. Limit file upload sizes and types

## Troubleshooting

### Email not sending
- Check your email credentials in `.env`
- For Gmail, ensure 2-Step Verification is enabled
- Use app-specific password, not regular password
- Check if "Less secure app access" is enabled (if not using app password)

### CORS errors
- Ensure backend server is running on port 3001
- Check CORS configuration in `server.js`

### File upload errors
- Check uploads directory exists and has write permissions
- Verify file size is under 5MB
- Ensure file format is supported (jpg, png, pdf)

### Connection refused
- Make sure backend server is running (`npm run dev:server`)
- Check that port 3001 is not blocked by firewall
- Verify API URL in frontend code matches backend port

## Next Steps
- [ ] Set up a production-ready database (PostgreSQL/MongoDB)
- [ ] Implement booking storage in database
- [ ] Add authentication for admin panel
- [ ] Set up cloud storage for uploaded documents (AWS S3, Cloudinary)
- [ ] Add rate limiting for API endpoints
- [ ] Implement proper logging
- [ ] Add unit and integration tests
