// tests/stats.test.js
import request from 'supertest';
import app from './setup';

describe('GET /stats', () => {
  it('should return the number of users and files', async () => {
    const res = await request(app).get('/stats');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('users');
    expect(res.body).toHaveProperty('files');
  });
});
