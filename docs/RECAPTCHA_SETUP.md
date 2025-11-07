# reCAPTCHA Setup Guide

This project has been configured with Google reCAPTCHA v2 to protect the following forms from spam and abuse:
- Booking Page
- Review Submission
- Contact/Messages Form

## Setup Instructions

### 1. Get reCAPTCHA Keys

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Click on the **+** button to create a new site
3. Fill in the form:
   - **Label**: Your site name (e.g., "Al Fakhama Car Rental")
   - **reCAPTCHA type**: Choose "reCAPTCHA v2" → "I'm not a robot" Checkbox
   - **Domains**: Add your domain(s):
     - For development: `localhost`
     - For production: `yourdomain.com`
   - Accept the reCAPTCHA Terms of Service
4. Click **Submit**
5. You'll receive two keys:
   - **Site Key** (for client-side)
   - **Secret Key** (for server-side)

### 2. Configure Environment Variables

Open your `.env` file and replace the placeholder values with your actual keys:

```env
# Google reCAPTCHA Configuration
VITE_RECAPTCHA_SITE_KEY=your_actual_site_key_here
RECAPTCHA_SECRET_KEY=your_actual_secret_key_here
```

**Important Notes:**
- The `VITE_` prefix is required for the site key to be accessible in the client-side code
- Keep your secret key confidential - never commit it to version control
- Make sure `.env` is in your `.gitignore` file

### 3. Restart Your Development Server

After updating the environment variables, restart your development servers:

```bash
# Stop the servers (Ctrl+C)

# Restart the backend
npm run server

# In a new terminal, restart the frontend
npm run dev
```

## How It Works

### Client-Side (Frontend)
- A reCAPTCHA widget appears on each protected form
- Users must complete the "I'm not a robot" challenge
- The widget generates a token upon successful completion
- The token is sent with the form submission

### Server-Side (Backend)
- The server receives the reCAPTCHA token
- It verifies the token with Google's API
- If verification fails, the request is rejected
- If successful, the form data is processed

## Protected Endpoints

The following API endpoints now require reCAPTCHA verification:

1. **POST /api/bookings** - Booking submissions
2. **POST /api/reviews/submit** - Review submissions
3. **POST /api/contact** - Contact form submissions

## Testing

### Development Testing
- The reCAPTCHA will work on `localhost` if you added it to your domains list
- You can test by submitting forms without completing the captcha (should fail)
- Then test by completing the captcha (should succeed)

### Production Deployment
- Make sure to add your production domain to the reCAPTCHA admin console
- Update the environment variables on your production server
- Test all forms after deployment

## Troubleshooting

### "reCAPTCHA token is required" Error
- Make sure you've added the site key to `.env`
- Restart your development server after updating `.env`
- Check browser console for any errors loading the reCAPTCHA widget

### "reCAPTCHA verification failed" Error
- Verify that your secret key is correct in `.env`
- Make sure your domain is registered in the reCAPTCHA admin console
- Check that you're using the correct reCAPTCHA type (v2 Checkbox)

### Widget Not Showing
- Check that `VITE_RECAPTCHA_SITE_KEY` is set in `.env`
- Make sure the site key is correct
- Check browser console for network errors

## Security Best Practices

1. **Never expose your secret key** - It should only exist in:
   - `.env` file (not committed to git)
   - Server environment variables (production)

2. **Use HTTPS in production** - reCAPTCHA works best with secure connections

3. **Monitor your reCAPTCHA dashboard** - Check for unusual activity

4. **Keep keys updated** - Rotate keys periodically for security

## Additional Resources

- [Google reCAPTCHA Documentation](https://developers.google.com/recaptcha/docs/display)
- [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
- [react-google-recaptcha NPM Package](https://www.npmjs.com/package/react-google-recaptcha)
