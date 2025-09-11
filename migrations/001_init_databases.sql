-- Initialize both auth and iam databases in a single PostgreSQL instance

-- Create databases
SELECT 'CREATE DATABASE authdb' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'authdb')\gexec
SELECT 'CREATE DATABASE iamdb' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'iamdb')\gexec

-- Create users (using DO blocks for conditional creation)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authuser') THEN
    CREATE USER authuser WITH PASSWORD 'authpass';
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'iamuser') THEN
    CREATE USER iamuser WITH PASSWORD 'iampass';
  END IF;
END $$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE authdb TO authuser;
GRANT ALL PRIVILEGES ON DATABASE iamdb TO iamuser;