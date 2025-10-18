# Environment Variables Guide

This document explains all the environment variables needed for the Al Fakhama Car Rental application.

## Quick Setup

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your actual values (see details below)

## Required Variables

### 📧 Email Configuration

Used for sending booking confirmations and contact form notifications.

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
ADMIN_EMAIL=admin@example.com
```

#### `EMAIL_SERVICE`
- **Description:** Email service provider
- **Default:** `gmail`
- **Options:** `gmail`, `outlook`, `yahoo`, or any SMTP service
- **Example:** `gmail`

#### `EMAIL_USER`
- **Description:** Your email address (sender)
- **Required:** Yes
- **Example:** `alfakhama.rental@gmail.com`

#### `EMAIL_PASSWORD`
- **Description:** Email password or app-specific password
- **Required:** Yes
- **For Gmail:** You MUST use an "App Password" (not your regular password)
  - Go to: Google Account → Security → 2-Step Verification → App Passwords
  - Generate a new app password
  - Use that 16-character password here
- **Example:** `abcd efgh ijkl mnop` (no spaces in actual .env)

#### `ADMIN_EMAIL`
- **Description:** Email address to receive booking and contact notifications
- **Required:** Yes
- **Example:** `admin@alfakhama.com`

---

### 🚀 Server Configuration

```env
PORT=3001
```

#### `PORT`
- **Description:** Port number for the backend API server
- **Default:** `3001`
- **Note:** Make sure this port is not in use by another application
- **Example:** `3001`

---

### 🗄️ Database Configuration (PostgreSQL)

Used to store bookings, contact messages, and car inventory.

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=alfakhama_rental
DB_USER=postgres
DB_PASSWORD=your_database_password
```

#### `DB_HOST`
- **Description:** PostgreSQL server hostname
- **Default:** `localhost`
- **For Local:** `localhost` or `127.0.0.1`
- **For Cloud:** Your database host URL (e.g., `my-db.postgres.database.azure.com`)
- **Example:** `localhost`

#### `DB_PORT`
- **Description:** PostgreSQL server port
- **Default:** `5432`
- **Note:** Standard PostgreSQL port is 5432
- **Example:** `5432`

#### `DB_NAME`
- **Description:** Name of your PostgreSQL database
- **Required:** Yes
- **Note:** You must create this database first (see DATABASE_SETUP.md)
- **Example:** `alfakhama_rental`

#### `DB_USER`
- **Description:** PostgreSQL username
- **Default:** `postgres`
- **For Local:** Usually `postgres`
- **For Cloud:** Your database username
- **Example:** `postgres`

#### `DB_PASSWORD`
- **Description:** PostgreSQL password
- **Required:** Yes
- **Security:** NEVER commit this to version control!
- **Example:** `MySecurePassword123!`

---

## Complete .env File Example

Here's what your `.env` file should look like with actual values:

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=alfakhama.rental@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
ADMIN_EMAIL=admin@alfakhama.com

# Server Configuration
PORT=3001

# Database Configuration (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=alfakhama_rental
DB_USER=postgres
DB_PASSWORD=MySecureDbPassword123
```

---

## Security Best Practices

### ✅ DO:
- Keep `.env` file in `.gitignore` (already configured)
- Use strong, unique passwords
- Use app-specific passwords for email
- Rotate passwords regularly
- Use different credentials for development and production

### ❌ DON'T:
- Never commit `.env` to version control
- Never share your `.env` file
- Never use the same password across services
- Never use simple passwords like "password123"

---

## Environment-Specific Configuration

### Development (Local)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=alfakhama_rental_dev
```

### Production
```env
DB_HOST=your-production-db-host.com
DB_PORT=5432
DB_NAME=alfakhama_rental_prod
# Add SSL configuration if needed
```

### Testing
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=alfakhama_rental_test
```

---

## Troubleshooting

### Email Not Sending

**Problem:** Emails are not being sent

**Check:**
1. `EMAIL_USER` - Is this a valid email address?
2. `EMAIL_PASSWORD` - For Gmail, did you use an App Password?
3. Gmail: Is 2-Step Verification enabled?
4. Check server logs for specific error messages

### Database Connection Failed

**Problem:** Can't connect to database

**Check:**
1. `DB_HOST` - Is PostgreSQL running on this host?
2. `DB_PORT` - Is PostgreSQL listening on this port?
3. `DB_NAME` - Does this database exist? Run: `psql -U postgres -l`
4. `DB_USER` and `DB_PASSWORD` - Are credentials correct?
5. PostgreSQL service - Is it running?

### Server Won't Start

**Problem:** Server fails to start

**Check:**
1. `PORT` - Is this port already in use by another app?
2. Try a different port (e.g., `3002`, `3003`)
3. Check if all required variables are set

---

## Verifying Configuration

### Test Database Connection:
```bash
node -e "require('./database/db.js').testConnection()"
```

### Test Email Configuration:
Send a test email by submitting the contact form on your website.

### Check Environment Variables Loaded:
```bash
node -e "require('dotenv').config(); console.log('Email:', process.env.EMAIL_USER, 'DB:', process.env.DB_NAME)"
```

---

## Cloud Deployment

When deploying to cloud platforms, set environment variables in their dashboard:

### Heroku:
```bash
heroku config:set EMAIL_USER=your-email@gmail.com
heroku config:set DB_HOST=your-db-host
# ... etc
```

### Vercel:
- Go to Project Settings → Environment Variables
- Add each variable

### AWS / Azure / Google Cloud:
- Use their respective environment variable configuration
- Consider using secret managers for sensitive data

---

## Need Help?

If you're having issues with environment variables:

1. **Check syntax:** No spaces around `=`, no quotes needed
   - ✅ `PORT=3001`
   - ❌ `PORT = 3001`
   - ❌ `PORT="3001"`

2. **Check file location:** `.env` must be in the root directory

3. **Restart server:** Environment variables are loaded on startup

4. **Check logs:** Look at server console output for error messages

---

## Summary Checklist

Before running your application:

- [ ] `.env` file created in root directory
- [ ] All email variables set with valid credentials
- [ ] Gmail App Password generated (if using Gmail)
- [ ] PostgreSQL installed and running
- [ ] Database `alfakhama_rental` created
- [ ] Database credentials in `.env` are correct
- [ ] Port 3001 is available
- [ ] Migration script executed: `node database/migrate.js`
- [ ] Server starts successfully: `npm run dev`

Once all checkboxes are complete, your application is ready to use! ✅
