import { Pool } from 'pg';
import { config } from './config';
import { logger } from './utils/logger';

class Database {
  private pool: Pool;

  constructor() {
    this.pool = new Pool(config.database);
  }

  async connect(): Promise<void> {
    try {
      await this.pool.connect();
      logger.info('Database connected successfully');
    } catch (error) {
      logger.error('Database connection failed:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  async query(text: string, params?: any[]): Promise<any> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  // Users
  async createUser(user: any): Promise<any> {
    const query = `
      INSERT INTO users (id, email, first_name, last_name, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await this.query(query, [user.id, user.email, user.firstName, user.lastName, user.status || 'active']);
    return result.rows[0];
  }

  async getUserById(id: string): Promise<any> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await this.query(query, [id]);
    return result.rows[0];
  }

  async getUserByEmail(email: string): Promise<any> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await this.query(query, [email]);
    return result.rows[0];
  }

  async updateUser(id: string, updates: any): Promise<any> {
    const fields = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const query = `UPDATE users SET ${fields}, updated_at = NOW() WHERE id = $1 RETURNING *`;
    const values = [id, ...Object.values(updates)];
    const result = await this.query(query, values);
    return result.rows[0];
  }

  async deleteUser(id: string): Promise<void> {
    await this.query('DELETE FROM users WHERE id = $1', [id]);
  }

  async getUsers(limit: number = 50, offset: number = 0): Promise<any[]> {
    const query = 'SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2';
    const result = await this.query(query, [limit, offset]);
    return result.rows;
  }

  // Groups
  async createGroup(group: any): Promise<any> {
    const query = `
      INSERT INTO groups (id, name, description)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await this.query(query, [group.id, group.name, group.description]);
    return result.rows[0];
  }

  async getGroupById(id: string): Promise<any> {
    const query = 'SELECT * FROM groups WHERE id = $1';
    const result = await this.query(query, [id]);
    return result.rows[0];
  }

  async getGroups(): Promise<any[]> {
    const query = 'SELECT * FROM groups ORDER BY name';
    const result = await this.query(query);
    return result.rows;
  }

  // Roles
  async createRole(role: any): Promise<any> {
    const query = `
      INSERT INTO roles (id, name, description)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await this.query(query, [role.id, role.name, role.description]);
    return result.rows[0];
  }

  async getRoleById(id: string): Promise<any> {
    const query = 'SELECT * FROM roles WHERE id = $1';
    const result = await this.query(query, [id]);
    return result.rows[0];
  }

  async getRoles(): Promise<any[]> {
    const query = 'SELECT * FROM roles ORDER BY name';
    const result = await this.query(query);
    return result.rows;
  }

  // Permissions
  async createPermission(permission: any): Promise<any> {
    const query = `
      INSERT INTO permissions (id, name, resource, action, description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await this.query(query, [permission.id, permission.name, permission.resource, permission.action, permission.description]);
    return result.rows[0];
  }

  async getPermissionById(id: string): Promise<any> {
    const query = 'SELECT * FROM permissions WHERE id = $1';
    const result = await this.query(query, [id]);
    return result.rows[0];
  }

  async getPermissions(): Promise<any[]> {
    const query = 'SELECT * FROM permissions ORDER BY resource, action';
    const result = await this.query(query);
    return result.rows;
  }

  // User permissions (through roles and groups)
  async getUserPermissions(userId: string): Promise<any[]> {
    const query = `
      SELECT DISTINCT p.* FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      JOIN user_roles ur ON rp.role_id = ur.role_id
      WHERE ur.user_id = $1
      UNION
      SELECT DISTINCT p.* FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      JOIN group_roles gr ON rp.role_id = gr.role_id
      JOIN user_groups ug ON gr.group_id = ug.group_id
      WHERE ug.user_id = $1
    `;
    const result = await this.query(query, [userId]);
    return result.rows;
  }

  // Audit logs
  async createAuditLog(log: any): Promise<any> {
    const query = `
      INSERT INTO audit_logs (id, user_id, action, resource, resource_id, details, ip_address)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const result = await this.query(query, [
      log.id, log.userId, log.action, log.resource, log.resourceId, JSON.stringify(log.details), log.ipAddress
    ]);
    return result.rows[0];
  }

  async getAuditLogs(limit: number = 100, offset: number = 0): Promise<any[]> {
    const query = 'SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1 OFFSET $2';
    const result = await this.query(query, [limit, offset]);
    return result.rows;
  }
}

export const database = new Database();