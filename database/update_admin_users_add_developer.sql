-- Update admin_users table to add 'developer' role
-- This adds the developer role to the existing ENUM

ALTER TABLE admin_users
MODIFY COLUMN role ENUM('admin', 'manager', 'viewer', 'developer') DEFAULT 'viewer';
