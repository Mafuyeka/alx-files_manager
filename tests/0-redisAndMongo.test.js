const redis = require('redis');
const mongoose = require('mongoose');
const RedisAndMongo = require('../src/RedisAndMongo');

describe('RedisAndMongo', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/test');
    const redisClient = redis.createClient();
    await redisClient.connect();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await redisClient.quit();
  });

  it('should connect to Redis and MongoDB', async () => {
    const redisAndMongo = new RedisAndMongo();
    await redisAndMongo.connect();
    expect(redisAndMongo.isConnected).toBe(true);
  });

  it('should store data in Redis', async () => {
    const redisAndMongo = new RedisAndMongo();
    await redisAndMongo.connect();
    await redisAndMongo.storeData('testKey', 'testValue');
    const data = await redisAndMongo.getData('testKey');
    expect(data).toBe('testValue');
  });

  it('should store data in MongoDB', async () => {
    const redisAndMongo = new RedisAndMongo();
    await redisAndMongo.connect();
    await redisAndMongo.storeDataInMongo('testCollection', { testKey: 'testValue' });
    const data = await redisAndMongo.getDataFromMongo('testCollection', { testKey: 'testValue' });
    expect(data).toEqual({ testKey: 'testValue' });
  });
});
