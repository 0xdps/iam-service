-- Auth Database Schema
\c authdb;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    mfa_secret TEXT,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Sessions table  
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_revoked ON sessions(revoked);

-- Grant permissions to authuser
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authuser;
GRANT USAGE ON SCHEMA public TO authuser;

-- Insert sample admin user
INSERT INTO users (email, password_hash) VALUES 
('admin@example.com', 'C5U6ACN4PDKASAEQ26BTBWWH5ESGNXSC4HQFA7XR2IR56D3B6IOQ====')
ON CONFLICT (email) DO NOTHING;