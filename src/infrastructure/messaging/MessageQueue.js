/**
 * Global-Fi Ultra - Message Queue Service
 * 
 * Wrapper for RabbitMQ operations with structured message handling.
 */

import { getRabbitMQChannel, isRabbitMQConnected } from '../../config/rabbitmq.js';
import { config } from '../../config/environment.js';
import { logger } from '../../config/logger.js';

/**
 * Message Queue Service
 */
export class MessageQueue {
    constructor() {
        this.prefix = config.rabbitmq.queuePrefix;
        this.queues = {
            financialData: `${this.prefix}-financial-data`,
            auditLogs: `${this.prefix}-audit-logs`,
            notifications: `${this.prefix}-notifications`,
        };
    }

    /**
     * Publish message to a queue
     * @param {string} queueName - Queue name (without prefix)
     * @param {Object} message - Message payload
     * @returns {boolean} - Success status
     */
    async publish(queueName, message) {
        const channel = getRabbitMQChannel();

        if (!channel) {
            logger.warn('Cannot publish message: RabbitMQ not connected');
            return false;
        }

        const fullQueueName = `${this.prefix}-${queueName}`;
        const messageBuffer = Buffer.from(JSON.stringify({
            ...message,
            timestamp: new Date().toISOString(),
            messageId: crypto.randomUUID(),
        }));

        try {
            await channel.assertQueue(fullQueueName, { durable: true });
            channel.sendToQueue(fullQueueName, messageBuffer, { persistent: true });

            logger.debug(`Message published to ${fullQueueName}`, {
                queueName: fullQueueName,
                messageSize: messageBuffer.length,
            });

            return true;
        } catch (error) {
            logger.error(`Failed to publish message to ${fullQueueName}`, {
                error: error.message
            });
            return false;
        }
    }

    /**
     * Consume messages from a queue
     * @param {string} queueName - Queue name (without prefix)
     * @param {Function} handler - Message handler function
     */
    async consume(queueName, handler) {
        const channel = getRabbitMQChannel();

        if (!channel) {
            logger.warn('Cannot consume messages: RabbitMQ not connected');
            return;
        }

        const fullQueueName = `${this.prefix}-${queueName}`;

        try {
            await channel.assertQueue(fullQueueName, { durable: true });

            channel.consume(fullQueueName, async (msg) => {
                if (msg) {
                    try {
                        const content = JSON.parse(msg.content.toString());
                        await handler(content);
                        channel.ack(msg);

                        logger.debug(`Message processed from ${fullQueueName}`);
                    } catch (error) {
                        logger.error(`Error processing message from ${fullQueueName}`, {
                            error: error.message,
                        });
                        // Reject and requeue the message
                        channel.nack(msg, false, true);
                    }
                }
            });

            logger.info(`Started consuming from ${fullQueueName}`);
        } catch (error) {
            logger.error(`Failed to start consumer for ${fullQueueName}`, {
                error: error.message,
            });
        }
    }

    /**
     * Publish financial data event
     * @param {Object} data - Financial data payload
     */
    async publishFinancialData(data) {
        return this.publish('financial-data', {
            type: 'financial-data',
            data,
        });
    }

    /**
     * Publish audit log event
     * @param {Object} log - Audit log entry
     */
    async publishAuditLog(log) {
        return this.publish('audit-logs', {
            type: 'audit-log',
            data: log,
        });
    }

    /**
     * Publish notification
     * @param {Object} notification - Notification payload
     */
    async publishNotification(notification) {
        return this.publish('notifications', {
            type: 'notification',
            data: notification,
        });
    }

    /**
     * Check if RabbitMQ is connected
     */
    isConnected() {
        return isRabbitMQConnected();
    }
}
