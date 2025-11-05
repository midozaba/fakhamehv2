-- Action Logs Table for tracking all admin activities
-- This table records every CRUD operation, status change, and authentication event
-- performed by admin users for auditing and reporting purposes

-- First check if admin_users table exists
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(200),
  role ENUM('admin', 'manager', 'viewer', 'developer') DEFAULT 'viewer',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_username (username),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create login_attempts table if it doesn't exist
CREATE TABLE IF NOT EXISTS login_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  success BOOLEAN NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_attempted_at (attempted_at),
  INDEX idx_success (success)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Now create admin_action_logs table WITHOUT foreign key constraint initially
CREATE TABLE IF NOT EXISTS admin_action_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,

  -- Admin user information
  admin_id INT NOT NULL,
  admin_username VARCHAR(100) NOT NULL,
  admin_role VARCHAR(50) NOT NULL,

  -- Action details
  action VARCHAR(100) NOT NULL,  -- e.g., 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'STATUS_CHANGE'
  entity_type VARCHAR(50),       -- e.g., 'booking', 'car', 'review', 'message', 'admin_user'
  entity_id INT,                 -- ID of the affected entity (null for login/logout)
  description TEXT,              -- Human-readable description of the action

  -- Data snapshots
  old_data JSON,                 -- Previous state before the action (for updates/deletes)
  new_data JSON,                 -- New state after the action (for creates/updates)

  -- Request metadata
  ip_address VARCHAR(45),        -- IPv4 or IPv6 address
  user_agent TEXT,               -- Browser and OS information

  -- Timestamp
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Indexes for efficient querying
  INDEX idx_admin_id (admin_id),
  INDEX idx_created_at (created_at),
  INDEX idx_action (action),
  INDEX idx_entity_type (entity_type),
  INDEX idx_admin_username (admin_username),
  INDEX idx_composite_admin_date (admin_id, created_at),
  INDEX idx_composite_entity (entity_type, entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Try to add foreign key constraint (this will fail silently if it already exists)
-- Note: We don't use IF NOT EXISTS for ALTER TABLE, so we wrap it in a procedure
DELIMITER $$

DROP PROCEDURE IF EXISTS add_action_logs_fk$$

CREATE PROCEDURE add_action_logs_fk()
BEGIN
    DECLARE CONTINUE HANDLER FOR 1061, 1826 BEGIN END;  -- Ignore duplicate key and FK errors

    ALTER TABLE admin_action_logs
    ADD CONSTRAINT fk_action_logs_admin
    FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE;
END$$

DELIMITER ;

CALL add_action_logs_fk();
DROP PROCEDURE IF EXISTS add_action_logs_fk;
