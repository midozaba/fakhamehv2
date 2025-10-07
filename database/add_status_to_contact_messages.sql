-- Add status column to contact_messages table
USE alfakhama_rental;

ALTER TABLE contact_messages
ADD COLUMN IF NOT EXISTS status ENUM('new', 'read', 'replied', 'archived') DEFAULT 'new' AFTER message;
