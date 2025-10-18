# Database Setup Guide - Al Fakhama Car Rental

This guide will help you set up PostgreSQL database for the Al Fakhama Car Rental application.

## Prerequisites

- Node.js installed (already done)
- PostgreSQL 12+ installed on your system

## Installation Options

### Option 1: Install PostgreSQL on Windows

1. **Download PostgreSQL:**
   - Visit: https://www.postgresql.org/download/windows/
   - Download the installer (recommended: latest stable version)

2. **Run the installer:**
   - Follow the installation wizard
   - **IMPORTANT:** Remember the password you set for the `postgres` user
   - Default port: 5432 (keep this unless you have a conflict)
   - Install pgAdmin (recommended - it's a GUI tool for PostgreSQL)

3. **Verify installation:**
   ```bash
   psql --version
   ```

### Option 2: Use Docker (Alternative)

If you prefer Docker:

```bash
docker run --name alfakhama-postgres \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=alfakhama_rental \
  -p 5432:5432 \
  -d postgres:15
```

## Database Setup Steps

### Step 1: Create Database

**Using Command Line (psql):**

```bash
# Login to PostgreSQL (Windows)
psql -U postgres

# Create database
CREATE DATABASE alfakhama_rental;

# Exit
\q
```

**Using pgAdmin (GUI):**
1. Open pgAdmin
2. Right-click on "Databases" → "Create" → "Database"
3. Name: `alfakhama_rental`
4. Click "Save"

### Step 2: Configure Environment Variables

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit the `.env` file with your actual credentials:**

   ```env
   # Email Configuration
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-specific-password
   ADMIN_EMAIL=admin@example.com

   # Server Configuration
   PORT=3001

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=alfakhama_rental
   DB_USER=postgres
   DB_PASSWORD=YOUR_ACTUAL_POSTGRES_PASSWORD
   ```

   **Important:** Replace `YOUR_ACTUAL_POSTGRES_PASSWORD` with the password you set during PostgreSQL installation.

### Step 3: Run Database Migration

This will create all tables and import your car data:

```bash
node database/migrate.js
```

**Expected Output:**
```
🚀 Starting database migration...

1. Testing database connection...
   ✓ Database connection successful

2. Creating database schema...
   ✓ Schema created successfully

3. Importing car data from JSON...
   Found 20 cars to import
   ✓ Imported: Ford Fusion (ID: 1)
   ✓ Imported: Hyundai I10 (ID: 2)
   ...

   Summary: 20 imported, 0 skipped

4. Verifying tables...
   Created tables:
   - bookings
   - cars
   - contact_messages

5. Checking data...
   - Cars: 20
   - Bookings: 0
   - Contact Messages: 0

✅ Migration completed successfully!
```

## Troubleshooting

### Error: "ECONNREFUSED" or "Connection refused"

**Problem:** Can't connect to PostgreSQL

**Solutions:**
1. Make sure PostgreSQL is running:
   - Windows: Check "Services" app → PostgreSQL should be running
   - Or run: `pg_isready`

2. Check if PostgreSQL is listening on port 5432:
   ```bash
   netstat -an | findstr "5432"
   ```

3. Verify your credentials in `.env` are correct

### Error: "database does not exist"

**Problem:** The database `alfakhama_rental` hasn't been created

**Solution:**
```bash
psql -U postgres
CREATE DATABASE alfakhama_rental;
\q
```

### Error: "password authentication failed"

**Problem:** Wrong password in `.env` file

**Solution:**
1. Check the password you used during PostgreSQL installation
2. Update `DB_PASSWORD` in `.env` file
3. If you forgot the password, you can reset it using pgAdmin or:
   ```bash
   psql -U postgres
   ALTER USER postgres PASSWORD 'new_password';
   ```

### Error: "relation already exists"

**Problem:** Tables already exist (running migration twice)

**Solution:** This is usually fine - the migration script will skip existing data. If you want a fresh start:

```bash
# Connect to database
psql -U postgres -d alfakhama_rental

# Drop all tables (⚠️ WARNING: This deletes all data!)
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS contact_messages CASCADE;
DROP TABLE IF EXISTS cars CASCADE;

# Exit and run migration again
\q
node database/migrate.js
```

## Verify Everything Works

### 1. Test Database Connection

```bash
node -e "require('./database/db.js').testConnection()"
```

Should output: `Database connection test successful`

### 2. Check Tables Were Created

```bash
psql -U postgres -d alfakhama_rental -c "\dt"
```

Should show:
```
             List of relations
 Schema |       Name        | Type  |  Owner
--------+-------------------+-------+----------
 public | bookings          | table | postgres
 public | cars              | table | postgres
 public | contact_messages  | table | postgres
```

### 3. Check Car Data

```bash
psql -U postgres -d alfakhama_rental -c "SELECT COUNT(*) FROM cars;"
```

Should show the number of cars imported (e.g., 20)

### 4. Start the Application

```bash
npm run dev
```

You should see:
```
✓ Database connected successfully
Database connection test successful: [timestamp]
Server running on http://localhost:3001
```

## Database Structure

### Tables Created:

1. **`cars`** - Car inventory
   - `car_id`, `car_barnd`, `car_type`, `car_model`, `car_num`
   - `price_per_day`, `price_per_week`, `price_per_month`
   - `car_color`, `mileage`, `status`, `image_url`
   - Timestamps: `created_at`, `updated_at`

2. **`bookings`** - Customer bookings
   - Booking ID (UUID)
   - Car information and customer details
   - Address information
   - Booking dates, insurance, services
   - Pricing breakdown
   - Document paths
   - Status tracking
   - Timestamps

3. **`contact_messages`** - Contact form submissions
   - Message ID (UUID)
   - Customer contact info
   - Message content
   - Status tracking
   - Timestamps

## API Endpoints Available

Once the database is set up, you have access to these endpoints:

### Bookings
- `GET /api/bookings` - Get all bookings (with filters)
- `GET /api/bookings/:id` - Get single booking
- `PATCH /api/bookings/:id/status` - Update booking status
- `POST /api/bookings` - Create new booking (already working)

### Contact Messages
- `GET /api/contact-messages` - Get all messages
- `PATCH /api/contact-messages/:id/status` - Update message status
- `POST /api/contact` - Submit contact form (already working)

### Cars
- `GET /api/cars` - Get all cars from database

### Admin Dashboard
- `GET /api/admin/stats` - Get dashboard statistics

## Testing the API

### Test Fetching Bookings:
```bash
curl http://localhost:3001/api/bookings
```

### Test Fetching Admin Stats:
```bash
curl http://localhost:3001/api/admin/stats
```

### Test Fetching Cars:
```bash
curl http://localhost:3001/api/cars?status=available
```

## Backup & Maintenance

### Create Backup:
```bash
pg_dump -U postgres alfakhama_rental > backup.sql
```

### Restore from Backup:
```bash
psql -U postgres alfakhama_rental < backup.sql
```

### View Logs (PostgreSQL):
- Windows: Check `C:\Program Files\PostgreSQL\{version}\data\log\`

## Production Considerations

For production deployment:

1. **Use Environment Variables** - Never commit `.env` to version control
2. **Connection Pooling** - Already configured in `database/db.js`
3. **SSL Connection** - Enable in production:
   ```javascript
   ssl: { rejectUnauthorized: false }
   ```
4. **Backups** - Set up automated daily backups
5. **Monitoring** - Use tools like pgAdmin or cloud monitoring
6. **Indexes** - Already created for optimal performance

## Need Help?

- PostgreSQL Documentation: https://www.postgresql.org/docs/
- pgAdmin Documentation: https://www.pgadmin.org/docs/
- Node.js pg library: https://node-postgres.com/

## Summary

✅ PostgreSQL installed
✅ Database `alfakhama_rental` created
✅ `.env` configured with database credentials
✅ Migration script executed successfully
✅ All tables created with proper schema
✅ Car data imported from JSON
✅ Application connected to database
✅ Ready to accept bookings and store them in database!
