// services/redisClient.js
const Redis = require('redis');
require('dotenv').config();

let redisClient;

async function initializeRedisClient() {
  if (!redisClient || !redisClient.isOpen) {
    redisClient = Redis.createClient({
      // your Redis configuration here
    });

    redisClient.on('error', (err) => console.log('Redis Client Error', err));

    await redisClient.connect();
  }
}

async function getRedisClient() {
  await initializeRedisClient();
  return redisClient;
}

async function closeRedisClient() {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
  }
}

module.exports = { getRedisClient, closeRedisClient };
