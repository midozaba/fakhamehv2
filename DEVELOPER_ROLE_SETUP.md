# Developer Role Setup Guide

This guide explains how to set up and use the new **Developer Role** with comprehensive activity logging and reporting capabilities.

## Overview

The Developer role is a super admin role that has:
- All standard admin permissions (manage cars, bookings, reviews, messages)
- Access to view all admin action logs
- Ability to filter and search through activity logs
- Excel export functionality for audit reports
- View all admin users

## What Gets Logged?

The system logs the following admin actions:

### 1. **Authentication Events**
- Login attempts (successful and failed)
- Logout events
- IP address and user agent tracking

### 2. **CRUD Operations**
- **Cars**: Create, Update, Delete
- **Reviews**: Create, Update, Delete
- **Bookings**: Status changes (pending → active → completed/cancelled)
- **Messages**: Status changes (new → read → replied → archived)

### 3. **Data Captured**
For each action, the system logs:
- Timestamp
- Admin user (ID, username, role)
- Action type (CREATE, UPDATE, DELETE, STATUS_CHANGE, LOGIN, LOGOUT)
- Entity type and ID
- Description of the action
- Before/After data (JSON snapshots)
- IP address and User Agent

## Setup Instructions

### Step 1: Run Database Migrations

Connect to your MySQL database and run the following SQL files in order:

```bash
# SSH into your server
ssh mido@192.168.1.124

# Connect to MySQL
mysql -u root -p
# Password: 1234

# Select database
USE alfakhama_rental;
```

#### 1.1 Create Action Logs Table
```sql
SOURCE /path/to/database/create_action_logs_table.sql;
```

Or copy and paste the SQL from `database/create_action_logs_table.sql`

#### 1.2 Update Admin Users Table to Include Developer Role
```sql
SOURCE /path/to/database/update_admin_users_add_developer.sql;
```

Or run:
```sql
ALTER TABLE admin_users
MODIFY COLUMN role ENUM('admin', 'manager', 'viewer', 'developer') DEFAULT 'viewer';
```

#### 1.3 Create Developer User
```sql
SOURCE /path/to/database/create_developer_user.sql;
```

Or run:
```sql
INSERT INTO admin_users (username, password, full_name, role)
VALUES ('developer', '$2b$10$rX8K9yJ6Q3tZ7M4pV2wL1eLqK5sJ8mT9nY6fH4uW3vC2bG7dA1eXm', 'Developer Admin', 'developer');
```

Default credentials:
- **Username**: `developer`
- **Password**: `developer123`

**IMPORTANT**: Change the password after first login!

### Step 2: Verify Tables

Check that the tables were created successfully:

```sql
-- Check admin_action_logs table
DESCRIBE admin_action_logs;

-- Check that developer role exists
SELECT role FROM admin_users WHERE username = 'developer';
```

Expected output for admin_action_logs:
```
+---------------+--------------+
| Field         | Type         |
+---------------+--------------+
| id            | int          |
| admin_id      | int          |
| admin_username| varchar(100) |
| admin_role    | varchar(50)  |
| action        | varchar(100) |
| entity_type   | varchar(50)  |
| entity_id     | int          |
| description   | text         |
| old_data      | json         |
| new_data      | json         |
| ip_address    | varchar(45)  |
| user_agent    | text         |
| created_at    | timestamp    |
+---------------+--------------+
```

### Step 3: Login as Developer

1. Navigate to the admin login page: `http://192.168.1.124/admin`
2. Login with:
   - Username: `developer`
   - Password: `developer123`
3. You should see a new tab called **"Activity Logs"** in the admin dashboard

## Using the Activity Logs Feature

### Viewing Logs

1. Click on the **Activity Logs** tab
2. You'll see a comprehensive list of all admin actions
3. Click **"View"** on any log entry to see:
   - Before/After data comparison
   - IP address and browser information
   - Full JSON data snapshots

### Filtering Logs

Use the filter panel to narrow down logs:

- **Date Range**: Filter by start and end date/time
- **Admin User**: Filter by specific admin user
- **Action Type**: LOGIN, LOGOUT, CREATE, UPDATE, DELETE, STATUS_CHANGE
- **Entity Type**: car, booking, review, message
- **Results Per Page**: 50, 100, 200, or 500

### Exporting to Excel

