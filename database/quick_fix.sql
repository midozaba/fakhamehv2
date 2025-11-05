-- Quick fix: Create admin_action_logs table WITHOUT foreign key constraint
-- Run this in phpMyAdmin

CREATE TABLE IF NOT EXISTS admin_action_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,

  -- Admin user information
  admin_id INT NOT NULL,
  admin_username VARCHAR(100) NOT NULL,
  admin_role VARCHAR(50) NOT NULL,

  -- Action details
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INT,
  description TEXT,

  -- Data snapshots
  old_data JSON,
  new_data JSON,

  -- Request metadata
  ip_address VARCHAR(45),
  user_agent TEXT,

  -- Timestamp
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Indexes for efficient querying
  INDEX idx_admin_id (admin_id),
  INDEX idx_created_at (created_at),
  INDEX idx_action (action),
  INDEX idx_entity_type (entity_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
