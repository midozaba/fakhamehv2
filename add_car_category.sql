-- Add car_category column to cars table
USE alfakhama_rental;

ALTER TABLE cars ADD COLUMN IF NOT EXISTS car_category VARCHAR(50) AFTER car_num;

-- Verify the column was added
DESCRIBE cars;