1. Apply any filters you want (optional)
2. Click the **"Export to Excel"** button
3. An Excel file will be downloaded with three sheets:
   - **Summary**: Overview of the export
   - **Detailed Actions**: All admin actions with before/after data
   - **Login Events**: All login attempts with success/failure status

### Pagination

- Navigate through logs using **Previous** and **Next** buttons
- View count shows: "Showing X to Y of Z logs"

## Security Considerations

### 1. **Role Enforcement**
- Only users with `role = 'developer'` can access activity logs
- The backend verifies the role on every API request
- Attempting to access logs with a non-developer account returns 403 Forbidden

### 2. **Data Retention**
- Action logs are stored indefinitely by default
- Consider implementing a retention policy (e.g., keep logs for 1 year)
- Add a cleanup script:

```sql
-- Example: Delete logs older than 1 year
DELETE FROM admin_action_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
```

### 3. **Sensitive Data**
- Passwords are NEVER logged (they're already hashed)
- ID documents and passport scans are NOT included in logs (only file paths)
- Customer personal information IS logged when bookings are created/updated

### 4. **IP Logging**
- All actions include the requester's IP address
- Useful for detecting suspicious activity
- Can be used to track actions from specific locations

## API Endpoints

### Get All Admin Users (Developer Only)
```
GET /api/admin/users
Authorization: Bearer <token>
```

### Get Action Logs with Filters
```
GET /api/admin/action-logs?startDate=2025-01-01&endDate=2025-12-31&adminId=1&action=DELETE&entityType=car&limit=100&offset=0
Authorization: Bearer <token>
```

### Export Action Logs to Excel
```
GET /api/admin/action-logs/export?startDate=2025-01-01&endDate=2025-12-31
Authorization: Bearer <token>
```

## Troubleshooting

### "Activity Logs tab doesn't appear"

**Cause**: You're not logged in as a developer user

**Solution**:
1. Logout
2. Login with developer credentials
3. Check localStorage in browser console: `localStorage.getItem('adminUser')` should show `"role":"developer"`

### "Failed to load activity logs"

**Possible causes**:
1. Database table not created
2. Role not added to ENUM
3. Server error

**Solution**:
```sql
-- Check if table exists
SHOW TABLES LIKE 'admin_action_logs';

-- Check if developer role exists
SHOW COLUMNS FROM admin_users LIKE 'role';
```

### "Access denied. Developer role required"

**Cause**: Your account role is not 'developer'

**Solution**:
```sql
-- Update your account to developer role
UPDATE admin_users SET role = 'developer' WHERE username = 'your-username';
```

Then logout and login again.

### "No logs showing up"

**Cause**: No actions have been logged yet (fresh installation)

**Solution**: Perform some admin actions:
1. Create a car
2. Update a booking status
3. Logout and login again
4. Go to Activity Logs - you should see these actions

## Adding More Admin Users with Developer Role

### Method 1: Using SQL

```sql
-- Generate password hash first (using Node.js on your local machine):
-- node -e "const bcrypt = require('bcrypt'); bcrypt.hash('your-password', 10).then(hash => console.log(hash));"

INSERT INTO admin_users (username, password, full_name, role)
VALUES ('john-dev', '$2b$10$YOUR_HASH_HERE', 'John Developer', 'developer');
```

### Method 2: Using the Setup Script

```bash
# On your local machine
node setup-admin-users.js

# Follow the prompts and select "developer" for the role
```

## Performance Considerations

### Index Optimization

The action_logs table includes indexes on:
- `admin_id`
- `created_at`
- `action`
- `entity_type`
- `admin_username`
- Composite indexes for common filter combinations

### Large Datasets

If you have millions of log entries:
1. Consider archiving old logs to a separate table
2. Implement table partitioning by date
3. Use higher limit values to reduce pagination overhead

## Future Enhancements

Potential features to add:
1. Real-time log streaming (WebSocket)
2. Alert notifications for critical actions (e.g., mass deletions)
3. Audit trail reports by date range
4. Data retention policies with automatic cleanup
5. Advanced search with full-text search capabilities
6. Dashboard with action statistics and charts

## Support

For issues or questions:
1. Check the server logs: `pm2 logs` (if using PM2)
2. Check browser console for frontend errors
3. Verify database connectivity and schema

## Credits

Developer Role and Activity Logging System
Implemented: January 2025
