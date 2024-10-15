// services/redisClient.js
const Redis = require('redis');
require('dotenv').config();

let redisClient;

async function initializeRedisClient() {
  if (!redisClient || !redisClient.isOpen) {
    try {
      redisClient = Redis.createClient({
        // Add any necessary options here, e.g., url: process.env.REDIS_URL
      });

      redisClient.on('error', (err) => console.error('Redis Client Error', err));

      await redisClient.connect();
      console.log('Redis client connected successfully');

      // Setting notifications for keyspace events
      await redisClient.configSet('notify-keyspace-events', 'AKE');
      console.log('Keyspace events configured');
    } catch (error) {
      console.error('Error initializing Redis client:', error);
      throw error;
    }
  }
}

async function getRedisClient() {
  await initializeRedisClient();
  return redisClient;
}

async function closeRedisClient() {
  if (redisClient && redisClient.isOpen) {
    try {
      await redisClient.quit();
      console.log('Redis client closed successfully');
    } catch (error) {
      console.error('Error closing Redis client:', error);
    }
  }
}

module.exports = { getRedisClient, closeRedisClient };
