// tests/redisClient.test.js
import redisClient from '../utils/redis';

describe('Redis Client Tests', () => {
  it('should return true when Redis is alive', () => {
    expect(redisClient.isAlive()).toBe(true);
  });

  it('should be able to set and get a key', async () => {
    await redisClient.set('testKey', 'value', 10);
    const value = await redisClient.get('testKey');
    expect(value).toBe('value');
  });

  it('should be able to delete a key', async () => {
    await redisClient.set('deleteKey', 'value', 10);
    await redisClient.del('deleteKey');
    const value = await redisClient.get('deleteKey');
    expect(value).toBe(null);
  });
});
