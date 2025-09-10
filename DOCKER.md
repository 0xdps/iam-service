# Docker Configuration Guide

This document explains the Docker setup for the IAM & Auth Platform, including the different Docker Compose configurations and deployment strategies.

## 📋 Table of Contents
- [Overview](#overview)
- [Docker Compose Files](#docker-compose-files)
- [Service Architecture](#service-architecture)
- [Environment Variables](#environment-variables)
- [Networking](#networking)
- [Volumes and Data Persistence](#volumes-and-data-persistence)
- [Health Checks](#health-checks)
- [Deployment Strategies](#deployment-strategies)
- [Troubleshooting](#troubleshooting)

## 🏗️ Overview

The IAM & Auth Platform uses a multi-container Docker architecture with separate compose files for different deployment scenarios:

- **Full Stack**: Complete system with all services
- **Backend Only**: API services and databases without frontend
- **Frontend Only**: Admin interface only (requires backend running)
- **Development**: Infrastructure only for local development

## 📄 Docker Compose Files

### `docker-compose.full.yml` - Complete System
**Use Case**: Production deployment, integration testing, demo environment

**Services Included**:
- Auth Service (Go)
- IAM Service (Node.js)
- Admin Frontend (React)
- PostgreSQL Auth Database
- PostgreSQL IAM Database
- Redis

**Command**: `make run-full`

```bash
# Start complete system
make run-full

# URLs after startup:
# Admin Dashboard: http://localhost:3001
# Auth API: http://localhost:8080/api/auth
# IAM API: http://localhost:3000/api
```

### `docker-compose.backend.yml` - Backend Services Only
**Use Case**: API testing, backend development, mobile app development

**Services Included**:
- Auth Service (Go)
- IAM Service (Node.js)
- PostgreSQL Auth Database
- PostgreSQL IAM Database
- Redis

**Command**: `make run-backend`

```bash
# Start backend services only
make run-backend

# Test APIs:
curl http://localhost:8080/health  # Auth service
curl http://localhost:3000/health  # IAM service
```

### `docker-compose.frontend.yml` - Frontend Only
**Use Case**: Frontend development, UI testing

**Services Included**:
- Admin Frontend (React)

**Prerequisites**: Backend must be running
**Command**: `make run-frontend`

```bash
# Start backend first
make run-backend

# Then start frontend
make run-frontend

# Access: http://localhost:3001
```

### `docker-compose.dev.yml` & `docker-compose.yml` - Development Infrastructure
**Use Case**: Local development, debugging

**Services Included**:
- PostgreSQL Auth Database
- PostgreSQL IAM Database
- Redis

**Command**: `make docker-up`

```bash
# Start infrastructure only
make docker-up

# Run services manually:
make run-auth      # Start auth service locally
make run-iam       # Start IAM service locally
make run-admin-dev # Start admin frontend locally
```

## 🏛️ Service Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    Admin    │    │    Auth     │    │    IAM      │
│  (React)    │───▶│   (Go)      │◀──▶│ (Node.js)   │
│   :3001     │    │   :8080     │    │   :3000     │
└─────────────┘    └─────────────┘    └─────────────┘
                          │                   │
                          ▼                   ▼
       ┌──────────────┬───────────────┬───────────────┐
       │              │               │               │
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────┐
│   Auth DB   │ │   IAM DB    │ │    Redis    │ │ Network  │
│(PostgreSQL) │ │(PostgreSQL) │ │  (Cache)    │ │ Bridge   │
│   :5432     │ │   :5433     │ │   :6379     │ │          │
└─────────────┘ └─────────────┘ └─────────────┘ └──────────┘
```

## 🔧 Environment Variables

### Auth Service
```env
DB_HOST=auth-db
DB_PORT=5432
DB_NAME=authdb
DB_USER=authuser
DB_PASSWORD=authpass
REDIS_URL=redis:6379
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=8080
LOG_LEVEL=info
```

### IAM Service
```env
DB_HOST=iam-db
DB_PORT=5432
DB_NAME=iamdb
DB_USER=iamuser
DB_PASSWORD=iampass
REDIS_URL=redis:6379
AUTH_SERVICE_URL=http://auth-service:8080
PORT=3000
NODE_ENV=production
LOG_LEVEL=info
```

### Admin Frontend
```env
REACT_APP_AUTH_API_URL=http://localhost:8080
REACT_APP_IAM_API_URL=http://localhost:3000
NODE_ENV=production
```

## 🌐 Networking

All services communicate through a custom bridge network: `iam-network`

**Internal Communication**:
- Services use container names for internal communication
- Auth Service → `auth-service:8080`
- IAM Service → `iam-service:3000`
- Databases → `auth-db:5432`, `iam-db:5432`
- Redis → `redis:6379`

**External Access**:
- Admin Frontend: `localhost:3001`
- Auth API: `localhost:8080`
- IAM API: `localhost:3000`
- Auth Database: `localhost:5432`
- IAM Database: `localhost:5433`
- Redis: `localhost:6379`

## 💾 Volumes and Data Persistence

### Named Volumes
- `auth_data`: PostgreSQL auth database data
- `iam_data`: PostgreSQL IAM database data
- `redis_data`: Redis persistence data

### Development Volumes (docker-compose.dev.yml)
- `auth_data_dev`: Development auth database
- `iam_data_dev`: Development IAM database  
- `redis_data_dev`: Development Redis data

### Volume Management
```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect iam-service_auth_data

# Remove volumes (will delete data!)
docker volume rm iam-service_auth_data
docker volume rm iam-service_iam_data
docker volume rm iam-service_redis_data

# Clean all volumes
make clean-docker
```

## 🏥 Health Checks

All services include health checks for monitoring and orchestration:

### Auth Service
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

### IAM Service
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

### Databases
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U authuser -d authdb"]
  interval: 30s
  timeout: 10s
  retries: 5
```

### Redis
```yaml
healthcheck:
  test: ["CMD", "redis-cli", "ping"]
  interval: 30s
  timeout: 10s
  retries: 3
```

## 🚀 Deployment Strategies

### 1. Development Environment
```bash
# Start infrastructure only
make docker-up

# Run services manually for debugging
make run-auth
make run-iam
make run-admin-dev
```

### 2. Testing Environment
```bash
# Start complete system
make run-full

# Run tests
make test
make health-check
```

### 3. Production Environment
```bash
# Build and deploy
make docker-build
make run-full

# Monitor
make status
make logs-full
```

### 4. Staging Environment
```bash
# Backend only for API testing
make run-backend

# Test APIs
curl http://localhost:8080/health
curl http://localhost:3000/health
```

## 🔍 Monitoring Commands

### Service Status
```bash
# Check all services
make status

# Check specific environment
docker-compose -f docker-compose.full.yml ps
docker-compose -f docker-compose.backend.yml ps
```

### Logs
```bash
# All services
make logs-full

# Specific service
make logs SERVICE=auth-service
make logs SERVICE=iam-service
make logs SERVICE=admin

# Real-time logs
docker-compose -f docker-compose.full.yml logs -f auth-service
```

### Resource Usage
```bash
# Container stats
docker stats

# Specific containers
docker stats auth-service iam-service admin
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Conflicts
**Problem**: Port already in use
```
Error starting userland proxy: listen tcp 0.0.0.0:5432: bind: address already in use
```

**Solution**:
```bash
# Check what's using the port
lsof -i :5432
netstat -tulpn | grep 5432

# Stop conflicting service or change port in compose file
```

#### 2. Database Connection Issues
**Problem**: Service can't connect to database

**Solution**:
```bash
# Check database health
docker-compose ps
make health-check

# Check database logs
make logs SERVICE=auth-db
make logs SERVICE=iam-db

# Reset database
make db-reset
```

#### 3. Network Issues
**Problem**: Services can't communicate

**Solution**:
```bash
# Check network
docker network ls
docker network inspect iam-service_iam-network

# Recreate network
docker-compose down
docker network prune
docker-compose up -d
```

#### 4. Volume Permission Issues
**Problem**: Database fails to start due to permissions

**Solution**:
```bash
# Fix volume permissions
docker-compose down
sudo chown -R 999:999 /var/lib/docker/volumes/iam-service_auth_data
sudo chown -R 999:999 /var/lib/docker/volumes/iam-service_iam_data

# Or recreate volumes
make clean-docker
make run-full
```

#### 5. Build Issues
**Problem**: Docker build fails

**Solution**:
```bash
# Clean build cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache

# Or use make command
make clean-docker
make docker-build
```

### Debugging Commands

```bash
# Enter running container
docker exec -it auth-service /bin/sh
docker exec -it iam-service /bin/bash
docker exec -it admin /bin/sh

# Check container logs
docker logs auth-service
docker logs iam-service
docker logs admin

# Inspect container
docker inspect auth-service

# Check environment variables
docker exec auth-service printenv
```

### Performance Monitoring

```bash
# Resource usage
docker stats --no-stream

# Container processes
docker exec auth-service ps aux
docker exec iam-service ps aux

# Network connections
docker exec auth-service netstat -tuln
```

## 📊 Best Practices

1. **Use Specific Tags**: Don't use `latest` in production
2. **Health Checks**: Always include health checks for orchestration
3. **Resource Limits**: Set memory and CPU limits in production
4. **Secrets Management**: Use Docker secrets or external secret management
5. **Logging**: Configure centralized logging for production
6. **Monitoring**: Implement proper monitoring and alerting
7. **Backup Strategy**: Regular database backups
8. **Security**: Use non-root users, scan images for vulnerabilities

## 🔒 Security Considerations

1. **Change Default Passwords**: Update all default passwords
2. **Use Secrets**: Don't expose secrets in environment variables
3. **Network Isolation**: Use custom networks, not default bridge
4. **Image Security**: Regularly update base images
5. **User Privileges**: Run containers as non-root users
6. **TLS**: Use TLS for all external communications
7. **Firewall Rules**: Implement proper firewall rules

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [Docker Health Check Reference](https://docs.docker.com/engine/reference/builder/#healthcheck)
- [Docker Networking](https://docs.docker.com/network/)