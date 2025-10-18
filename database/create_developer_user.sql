-- Create Developer User
-- This script creates a developer user with super admin access to view action logs

-- First, make sure the developer role is added to the ENUM
-- (Run update_admin_users_add_developer.sql first if not already done)

-- Then create the developer user
-- Password: developer123 (hashed using bcrypt with 10 rounds)
-- You can generate a new hash using: node -e "const bcrypt = require('bcrypt'); bcrypt.hash('your-password', 10).then(hash => console.log(hash));"

INSERT INTO admin_users (username, password, full_name, role)
VALUES ('developer', '$2b$10$rX8K9yJ6Q3tZ7M4pV2wL1eLqK5sJ8mT9nY6fH4uW3vC2bG7dA1eXm', 'Developer Admin', 'developer');

-- Note: The password hash above is for 'developer123'
-- It's recommended to change this password after first login
