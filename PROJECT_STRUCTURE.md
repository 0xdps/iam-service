# IAM & Auth Platform - Project Structure

```
iam-service/
├── README.md                     # Project documentation
├── REQUIREMENTS.md               # Original requirements
├── docker-compose.yml            # Docker orchestration
├── start.sh                      # Startup script
├── .env.example                  # Environment variables template
│
├── auth/                         # Go Authentication Service
│   ├── Dockerfile
│   ├── go.mod
│   ├── go.sum
│   ├── cmd/
│   │   └── main.go              # Entry point
│   ├── internal/
│   │   ├── config/
│   │   │   └── config.go        # Configuration management
│   │   ├── database/
│   │   │   └── database.go      # Database operations
│   │   ├── handlers/
│   │   │   └── auth.go          # HTTP handlers
│   │   ├── middleware/
│   │   │   └── auth.go          # JWT middleware
│   │   ├── redis/
│   │   │   └── client.go        # Redis client
│   │   └── services/
│   │       ├── auth.go          # Authentication logic
│   │       └── events.go        # Event processing
│   └── migrations/
│       └── 001_init.sql         # Database schema
│
├── iam/                          # Node.js IAM Service
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts             # Entry point
│   │   ├── config.ts            # Configuration
│   │   ├── database.ts          # Database operations
│   │   ├── redis.ts             # Redis client
│   │   ├── middleware/
│   │   │   ├── auth.ts          # Authentication middleware
│   │   │   └── errorHandler.ts  # Error handling
│   │   ├── routes/
│   │   │   ├── auth.ts          # Authorization endpoints
│   │   │   ├── users.ts         # User management
│   │   │   ├── groups.ts        # Group management
│   │   │   ├── roles.ts         # Role management
│   │   │   ├── permissions.ts   # Permission management
│   │   │   └── audit.ts         # Audit logs
│   │   ├── services/
│   │   │   ├── authorizationService.ts  # Authorization logic
│   │   │   └── eventService.ts          # Event processing
│   │   └── utils/
│   │       └── logger.ts        # Logging utility
│   └── migrations/
│       └── 001_init.sql         # Database schema
│
├── admin/                           # React Frontend
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── tsconfig.json
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── index.tsx            # Entry point
│       ├── index.css            # Global styles
│       ├── App.tsx              # Main app component
│       ├── contexts/
│       │   └── AuthContext.tsx  # Authentication context
│       └── components/
│           ├── Login.tsx        # Login page
│           ├── Navigation.tsx   # Navigation bar
│           ├── Dashboard.tsx    # Dashboard page
│           ├── Users.tsx        # User management
│           ├── Groups.tsx       # Group management
│           ├── Roles.tsx        # Role management
│           ├── Permissions.tsx  # Permission management
│           └── AuditLogs.tsx    # Audit log viewer
│

```

## Key Files Overview

### Authentication Service (Go)
- **main.go**: Server setup, middleware, and routing
- **auth.go**: Login, logout, token refresh, MFA setup
- **database.go**: User and session management
- **events.go**: Redis stream event processing

### IAM Service (Node.js)
- **index.ts**: Express server setup and routing
- **authorizationService.ts**: Permission checking logic
- **database.ts**: CRUD operations for IAM entities
- **eventService.ts**: Event publishing and consumption

### Frontend (React)
- **App.tsx**: Main routing and authentication flow
- **AuthContext.tsx**: Global authentication state
- **Login.tsx**: Authentication form with MFA support
- **Dashboard.tsx**: System overview and statistics

### Infrastructure
- **docker-compose.yml**: Multi-service orchestration
- **migrations/*.sql**: Database schema definitions

## Service Dependencies

```
Direct Service Access:
├── Admin (Port 3001) → Auth API (8080), IAM API (3000)
├── Auth Service (Port 8080) → PostgreSQL, Redis
└── IAM Service (Port 3000) → PostgreSQL, Redis, Auth Service

PostgreSQL Instances:
├── auth-db (Port 5432)
└── iam-db (Port 5433)

Redis (Port 6379):
├── Session storage
├── Token revocation
└── Event streams
```