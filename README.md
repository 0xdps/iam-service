# IAM Service Platform

A comprehensive Identity and Access Management (IAM) platform built with microservices architecture, featuring authentication, authorization, role-based access control, and audit logging.

## Architecture Overview

The platform consists of three main services:

- **Auth Service** (Go): Handles authentication, JWT tokens, sessions, and MFA
- **IAM Service** (Node.js/TypeScript): Manages users, roles, permissions, and authorization
- **Admin Frontend** (React/TypeScript): Web interface for platform administration

Supporting infrastructure includes PostgreSQL databases and Redis for caching and events.

## Features

### Authentication Service (Go)
- User registration and login
- JWT token generation (3-5 minute expiration)
- Session management with Redis
- Token revocation and blacklisting
- TOTP-based Multi-Factor Authentication (MFA)
- Password hashing with Argon2
- Event publishing to Redis Streams

### IAM Service (Node.js/TypeScript)
- User, role, and permission management
- Role-based access control (RBAC)
- Resource and action-based permissions
- Authorization middleware
- Audit logging
- Event-driven cache invalidation
- RESTful API with comprehensive endpoints

### Admin Frontend (React/TypeScript)
- Responsive admin dashboard
- User authentication with MFA support
- User management interface
- Role and permission management
- Real-time statistics and metrics
- Audit log viewer
- Secure JWT-based authentication

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Make (for build commands)
- Node.js (for local development)
- Go (for local development)

### Using Make Commands

The project uses Makefiles for easy development and deployment:

```bash
# Show all available commands
make help

# Install all dependencies
make install

# Start all services in development mode
make dev

# Build all services
make build

# Start all services in production mode
make start

# View logs from all services
make logs

# Check health of all services
make health-check

# Run tests across all services
make test

# Clean all build artifacts
make clean
```

### Using Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up --build -d
```

## Service-Specific Commands

### Auth Service (Go)
```bash
cd auth
make help      # Show available commands
make dev       # Run in development mode
make test      # Run tests
make lint      # Run linting
```

### IAM Service (Node.js/TypeScript)
```bash
cd iam
make help      # Show available commands
make dev       # Run in development mode
make test      # Run tests
make lint      # Run TypeScript linting
```

### Admin Frontend (React/TypeScript)
```bash
cd admin
make help      # Show available commands
make dev       # Run development server
make build     # Build for production
make test      # Run tests
```

## Technology Stack

- **Auth Service**: Go, Gin, PostgreSQL, Redis, Argon2, JWT
- **IAM Service**: Node.js, TypeScript, Express, PostgreSQL, Redis
- **Admin Frontend**: React, TypeScript, React Router
- **Infrastructure**: Docker, Docker Compose, NGINX, PostgreSQL, Redis

## Security Features

- **Password Security**: Argon2 hashing
- **JWT Tokens**: Short-lived access tokens (3-5 minutes)
- **Refresh Tokens**: Secure, rotating refresh tokens
- **MFA Support**: TOTP-based Multi-Factor Authentication
- **Session Management**: Redis-based session storage
- **Token Revocation**: Real-time token and session revocation
- **Rate Limiting**: Configurable request rate limiting
- **Audit Logging**: Comprehensive activity tracking

## Event-Driven Architecture

Uses Redis Streams for real-time event processing:

- **Events**: `user.blocked`, `session.revoked`, `membership.changed`, `role.updated`
- **Consumers**: Auth service handles revocations, IAM service manages cache invalidation
- **Streams**: `stream:iam.events`

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd iam-service
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost
   - Auth API: http://localhost/auth/v1
   - IAM API: http://localhost/iam/v1

### Default Credentials

```
Email: admin@example.com
Password: password123
```

## API Examples

### Authentication
```bash
# Login
curl -X POST http://localhost/auth/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Refresh token
curl -X POST http://localhost/auth/v1/token/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"your-refresh-token"}'
```

### Authorization
```bash
# Check permissions
curl -X POST http://localhost/iam/v1/authorize \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{"action":"read","resource":"users"}'
```

## Database Schema

### Auth Database
- `users` - User credentials and MFA secrets
- `sessions` - Refresh token sessions

### IAM Database
- `users` - User profiles and status
- `groups` - User groups
- `roles` - System roles
- `permissions` - Granular permissions
- `user_groups`, `user_roles`, `group_roles`, `role_permissions` - Relationship tables
- `audit_logs` - Activity audit trail

## Development

### Local Development Setup

1. **Install dependencies**
   ```bash
   # Auth service
   cd auth && go mod download

   # IAM service
   cd iam && npm install

   # Admin Frontend
   cd admin && npm install
   ```

2. **Run services individually**
   ```bash
   # Start databases first
   docker-compose up -d auth-db iam-db redis

   # Auth service
   cd auth && make dev

   # IAM service
   cd iam && make dev

   # Admin Frontend
   cd admin && make dev
   ```

### Environment Variables

| Variable | Service | Description | Default |
|----------|---------|-------------|---------|
| `PORT` | All | Service port | 8080/3000 |
| `DB_HOST` | Auth/IAM | Database host | localhost |
| `DB_PORT` | Auth/IAM | Database port | 5432/5433 |
| `DB_NAME` | Auth/IAM | Database name | authdb/iamdb |
| `DB_USER` | Auth/IAM | Database user | authuser/iamuser |
| `DB_PASSWORD` | Auth/IAM | Database password | authpass/iampass |
| `REDIS_URL` | Auth/IAM | Redis connection | localhost:6379 |
| `JWT_SECRET` | Auth | JWT signing key | your-super-secret-jwt-key |

## Monitoring & Health Checks

- **Health Endpoints**: `/health` on all services
- **Database Monitoring**: Connection pooling and query logging
- **Redis Monitoring**: Connection status and event stream health

## Security Considerations

1. **Change default JWT secret** in production
2. **Use TLS/SSL** for all external communications
3. **Configure proper CORS** settings
4. **Set up proper logging** and monitoring
5. **Regular security audits** of dependencies
6. **Implement proper backup** strategies for databases

## Deployment

### Production Checklist

- [ ] Change default passwords and secrets
- [ ] Configure TLS certificates
- [ ] Set up database backups
- [ ] Configure log aggregation
- [ ] Set up monitoring and alerting
- [ ] Review and harden NGINX configuration
- [ ] Configure proper resource limits
- [ ] Test disaster recovery procedures

### Scaling Considerations

- **Horizontal Scaling**: Multiple instances behind load balancer
- **Database**: Read replicas and connection pooling
- **Redis**: Redis Cluster for high availability
- **Caching**: CDN for frontend assets
- **Session Storage**: Redis Cluster or external session store

## Troubleshooting

### Common Issues

1. **Database Connection Errors**: Check database containers are running
2. **Redis Connection Issues**: Verify Redis container status
3. **JWT Token Errors**: Check JWT secret configuration
4. **CORS Issues**: Review NGINX and frontend configuration
5. **Permission Denied**: Check user roles and permissions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.