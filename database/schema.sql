-- Al Fakhama Car Rental Database Schema
-- PostgreSQL Database Schema

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- CARS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS cars (
    car_id SERIAL PRIMARY KEY,
    car_barnd VARCHAR(100) NOT NULL,
    car_type VARCHAR(100) NOT NULL,
    car_model INTEGER NOT NULL,
    car_num INTEGER UNIQUE NOT NULL,
    price_per_day DECIMAL(10, 2) NOT NULL,
    price_per_week DECIMAL(10, 2) NOT NULL,
    price_per_month DECIMAL(10, 2) NOT NULL,
    car_color VARCHAR(50) NOT NULL,
    mileage INTEGER,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'rented', 'maintenance', 'unavailable')),
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_cars_status ON cars(status);
CREATE INDEX IF NOT EXISTS idx_cars_brand_type ON cars(car_barnd, car_type);

-- ========================================
-- BOOKINGS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS bookings (
    booking_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Car Information
    car_id INTEGER REFERENCES cars(car_id),
    car_brand VARCHAR(100) NOT NULL,
    car_type VARCHAR(100) NOT NULL,
    car_model INTEGER NOT NULL,
    car_color VARCHAR(50) NOT NULL,

    -- Customer Information
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_license VARCHAR(100) NOT NULL,

    -- Address Information
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    area VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) NOT NULL,

    -- Booking Details
    pickup_date DATE NOT NULL,
    return_date DATE NOT NULL,
    days INTEGER NOT NULL,

    -- Insurance and Services
    insurance_type VARCHAR(50) NOT NULL CHECK (insurance_type IN ('basic', 'full', 'premium')),
    additional_services TEXT[], -- Array of services: ['phone', 'wifi', 'gps', 'childSeat', 'airportPickup']

    -- Pricing Breakdown
    base_price DECIMAL(10, 2) NOT NULL,
    insurance_price DECIMAL(10, 2) NOT NULL,
    services_price DECIMAL(10, 2) NOT NULL,
    airport_pickup_price DECIMAL(10, 2) DEFAULT 0,
    total_price DECIMAL(10, 2) NOT NULL,

    -- Document Paths
    id_document_path TEXT NOT NULL,
    passport_document_path TEXT NOT NULL,

    -- Status Management
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT valid_dates CHECK (return_date > pickup_date),
    CONSTRAINT positive_days CHECK (days > 0),
    CONSTRAINT positive_prices CHECK (
        base_price >= 0 AND
        insurance_price >= 0 AND
        services_price >= 0 AND
        airport_pickup_price >= 0 AND
        total_price >= 0
    )
);

-- Indexes for bookings
CREATE INDEX IF NOT EXISTS idx_bookings_customer_email ON bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(pickup_date, return_date);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_car_id ON bookings(car_id);

-- ========================================
-- CONTACT MESSAGES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS contact_messages (
    message_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(500),
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for contact messages
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);

-- ========================================
-- TRIGGERS FOR UPDATED_AT
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for cars table
DROP TRIGGER IF EXISTS update_cars_updated_at ON cars;
CREATE TRIGGER update_cars_updated_at
    BEFORE UPDATE ON cars
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for bookings table
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for contact_messages table
DROP TRIGGER IF EXISTS update_contact_messages_updated_at ON contact_messages;
CREATE TRIGGER update_contact_messages_updated_at
    BEFORE UPDATE ON contact_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- VIEWS (Optional - for easier querying)
-- ========================================

-- View for active bookings with car details
CREATE OR REPLACE VIEW active_bookings AS
SELECT
    b.booking_id,
    b.customer_name,
    b.customer_email,
    b.customer_phone,
    b.car_brand,
    b.car_type,
    b.car_model,
    b.pickup_date,
    b.return_date,
    b.days,
    b.total_price,
    b.status,
    b.created_at,
    c.status as car_current_status
FROM bookings b
LEFT JOIN cars c ON b.car_id = c.car_id
WHERE b.status IN ('pending', 'confirmed', 'in_progress')
ORDER BY b.pickup_date ASC;

-- View for available cars
CREATE OR REPLACE VIEW available_cars AS
SELECT
    car_id,
    car_barnd,
    car_type,
    car_model,
    car_num,
    price_per_day,
    price_per_week,
    price_per_month,
    car_color,
    mileage,
    status
FROM cars
WHERE status = 'available'
ORDER BY car_barnd, car_type;

-- ========================================
-- INITIAL COMMENTS
-- ========================================
COMMENT ON TABLE cars IS 'Stores all car inventory information';
COMMENT ON TABLE bookings IS 'Stores all booking requests and their details';
COMMENT ON TABLE contact_messages IS 'Stores all contact form submissions';
COMMENT ON VIEW active_bookings IS 'Shows all active bookings with car details';
COMMENT ON VIEW available_cars IS 'Shows all available cars for rental';
