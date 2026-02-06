/**
 * Global-Fi Ultra - RabbitMQ Configuration
 * 
 * RabbitMQ connection management with retry logic.
 */

import amqp from 'amqplib';
import { config } from './environment.js';
import { logger } from './logger.js';

let connection = null;
let channel = null;

/**
 * Connect to RabbitMQ with retry logic
 */
export const connectRabbitMQ = async (retries = 5, delay = 3000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            logger.info(`Connecting to RabbitMQ (attempt ${attempt}/${retries})...`);
            
            connection = await amqp.connect(config.rabbitmq.url);
            channel = await connection.createChannel();
            
            // Handle connection errors
            connection.on('error', (err) => {
                logger.error('RabbitMQ connection error', { error: err.message });
            });
            
            connection.on('close', () => {
                logger.warn('RabbitMQ connection closed');
                channel = null;
                connection = null;
            });
            
            // Assert default queues
            const prefix = config.rabbitmq.queuePrefix;
            await channel.assertQueue(`${prefix}-financial-data`, { durable: true });
            await channel.assertQueue(`${prefix}-audit-logs`, { durable: true });
            await channel.assertQueue(`${prefix}-notifications`, { durable: true });
            
            logger.info('RabbitMQ connection established');
            return { connection, channel };
        } catch (error) {
            logger.error(`RabbitMQ connection failed (attempt ${attempt}/${retries})`, { 
                error: error.message 
            });
            
            if (attempt === retries) {
                throw new Error(`Failed to connect to RabbitMQ after ${retries} attempts: ${error.message}`);
            }
            
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

/**
 * Get RabbitMQ channel
 */
export const getRabbitMQChannel = () => channel;

/**
 * Get RabbitMQ connection
 */
export const getRabbitMQConnection = () => connection;

/**
 * Check if RabbitMQ is connected
 */
export const isRabbitMQConnected = () => connection !== null && channel !== null;

/**
 * Close RabbitMQ connection
 */
export const closeRabbitMQConnection = async () => {
    try {
        if (channel) {
            await channel.close();
            channel = null;
        }
        if (connection) {
            await connection.close();
            connection = null;
        }
        logger.info('RabbitMQ connection closed');
    } catch (error) {
        logger.error('Error closing RabbitMQ connection', { error: error.message });
        throw error;
    }
};
