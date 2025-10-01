-- Update foreign key constraint to allow car deletion
-- This will set car_id to NULL when a car is deleted, preserving booking history

-- Drop the existing foreign key constraint
ALTER TABLE bookings
DROP CONSTRAINT IF EXISTS bookings_car_id_fkey;

-- Add new constraint with ON DELETE SET NULL
ALTER TABLE bookings
ADD CONSTRAINT bookings_car_id_fkey
FOREIGN KEY (car_id)
REFERENCES cars(car_id)
ON DELETE SET NULL;
