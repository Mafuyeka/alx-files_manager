// tests/status.test.js
import request from 'supertest';
import app from './setup';

describe('GET /status', () => {
  it('should return the status of Redis and DB', async () => {
    const res = await request(app).get('/status');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('redis');
    expect(res.body).toHaveProperty('db');
  });
});
