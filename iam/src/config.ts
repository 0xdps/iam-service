export const config = {
  port: process.env.PORT || 3000,
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5433'),
    database: process.env.DB_NAME || 'iamdb',
    user: process.env.DB_USER || 'iamuser',
    password: process.env.DB_PASSWORD || 'iampass',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://redis:6379',
  },
  auth: {
    serviceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:8080',
  },
};