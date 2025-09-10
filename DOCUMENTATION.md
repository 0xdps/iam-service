# IAM & Auth Platform - Complete Documentation

This comprehensive guide covers all aspects of the Identity and Access Management (IAM) platform, from setup to advanced usage.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [Development Guide](#development-guide)
- [Deployment](#deployment)
- [Security](#security)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## 🌟 Overview

The IAM & Auth Platform is a comprehensive identity and access management solution built with modern microservices architecture. It provides:

- **Authentication Service** (Go): JWT-based authentication with MFA support
- **IAM Service** (Node.js/TypeScript): User, role, and permission management
- **Admin Frontend** (React/TypeScript): Web-based administration interface
- **Event-Driven Architecture**: Redis Streams for real-time synchronization
- **Multi-Database Setup**: Separate PostgreSQL instances for auth and IAM data
- **Comprehensive Security**: Argon2 hashing, JWT tokens, session management

### Key Features

✅ **Multi-Factor Authentication** (TOTP-based)  
✅ **Role-Based Access Control** (RBAC)  
✅ **JWT Token Management** with short expiration  
✅ **Session Management** with Redis  
✅ **Audit Logging** for compliance  
✅ **Event-Driven Updates** via Redis Streams  
✅ **RESTful APIs** with comprehensive endpoints  
✅ **Responsive Admin Interface**  
✅ **Docker Containerization** with multiple deployment modes  
✅ **Comprehensive Testing** with coverage reports  

## 🏗️ Architecture

### System Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Admin Frontend                           │
│                  (React/TypeScript)                         │
│                     Port: 3001                              │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│                 API Gateway Layer                           │
└──────────────┬─────────────────────────────┬────────────────┘
               │                             │
               ▼                             ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│     Auth Service         │    │      IAM Service         │
│       (Go/Gin)          │◀──▶│   (Node.js/Express)     │
│     Port: 8080          │    │     Port: 3000          │
└─────────┬────────────────┘    └─────────┬────────────────┘
          │                               │
          ▼                               ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│   Auth Database          │    │   IAM Database           │
│   (PostgreSQL)           │    │   (PostgreSQL)           │
│   Port: 5432            │    │   Port: 5433            │
└──────────────────────────┘    └──────────────────────────┘
                            │
                            ▼
                  ┌──────────────────────────┐
                  │       Redis              │
                  │   (Cache & Events)       │
                  │     Port: 6379          │
                  └──────────────────────────┘
```

### Service Communication
- **Frontend ↔ Auth Service**: Direct HTTP/HTTPS API calls
- **Frontend ↔ IAM Service**: Direct HTTP/HTTPS API calls  
- **Auth Service ↔ IAM Service**: Internal API calls for token validation
- **Services ↔ Redis**: Event streaming and caching
- **Services ↔ Databases**: Direct PostgreSQL connections

### Data Flow
1. User logs in via Admin Frontend
2. Frontend sends credentials to Auth Service
3. Auth Service validates and returns JWT token
4. Frontend uses JWT for subsequent IAM Service calls
5. IAM Service validates JWT with Auth Service
6. Events published to Redis Streams for real-time updates

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Make (GNU Make)
- Node.js 16+ (for local development)
- Go 1.19+ (for local development)
- PostgreSQL client tools (optional)
- Redis client tools (optional)

### 1. Clone and Setup
```bash
git clone <repository-url>
cd iam-service
make dev-setup
```

### 2. Start Complete System
```bash
# Start all services (Backend + Frontend + Databases)
make run-full

# Access points:
# Admin Dashboard: http://localhost:3001
# Auth API: http://localhost:8080/api/auth
# IAM API: http://localhost:3000/api
```

### 3. Default Login
```
Email: admin@example.com
Password: password123
```

### 4. Verify Installation
```bash
make health-check
make status
```

## 📚 API Documentation

### Auth Service API (`/api/auth`)

#### Authentication Endpoints

**POST `/api/auth/login`**
Authenticate user and receive JWT token
```json
{
  "email": "user@example.com",
  "password": "password123",
  "totp_code": "123456"  // Optional MFA code
}
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "refresh_token_here",
  "expires_in": 300,
  "user": {
    "id": "user-id",
    "email": "user@example.com"
  }
}
```

**POST `/api/auth/refresh`**
Refresh expired JWT token
```json
{
  "refresh_token": "refresh_token_here"
}
```

**POST `/api/auth/logout`**
Logout and invalidate tokens
```bash
curl -X POST http://localhost:8080/api/auth/logout \
  -H "Authorization: Bearer <token>"
```

**POST `/api/auth/introspect`**
Validate token (internal use)
```bash
curl -X POST http://localhost:8080/api/auth/introspect \
  -H "Authorization: Bearer <token>"
```

#### MFA Endpoints

**POST `/api/auth/mfa/setup`**
Setup TOTP-based MFA
```bash
curl -X POST http://localhost:8080/api/auth/mfa/setup \
  -H "Authorization: Bearer <token>"
```

**POST `/api/auth/mfa/verify`**
Verify MFA code
```json
{
  "email": "user@example.com",
  "totp_code": "123456"
}
```

### IAM Service API (`/api`)

#### User Management

**GET `/api/users`**
List all users
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/users
```

**POST `/api/users`**
Create new user
```json
{
  "email": "newuser@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role_ids": ["role-1", "role-2"]
}
```

**GET `/api/users/:id`**
Get user by ID
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/users/user-id
```

**PUT `/api/users/:id`**
Update user
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "status": "active"
}
```

**DELETE `/api/users/:id`**
Delete user
```bash
curl -X DELETE -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/users/user-id
```

#### Role Management

**GET `/api/roles`**
List all roles
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/roles
```

**POST `/api/roles`**
Create new role
```json
{
  "name": "Admin",
  "description": "Administrative role",
  "permission_ids": ["perm-1", "perm-2"]
}
```

#### Permission Management

**GET `/api/permissions`**
List all permissions
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/permissions
```

**POST `/api/permissions`**
Create new permission
```json
{
  "name": "users:read",
  "description": "Read user data",
  "resource": "users",
  "action": "read"
}
```

#### Authorization

**POST `/api/authorize`**
Check user permissions
```json
{
  "action": "read",
  "resource": "users"
}
```

Response:
```json
{
  "authorized": true,
  "permissions": ["users:read", "users:write"]
}
```

#### Audit Logs

**GET `/api/audit-logs`**
Retrieve audit logs
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/audit-logs?limit=100&offset=0"
```

## 💻 Development Guide

### Local Development Setup

#### 1. Infrastructure Only
```bash
# Start databases and Redis only
make docker-up

# Run services manually
make run-auth      # Terminal 1
make run-iam       # Terminal 2  
make run-admin-dev # Terminal 3
```

#### 2. Backend Development
```bash
# Start backend services in containers
make run-backend

# Develop frontend locally
make run-admin-dev
```

#### 3. Full Containerized Development
```bash
# Everything in containers
make run-full
```

### Code Structure

#### Auth Service (Go)
```
auth/
├── cmd/main.go              # Application entry point
├── internal/
│   ├── config/             # Configuration management
│   ├── database/           # Database operations
│   ├── handlers/           # HTTP handlers
│   ├── middleware/         # HTTP middleware
│   ├── redis/             # Redis client
│   └── services/          # Business logic
├── migrations/            # Database migrations
└── Dockerfile
```

#### IAM Service (Node.js/TypeScript)
```
iam/
├── src/
│   ├── index.ts           # Application entry point
│   ├── config.ts          # Configuration
│   ├── database.ts        # Database operations
│   ├── middleware/        # Express middleware
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   └── utils/           # Utilities
├── migrations/          # Database migrations
└── Dockerfile
```

#### Admin Frontend (React/TypeScript)
```
admin/
├── src/
│   ├── index.tsx        # Application entry point
│   ├── App.tsx         # Main component
│   ├── components/     # React components
│   ├── contexts/      # React contexts
│   ├── config/       # Configuration
│   └── index.css    # Styles
├── public/
└── Dockerfile
```

### Testing

#### Run All Tests
```bash
make test
make test-coverage
```

#### Service-Specific Tests
```bash
# Auth service
cd auth && go test -v ./...

# IAM service  
cd iam && npm test

# Admin frontend
cd admin && npm test
```

### Code Quality

#### Formatting
```bash
make format      # Format all services
make fmt         # Go formatting only
```

#### Linting
```bash
make lint        # Lint all services
make code-quality # Complete quality check
```

#### Security Scanning
```bash
make security    # Security scan all services
```

### Database Management

#### Migrations
```bash
make migrate-up    # Run migrations
make migrate-down  # Rollback migrations
make db-reset      # Reset databases
```

#### Backups
```bash
make backup       # Backup all databases
```

## 🚀 Deployment

### Development Deployment
```bash
make dev-setup
make run-full
```

### Production Deployment
```bash
# Build images
make docker-build

# Deploy
make run-full

# Monitor
make status
make health-check
```

### Environment Configuration

#### Production Environment Variables
Create `.env` files in each service directory:

**Auth Service `.env`**:
```env
DB_HOST=auth-db-prod
DB_NAME=authdb_prod
JWT_SECRET=production-jwt-secret-256-bits
LOG_LEVEL=warn
```

**IAM Service `.env`**:
```env
DB_HOST=iam-db-prod
DB_NAME=iamdb_prod
NODE_ENV=production
LOG_LEVEL=warn
```

### Scaling Considerations

#### Horizontal Scaling
- Run multiple instances behind a load balancer
- Use external session store (Redis Cluster)
- Implement database read replicas

#### Performance Optimization
- Enable Redis caching
- Use connection pooling
- Implement proper indexing
- Monitor query performance

## 🔒 Security

### Authentication Security
- **JWT Tokens**: Short expiration (3-5 minutes)
- **Refresh Tokens**: Secure, rotating refresh tokens
- **Password Hashing**: Argon2 with salt
- **MFA Support**: TOTP-based multi-factor authentication
- **Session Management**: Redis-based with revocation

### Authorization Security
- **Role-Based Access Control**: Granular permissions
- **Principle of Least Privilege**: Minimal required permissions
- **Resource-Based Permissions**: Fine-grained access control
- **Audit Logging**: Complete activity tracking

### Infrastructure Security
- **Network Isolation**: Custom Docker networks
- **TLS/SSL**: HTTPS for all external communications
- **Secrets Management**: Environment variables or external secrets
- **Regular Updates**: Keep dependencies updated
- **Vulnerability Scanning**: Regular security scans

### Security Best Practices

#### 1. Change Default Credentials
```bash
# Update all default passwords in compose files
# Generate strong JWT secret
openssl rand -base64 32
```

#### 2. Use HTTPS in Production
```yaml
# Add TLS configuration
services:
  auth-service:
    environment:
      - TLS_CERT_PATH=/etc/ssl/certs/server.crt
      - TLS_KEY_PATH=/etc/ssl/private/server.key
```

#### 3. Implement Rate Limiting
- Configure rate limiting in NGINX or API Gateway
- Use Redis for distributed rate limiting
- Monitor for suspicious activity

#### 4. Regular Security Audits
```bash
# Check for vulnerabilities
make security
npm audit
go list -json -m all | nancy sleuth
```

## 📊 Monitoring

### Health Checks
```bash
make health-check
```

### Logs
```bash
make logs-full      # All services
make logs-backend   # Backend only
make logs SERVICE=auth-service  # Specific service
```

### Metrics
- **Application Metrics**: Custom metrics in each service
- **System Metrics**: Docker stats, resource usage
- **Database Metrics**: Connection pools, query performance
- **Redis Metrics**: Cache hit rates, memory usage

### Monitoring Tools
- **Prometheus**: Metrics collection
- **Grafana**: Visualization
- **ELK Stack**: Log aggregation
- **Jaeger**: Distributed tracing

### Alerting
Set up alerts for:
- Service downtime
- High error rates
- Database connection issues
- High memory/CPU usage
- Failed authentication attempts

## 🐛 Troubleshooting

### Common Issues

#### 1. Service Won't Start
```bash
# Check logs
make logs SERVICE=auth-service

# Check health
make health-check

# Restart service
make restart SERVICE=auth-service
```

#### 2. Database Connection Issues
```bash
# Check database status
docker-compose ps
make logs SERVICE=auth-db

# Reset database
make db-reset
```

#### 3. Authentication Issues
```bash
# Check JWT secret configuration
# Verify Redis connection
# Check token expiration
```

#### 4. Permission Denied
```bash
# Check user roles and permissions
# Verify token validity
# Check audit logs
```

### Debug Mode
```bash
# Run services in debug mode
LOG_LEVEL=debug make run-full

# Check debug logs
make logs-full
```

### Performance Issues
```bash
# Check resource usage
docker stats

# Monitor database performance
# Check Redis memory usage
# Profile application performance
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch
3. Make changes
4. Run tests: `make test`
5. Run quality checks: `make code-quality`
6. Submit pull request

### Code Standards
- **Go**: Follow Go conventions, use gofmt
- **TypeScript**: Use ESLint + Prettier
- **React**: Follow React best practices
- **Testing**: Maintain test coverage >80%
- **Documentation**: Update docs for new features

### Pull Request Guidelines
- Clear title and description
- Link to issue (if applicable)
- Tests for new functionality
- Documentation updates
- No merge conflicts

## 📚 Additional Resources

- [API Reference](./API.md)
- [Docker Guide](./DOCKER.md)
- [Security Guide](./SECURITY.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Contributing Guide](./CONTRIBUTING.md)

## 📞 Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Documentation**: This document and linked resources
- **Examples**: See `examples/` directory

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.