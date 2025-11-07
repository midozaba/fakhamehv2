# Production Environment Setup

## Cookie Configuration for Multi-Browser Support

### Issue
Login works in one browser but not another in production.

### Root Cause
Cookie configuration needs to be adjusted for production environments, especially when:
- Using HTTPS
- Serving from different domains/subdomains
- Supporting multiple browsers (Chrome, Firefox, Safari, Edge)

### Solution

Add these variables to your **production** `.env` file:

```bash
# Node Environment (IMPORTANT!)
NODE_ENV=production

# Cookie Domain (optional but recommended)
# Use your root domain with a leading dot to allow subdomains
# Examples:
#   - For www.example.com and api.example.com, use: .example.com
#   - For single domain, use: example.com or leave empty
COOKIE_DOMAIN=.al-fakhamah-car-rent.com

# CORS Origins (CRITICAL!)
# Add ALL your production URLs (www and non-www, http and https)
ALLOWED_ORIGINS=https://www.al-fakhamah-car-rent.com,https://al-fakhamah-car-rent.com,http://www.al-fakhamah-car-rent.com,http://al-fakhamah-car-rent.com
```

### What Changed in Code

**Before:**
```javascript
res.cookie('adminToken', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 24 * 60 * 60 * 1000
});
```

**After:**
```javascript
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 24 * 60 * 60 * 1000,
  path: '/'
};

if (process.env.COOKIE_DOMAIN) {
  cookieOptions.domain = process.env.COOKIE_DOMAIN;
}

res.cookie('adminToken', token, cookieOptions);
```

### Key Improvements

1. **`sameSite: 'none'` in production**
   - Required for cross-site cookies (especially important if backend and frontend are on different domains)
   - Only works with `secure: true` (HTTPS)

2. **`path: '/'`**
   - Ensures cookie is available for all routes

3. **`domain` option**
   - Allows cookie to work across subdomains
   - Example: `.example.com` works for `www.example.com`, `api.example.com`, etc.

### Browser-Specific Notes

#### Safari
- Strictest cookie policies
- Requires `sameSite: 'none'` and `secure: true` for cross-site
- Blocks third-party cookies by default

#### Chrome/Edge
- Support `sameSite: 'none'` with `secure: true`
- Generally more permissive

#### Firefox
- Similar to Chrome
- Good standards compliance

### Testing Checklist

After deploying these changes:

- [ ] Clear all browser cookies and cache
- [ ] Test login in Chrome
- [ ] Test login in Firefox
- [ ] Test login in Safari
- [ ] Test login in Edge
- [ ] Test login in incognito/private mode
- [ ] Verify cookies are set correctly (check DevTools → Application → Cookies)
- [ ] Verify CORS headers in Network tab

### Troubleshooting

#### Still Not Working?

1. **Check browser console for errors:**
   ```
   F12 → Console → Look for CORS or cookie errors
   ```

2. **Check Network tab:**
   ```
   F12 → Network → Click login request → Headers
   Look for:
   - Set-Cookie header in Response
   - Cookie header in subsequent Requests
   ```

3. **Verify environment variables are loaded:**
   ```bash
   # SSH into your server
   echo $NODE_ENV
   # Should output: production
   ```

4. **Check server logs for CORS warnings:**
   ```bash
   # Look for: "CORS blocked origin: ..."
   pm2 logs
   ```

### Common Mistakes

❌ **Don't do this:**
```bash
# Missing NODE_ENV
COOKIE_DOMAIN=example.com

# Incomplete ALLOWED_ORIGINS
ALLOWED_ORIGINS=https://www.example.com
```

✅ **Do this:**
```bash
# Always set NODE_ENV
NODE_ENV=production

# Include ALL variations
ALLOWED_ORIGINS=https://www.example.com,https://example.com,http://www.example.com,http://example.com
```

### Security Notes

- ✅ `httpOnly: true` prevents XSS attacks
- ✅ `secure: true` in production requires HTTPS
- ✅ `sameSite: 'none'` with `secure: true` is safe for authenticated cookies
- ✅ JWT tokens are still sent in response for clients that don't support cookies

### Need Help?

If login still doesn't work after these changes:
1. Share the exact error from browser console
2. Share the browser name and version
3. Check if you're using HTTPS in production
