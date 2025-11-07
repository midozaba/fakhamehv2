# 🚀 Quick Start Guide - Al Fakhama Car Rental

Get your application up and running in 5 minutes!

## Prerequisites Checklist

- [ ] Node.js installed
- [ ] PostgreSQL installed (see [DATABASE_SETUP.md](./DATABASE_SETUP.md) if not)
- [ ] Gmail account (for sending emails)

## Step-by-Step Setup

### 1️⃣ Install PostgreSQL (if not already installed)

**Windows:**
- Download: https://www.postgresql.org/download/windows/
- Install and remember your password for `postgres` user

**Verify installation:**
```bash
psql --version
```

---

### 2️⃣ Create Database

```bash
# Open PostgreSQL command line
psql -U postgres

# Create database
CREATE DATABASE alfakhama_rental;

# Exit
\q
```

---

### 3️⃣ Configure Environment Variables

```bash
# Copy example file
cp .env.example .env
```

**Edit `.env` file with your actual values:**

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com          # ← Your Gmail
EMAIL_PASSWORD=your-app-password         # ← Gmail App Password (see below)
ADMIN_EMAIL=your-admin@email.com         # ← Where to receive bookings

# Server Configuration
PORT=3001

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=alfakhama_rental
DB_USER=postgres
DB_PASSWORD=your_postgres_password       # ← Password from step 1
```

**Getting Gmail App Password:**
1. Go to: https://myaccount.google.com/apppasswords
2. Enable 2-Step Verification if not already enabled
3. Generate an "App Password" for "Mail"
4. Copy the 16-character password to `.env`

---

### 4️⃣ Run Database Migration

This creates all tables and imports car data:

```bash
node database/migrate.js
```

**Expected output:**
```
🚀 Starting database migration...
✓ Database connection successful
✓ Schema created successfully
✓ Imported: 20 cars
✅ Migration completed successfully!
```

---

### 5️⃣ Start the Application

```bash
npm run dev
```

**You should see:**
```
✓ Database connected successfully
Server running on http://localhost:3001
```

---

### 6️⃣ Test Everything Works

1. **Open browser:** http://localhost:5173
2. **Try booking a car:**
   - Select a car
   - Fill in booking form
   - Upload ID and passport documents
   - Submit booking
3. **Check email:** You should receive confirmation email
4. **Test contact form:** Submit a message

---

## API Endpoints Available

Your backend is now running with these endpoints:

### Public Endpoints:
- `POST /api/bookings` - Submit booking
- `POST /api/contact` - Submit contact form
- `GET /api/health` - Health check

### Admin Endpoints:
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/:id` - Get single booking
- `PATCH /api/bookings/:id/status` - Update booking status
- `GET /api/contact-messages` - Get all messages
- `GET /api/cars` - Get all cars
- `GET /api/admin/stats` - Dashboard statistics

**Test an endpoint:**
```bash
curl http://localhost:3001/api/health
```

---

## Project Structure

```
my-react-app/
├── database/
│   ├── schema.sql       # Database schema
│   ├── db.js            # Database connection
│   └── migrate.js       # Migration script
├── src/
│   ├── components/      # React components
│   ├── data/           # Car data
│   └── utils/          # Helper functions
├── server.js           # Express backend
├── .env                # Your configuration (DO NOT COMMIT)
└── uploads/            # Uploaded documents
```

---

## Common Issues & Solutions

### ❌ "ECONNREFUSED" - Can't connect to database

**Solution:**
1. Check if PostgreSQL is running
2. Verify `DB_PASSWORD` in `.env` is correct
3. Make sure database `alfakhama_rental` exists

### ❌ "Email not sending"

**Solution:**
1. Use Gmail App Password (not regular password)
2. Enable 2-Step Verification in Gmail
3. Check `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`

### ❌ "Port 3001 already in use"

**Solution:**
1. Change `PORT=3002` in `.env`
2. Or stop the other application using port 3001

### ❌ "Migration failed"

**Solution:**
1. Drop existing tables: `psql -U postgres -d alfakhama_rental`
   ```sql
   DROP TABLE IF EXISTS bookings CASCADE;
   DROP TABLE IF EXISTS contact_messages CASCADE;
   DROP TABLE IF EXISTS cars CASCADE;
   \q
   ```
2. Run migration again: `node database/migrate.js`

---

## Verify Everything is Working

### ✅ Database Connection:
```bash
node -e "require('./database/db.js').testConnection()"
```
Should output: `Database connection test successful`

### ✅ Check Tables:
```bash
psql -U postgres -d alfakhama_rental -c "\dt"
```
Should show: `bookings`, `cars`, `contact_messages`

### ✅ Check Car Data:
```bash
psql -U postgres -d alfakhama_rental -c "SELECT COUNT(*) FROM cars;"
```
Should show: `20` (or your number of cars)

### ✅ Test API:
```bash
curl http://localhost:3001/api/health
```
Should return: `{"status":"OK","timestamp":"..."}`

### ✅ Test Admin Stats:
```bash
curl http://localhost:3001/api/admin/stats
```
Should return statistics JSON

---

## Next Steps

Now that everything is set up:

1. **Customize your car inventory:**
   - Edit `src/data/cars.json`
   - Run migration to import: `node database/migrate.js`

2. **Set up admin panel:**
   - Use the API endpoints to build an admin dashboard
   - Already have endpoints for fetching/updating bookings

3. **Deploy to production:**
   - Set up cloud database (Azure, AWS, or similar)
   - Configure environment variables on hosting platform
   - Set up automated backups

4. **Add authentication:**
   - Protect admin endpoints
   - Add JWT or session-based auth

---

## Development Workflow

### Start Development:
```bash
npm run dev
```
This runs both frontend (Vite) and backend (Express) simultaneously.

### Run Frontend Only:
```bash
npm run dev:client
```

### Run Backend Only:
```bash
npm run dev:server
```

### View Database:
```bash
# Command line
psql -U postgres -d alfakhama_rental

# Or use pgAdmin GUI
```

---

## Helpful Commands

```bash
# Check PostgreSQL status
pg_isready

# View all databases
psql -U postgres -l

# Connect to database
psql -U postgres -d alfakhama_rental

# View all tables
\dt

# View table structure
\d bookings

# Count records
SELECT COUNT(*) FROM bookings;

# View recent bookings
SELECT * FROM bookings ORDER BY created_at DESC LIMIT 5;

# Exit psql
\q
```

---

## Support & Documentation

- **Full Database Setup:** [DATABASE_SETUP.md](./DATABASE_SETUP.md)
- **Environment Variables:** [ENV_VARIABLES_GUIDE.md](./ENV_VARIABLES_GUIDE.md)
- **API Integration:** [SETUP.md](./SETUP.md)

---

## Summary

✅ **You now have:**
- PostgreSQL database set up and running
- All tables created (bookings, cars, contact_messages)
- Car inventory imported
- Backend API running on port 3001
- Frontend running on port 5173
- Email notifications configured
- Full booking and contact form integration

**Your car rental application is ready to accept bookings! 🎉**

---

## Quick Test Checklist

- [ ] PostgreSQL is running
- [ ] Database `alfakhama_rental` exists
- [ ] `.env` file configured with correct credentials
- [ ] Migration completed successfully
- [ ] Server starts without errors
- [ ] Can access http://localhost:5173
- [ ] Can book a car successfully
- [ ] Receive confirmation email
- [ ] Data saved in database

**All checked?** Congratulations! Your application is fully operational! 🚀
