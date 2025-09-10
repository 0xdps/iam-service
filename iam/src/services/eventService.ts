import { redisClient } from '../redis';
import { database } from '../database';
import { logger } from '../utils/logger';

class EventService {
  private streamName = 'stream:iam.events';
  private groupName = 'iam-consumers';
  private consumerName = 'iam-service';

  async startConsumer(): Promise<void> {
    await redisClient.createConsumerGroup(this.streamName, this.groupName);
    
    logger.info('Starting IAM event consumer...');
    
    setInterval(async () => {
      try {
        const messages = await redisClient.readStream(
          this.streamName,
          this.groupName,
          this.consumerName
        );

        for (const message of messages) {
          await this.processEvent(message);
          await redisClient.ackMessage(this.streamName, this.groupName, message.id);
        }
      } catch (error) {
        logger.error('Error processing events:', error);
      }
    }, 1000);
  }

  private async processEvent(message: any): Promise<void> {
    try {
      const { event, data } = message.message;
      
      logger.info(`Processing event: ${event}`, data);

      switch (event) {
        case 'membership.changed':
          await this.handleMembershipChanged(data);
          break;
        case 'role.updated':
          await this.handleRoleUpdated(data);
          break;
        default:
          logger.warn(`Unknown event type: ${event}`);
      }
    } catch (error) {
      logger.error('Error processing event:', error);
    }
  }

  private async handleMembershipChanged(data: any): Promise<void> {
    // Invalidate user permissions cache
    if (data.userId) {
      await redisClient.invalidateUserPermissions(data.userId);
      logger.info(`Invalidated permissions cache for user: ${data.userId}`);
    }
  }

  private async handleRoleUpdated(data: any): Promise<void> {
    // Invalidate permissions cache for all users with this role
    if (data.roleId) {
      // In a real implementation, you'd find all users with this role
      // and invalidate their permission caches
      logger.info(`Role updated: ${data.roleId}`);
    }
  }

  async publishEvent(event: string, data: any): Promise<void> {
    try {
      await redisClient.publish(this.streamName, { event, data });
      logger.info(`Published event: ${event}`, data);
    } catch (error) {
      logger.error('Error publishing event:', error);
    }
  }
}

export const eventService = new EventService();