// API Configuration
export const API_CONFIG = {
  AUTH_API_URL: window.location.hostname === 'localhost' 
    ? 'http://localhost:8080' 
    : `${window.location.protocol}//${window.location.hostname}:8080`,
  IAM_API_URL: window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : `${window.location.protocol}//${window.location.hostname}:3000`
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_CONFIG.AUTH_API_URL}/api/auth/login`,
    LOGOUT: `${API_CONFIG.AUTH_API_URL}/api/auth/logout`,
    INTROSPECT: `${API_CONFIG.AUTH_API_URL}/api/auth/introspect`,
    REFRESH: `${API_CONFIG.AUTH_API_URL}/api/auth/refresh`,
    HEALTH: `${API_CONFIG.AUTH_API_URL}/health`
  },
  IAM: {
    USERS: `${API_CONFIG.IAM_API_URL}/api/users`,
    ROLES: `${API_CONFIG.IAM_API_URL}/api/roles`,
    PERMISSIONS: `${API_CONFIG.IAM_API_URL}/api/permissions`,
    AUTHORIZE: `${API_CONFIG.IAM_API_URL}/api/authorize`,
    AUDIT_LOGS: `${API_CONFIG.IAM_API_URL}/api/audit-logs`,
    HEALTH: `${API_CONFIG.IAM_API_URL}/health`
  }
};