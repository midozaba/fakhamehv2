-- Action Logs Table for tracking all admin activities
-- This table records every CRUD operation, status change, and authentication event
-- performed by admin users for auditing and reporting purposes

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

  -- Foreign key constraint
  FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE,

  -- Indexes for efficient querying
  INDEX idx_admin_id (admin_id),
  INDEX idx_created_at (created_at),
  INDEX idx_action (action),
  INDEX idx_entity_type (entity_type),
  INDEX idx_admin_username (admin_username),
  INDEX idx_composite_admin_date (admin_id, created_at),
  INDEX idx_composite_entity (entity_type, entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
