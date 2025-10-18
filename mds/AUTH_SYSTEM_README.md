# Authentication System Documentation

## Overview
A complete JWT-based authentication system has been implemented for the Al-Fakhama Car Rental application.

## Features
- JWT-based authentication with bcrypt password hashing
- Protected routes with role-based access control
- Login/Logout functionality
- Persistent sessions using localStorage
- User dashboard with profile information

## Database Users

Three users have been created in the database:

### 1. Admin User
- **Username:** `admin`
- **Password:** `admin123`
- **Email:** admin@alfakhama.com
- **Role:** admin
- **Access:** Full administrative access

### 2. Regular User
- **Username:** `john_doe`
- **Password:** `user123`
- **Email:** john.doe@example.com
- **Role:** user
- **Access:** Standard user access

### 3. Manager User
- **Username:** `manager1`
- **Password:** `manager123`
- **Email:** manager@alfakhama.com
- **Role:** manager
- **Access:** Manager-level access

## Routes

### Public Routes
- `/` - Home page
- `/cars` - Cars listing
- `/booking` - Booking page
- `/contact-us` - Contact page
- `/about-us` - About page
- `/faq` - FAQ page
- `/login` - Login page

### Protected Routes
- `/admin/dashboard` - Admin/Manager dashboard (requires admin or manager role)

## API Endpoints

### Authentication Endpoints

#### POST `/api/auth/login`
Login a user and receive a JWT token.

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@alfakhama.com",
    "full_name": "Admin User",
    "role": "admin",
    "phone": "+962791234567"
  }
}
```

#### GET `/api/auth/me`
Get current authenticated user information (requires JWT token).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@alfakhama.com",
    "full_name": "Admin User",
    "role": "admin",
    "phone": "+962791234567",
    "is_active": 1,
    "created_at": "2025-10-09T21:08:47.000Z"
  }
}
```

#### POST `/api/auth/logout`
Logout current user (client-side removes token).

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Usage

### How to Login

1. Navigate to [http://localhost:5173/login](http://localhost:5173/login)
2. Enter credentials (use one of the demo accounts above)
3. Click "Login"
4. You'll be redirected to the dashboard if you're an admin/manager, or to home if you're a regular user

### How to Access Protected Routes

Protected routes automatically redirect to login if you're not authenticated. After logging in with appropriate credentials, you can access:

- Admin Dashboard: [http://localhost:5173/admin/dashboard](http://localhost:5173/admin/dashboard)
  - Requires `admin` or `manager` role

### How to Logout

Click the "Logout" button in the admin dashboard header.

## Technical Implementation

### Frontend Components

1. **Login Component** (`src/components/Login.jsx`)
   - Beautiful login form with validation
   - Supports both English and Arabic
   - Shows demo credentials

2. **AdminDashboard Component** (`src/components/AdminDashboard.jsx`)
   - Displays user information
   - Quick action cards for management
   - Logout functionality

3. **ProtectedRoute Component** (`src/components/ProtectedRoute.jsx`)
   - HOC for protecting routes
   - Supports role-based access control
   - Redirects to login if not authenticated

### Backend

1. **Authentication Middleware** (`server.js`)
   - JWT verification middleware
   - Token-based authentication
   - Role-based authorization

2. **User Table** (MySQL Database)
   - Stores user credentials
   - Bcrypt hashed passwords
   - User roles and permissions

### Security Features

- ✅ Passwords hashed with bcrypt (salt rounds: 10)
- ✅ JWT tokens with 24-hour expiration
- ✅ Secure JWT secret (should be changed in production)
- ✅ Protected API endpoints
- ✅ Role-based access control
- ✅ Persistent sessions with localStorage

## Environment Variables

Added to `.env`:
```
JWT_SECRET=alfakhama_jwt_secret_key_2025_change_in_production
```

**⚠️ IMPORTANT:** Change the JWT_SECRET in production!

## Testing the System

### Test Login Flow:
1. Visit [http://localhost:5173](http://localhost:5173)
2. Navigate to Login
3. Login with `admin` / `admin123`
4. You'll be redirected to `/admin/dashboard`
5. View your profile information
6. Logout and test with other users

### Test Protected Routes:
1. Try to access `/admin/dashboard` without logging in
2. You'll be redirected to `/login`
3. After login, you can access the dashboard

### Test Role-Based Access:
1. Login as `john_doe` (regular user)
2. Try to access `/admin/dashboard`
3. You'll be redirected to home page (insufficient permissions)

## Scripts

### Create Users
```bash
node create-users.js
```
Creates the 3 users in the database (already executed).

### Verify Users
```bash
node verify-users.js
```
Lists all users in the database.

## Future Enhancements

- [ ] Password reset functionality
- [ ] Email verification
- [ ] 2FA (Two-Factor Authentication)
- [ ] Remember me option
- [ ] User registration
- [ ] Admin user management interface
- [ ] Refresh tokens for extended sessions
- [ ] OAuth integration (Google, Facebook)
- [ ] Session management (view active sessions)
- [ ] Password strength requirements
- [ ] Account lockout after failed attempts

## Files Modified/Created

### New Files:
- `src/components/Login.jsx` - Login page
- `src/components/AdminDashboard.jsx` - Admin dashboard
- `src/components/ProtectedRoute.jsx` - Route protection HOC
- `create-users.js` - Script to create users
- `verify-users.js` - Script to verify users
- `database/create_users.sql` - SQL schema for users table

### Modified Files:
- `server.js` - Added auth endpoints and middleware
- `src/App.jsx` - Added login and protected routes
- `src/context/AppContext.jsx` - Added auth state and methods
- `.env` - Added JWT_SECRET
- `package.json` - Added bcrypt and jsonwebtoken

## Support

For issues or questions about the authentication system, check:
1. Console for error messages
2. Network tab for API responses
3. Database for user records

## License

This authentication system is part of the Al-Fakhama Car Rental application.
