import { v4 as uuidv4 } from 'uuid';
import { database } from '../database';
import { redisClient } from '../redis';
import { eventService } from './eventService';
import { logger } from '../utils/logger';

export interface AuthorizeRequest {
  sub: string;
  session_id: string;
  action: string;
  resource: string;
}

export interface AuthorizeResponse {
  allow: boolean;
  reason?: string;
}

class AuthorizationService {
  async authorize(request: AuthorizeRequest, auditInfo?: any): Promise<AuthorizeResponse> {
    try {
      const { sub: userId, action, resource } = request;

      // Check cached permissions first
      let permissions = await redisClient.getCachedUserPermissions(userId);
      
      if (!permissions) {
        // Load from database
        permissions = await database.getUserPermissions(userId);
        
        // Cache for future requests
        await redisClient.cacheUserPermissions(userId, permissions);
      }

      // Check if user has permission for this action on this resource
      const hasPermission = permissions.some((perm: any) => 
        perm.resource === resource && perm.action === action
      );

      // Log audit trail
      if (auditInfo) {
        await this.createAuditLog({
          userId,
          action: 'authorize',
          resource: 'authorization',
          resourceId: `${resource}:${action}`,
          details: {
            request,
            result: hasPermission,
          },
          ipAddress: auditInfo.ipAddress,
        });
      }

      return {
        allow: hasPermission,
        reason: hasPermission ? undefined : 'Insufficient permissions'
      };
    } catch (error) {
      logger.error('Authorization error:', error);
      return {
        allow: false,
        reason: 'Authorization service error'
      };
    }
  }

  private async createAuditLog(log: any): Promise<void> {
    try {
      await database.createAuditLog({
        id: uuidv4(),
        ...log
      });
    } catch (error) {
      logger.error('Failed to create audit log:', error);
    }
  }
}

export const authorizationService = new AuthorizationService();