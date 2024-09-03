import redis from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.client = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    this.client.on('error', (error) => {
      console.error(`Redis client error: ${error}`);
    });

    // Promisify Redis methods
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);

    // Connect to Redis
    this.client.connect()
      .then(() => console.log('Connected to Redis'))
      .catch((error) => console.error('Failed to connect to Redis', error));
  }

  async isAlive() {
    try {
      // Attempt a simple operation to check if the client is connected
      await this.client.ping();
      return true;
    } catch (error) {
      console.error('Redis client is not alive', error);
      return false;
    }
  }

  async get(key) {
    try {
      return await this.getAsync(key);
    } catch (error) {
      console.error(`Failed to get key ${key}`, error);
      throw error;
    }
  }

  async set(key, value, duration) {
    try {
      await this.setAsync(key, value, 'EX', duration);
    } catch (error) {
      console.error(`Failed to set key ${key}`, error);
      throw error;
    }
  }

  async del(key) {
    try {
      await this.delAsync(key);
    } catch (error) {
      console.error(`Failed to delete key ${key}`, error);
      throw error;
    }
  }

  async close() {
    try {
      await this.client.quit();
      console.log('Redis connection closed');
    } catch (error) {
      console.error('Failed to close Redis connection', error);
    }
  }
}

const redisClient = new RedisClient();
export default redisClient;
