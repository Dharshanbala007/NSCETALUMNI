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

-- Create Alumni Contributions table
CREATE TABLE IF NOT EXISTS alumni_contributions (
    id SERIAL PRIMARY KEY,
    alumni_id INT REFERENCES alumni(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- 'webinar', 'masterclass', 'workshop'
    description TEXT NULL,
    event_date TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'upcoming', -- 'upcoming', 'ongoing', 'completed'
    link VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Event Gallery table
CREATE TABLE IF NOT EXISTS event_gallery (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'general',
    image_url TEXT NOT NULL,
    event_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    posted_by INT REFERENCES alumni(id) ON DELETE CASCADE,
    company VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    location VARCHAR(255) NULL,
    description TEXT NULL,
    apply_link TEXT NULL,
    employment_type VARCHAR(100) DEFAULT 'Full-time',
    posted_date DATE DEFAULT CURRENT_DATE,
    referral_available BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Referral Requests table
CREATE TABLE IF NOT EXISTS referral_requests (
    id SERIAL PRIMARY KEY,
    job_id INT REFERENCES jobs(id) ON DELETE CASCADE,
    requester_id INT REFERENCES alumni(id) ON DELETE CASCADE,
    poster_id INT REFERENCES alumni(id) ON DELETE CASCADE,
    message TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Mentorship Requests table
CREATE TABLE IF NOT EXISTS mentorship_requests (
    id SERIAL PRIMARY KEY,
    mentor_id INT REFERENCES alumni(id) ON DELETE CASCADE NULL,
    mentee_id INT REFERENCES alumni(id) ON DELETE CASCADE,
    message TEXT NULL,
    field VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
