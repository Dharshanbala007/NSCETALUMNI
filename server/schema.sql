-- Create Alumni table
CREATE TABLE IF NOT EXISTS alumni (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(100) NULL,
    email VARCHAR(255) UNIQUE NULL,
    batch_year INT NOT NULL,
    department VARCHAR(100) NOT NULL,
    current_company VARCHAR(255) NULL,
    "current_role" VARCHAR(255) NULL,
    location_city VARCHAR(100) NULL,
    location_country VARCHAR(100) DEFAULT 'India',
    location_lat DOUBLE PRECISION NULL,
    location_lng DOUBLE PRECISION NULL,
    bio TEXT NULL,
    skills TEXT[] NULL,
    achievements TEXT[] NULL,
    mentor_available BOOLEAN DEFAULT FALSE,
    mentor_fields TEXT[] NULL,
    verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'pending',
    placed BOOLEAN DEFAULT FALSE,
    experience_years VARCHAR(50) NULL,
    photo_url TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Users table (for authentication)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'admin' or 'alumni'
    alumni_id INT REFERENCES alumni(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Edit Requests table (for alumni profile moderation)
CREATE TABLE IF NOT EXISTS edit_requests (
    id SERIAL PRIMARY KEY,
    alumni_id INT REFERENCES alumni(id) ON DELETE CASCADE,
    pending_data JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
