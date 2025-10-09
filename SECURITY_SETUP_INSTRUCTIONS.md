# Security Setup Instructions

## Quick Start

Follow these steps to complete the security setup:

### Step 1: Create the Login Attempts Table

Run this SQL command in your MySQL database:

```bash
mysql -u root -p1234 alfakhama_rental < database/create_login_attempts_table.sql
```

Or manually execute in phpMyAdmin/MySQL Workbench:

```sql
CREATE TABLE IF NOT EXISTS login_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  success BOOLEAN NOT NULL DEFAULT FALSE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_attempted_at (attempted_at),
  INDEX idx_success (success)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Step 2: Verify Environment Variables

Your `.env` file has been updated with security settings. Verify these are present:

```env
JWT_SECRET=alfakhama_jwt_secret_key_2025_change_in_production
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

**⚠️ IMPORTANT FOR PRODUCTION:**
- Generate a new, strong JWT_SECRET before deploying
- Set `NODE_ENV=production`
- Add your production domain to ALLOWED_ORIGINS

### Step 3: Test the Security Features

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Test Rate Limiting:**
   - Try logging in with wrong credentials 6 times
   - You should see: "Too many login attempts. Please try again after 15 minutes."

3. **Check Login Logs:**
   ```sql
   SELECT * FROM login_attempts ORDER BY attempted_at DESC LIMIT 10;
   ```

4. **Verify Cookies:**
   - Login successfully
   - Open Browser DevTools → Application → Cookies
   - Look for `adminToken` cookie with HttpOnly flag

## What Was Fixed

### ✅ 1. JWT Secret Validation
- Server now requires JWT_SECRET environment variable
- No fallback to insecure default value
- Server exits on startup if JWT_SECRET is missing

### ✅ 2. Rate Limiting
- Maximum 5 failed login attempts per 15 minutes per IP
- Successful logins don't count against limit
- Automatic reset after time window

### ✅ 3. Test Credentials Removed
- Removed exposed credentials from login UI
- No security-sensitive information displayed

### ✅ 4. HTTPS Enforcement
- Automatic HTTP → HTTPS redirect in production
- Only active when NODE_ENV=production

### ✅ 5. CORS Security
- Whitelist-based origin validation
- Configurable via ALLOWED_ORIGINS environment variable
- Credentials (cookies) support enabled

### ✅ 6. HttpOnly Cookies
- JWT tokens stored in secure httpOnly cookies
- Protection against XSS attacks
- SameSite=strict for CSRF protection
- Secure flag in production (HTTPS only)

### ✅ 7. Login Attempt Logging
- All login attempts logged to database
- Tracks: username, success/failure, IP, user agent, timestamp
- Useful for security audits and threat detection

### ✅ 8. Security Headers
- Helmet.js middleware added
- Content Security Policy configured
- Protection against common web vulnerabilities

## Frontend Updates Required

Your admin panel frontend needs small updates to work with cookies:

### Update API Calls

Add `credentials: 'include'` to all admin API calls:

```javascript
// Login
const response = await fetch('http://localhost:3001/api/admin/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // ← Add this
  body: JSON.stringify({ username, password })
});

// Logout
await fetch('http://localhost:3001/api/admin/logout', {
  method: 'POST',
  credentials: 'include' // ← Add this
});

// Protected routes
await fetch('http://localhost:3001/api/admin/stats', {
  credentials: 'include' // ← Add this
});
```

**Note:** The system still supports localStorage tokens for backward compatibility.

## Production Deployment Checklist

Before going live:

- [ ] Generate strong JWT_SECRET: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- [ ] Update JWT_SECRET in production .env
- [ ] Set NODE_ENV=production
- [ ] Add production domain(s) to ALLOWED_ORIGINS
- [ ] Ensure SSL/TLS certificate is installed
- [ ] Test HTTPS redirect
- [ ] Verify rate limiting works
- [ ] Test login attempt logging
- [ ] Review security headers with https://securityheaders.com
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Set up monitoring for login_attempts table

## Monitoring Login Attempts

Query failed login attempts:

```sql
-- Failed attempts in last 24 hours
SELECT username, ip_address, attempted_at
FROM login_attempts
WHERE success = FALSE
  AND attempted_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
ORDER BY attempted_at DESC;

-- Suspicious activity (multiple IPs for same user)
SELECT username, COUNT(DISTINCT ip_address) as ip_count
FROM login_attempts
WHERE attempted_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY username
HAVING ip_count > 3;
```

## Troubleshooting

### Server won't start
**Error:** "JWT_SECRET is not defined"
**Solution:** Make sure `.env` file exists and contains `JWT_SECRET=...`

### Can't login
**Error:** "Too many login attempts"
**Solution:** Wait 15 minutes or clear the specific IP from rate limiter

### Cookies not working
**Solution:**
1. Check ALLOWED_ORIGINS includes your frontend URL
2. Verify `credentials: 'include'` in fetch calls
3. Check browser doesn't block third-party cookies

### CORS errors
**Error:** "CORS policy... does not allow access"
**Solution:** Add your frontend URL to ALLOWED_ORIGINS in .env

## Additional Security Recommendations

Consider implementing in the future:

1. **Account Lockout** - Disable account after N failed attempts
2. **Two-Factor Authentication** - Add TOTP/SMS verification
3. **Session Management** - Server-side token revocation
4. **IP Whitelisting** - Restrict admin access by IP
5. **Password Policy** - Enforce complexity requirements
6. **Regular Audits** - Review login_attempts weekly

## Documentation

- Full details: See `SECURITY_FIXES.md`
- Environment variables: See `.env.example`
- Database schema: See `database/create_login_attempts_table.sql`

---

**Need Help?** Review the logs in the `login_attempts` table for debugging.
