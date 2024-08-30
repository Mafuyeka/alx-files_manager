const request = require('supertest');
const app = require('../server'); // Adjust the path as necessary

describe('Auth Tests', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/users')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
  });

  it('should login a user', async () => {
    const res = await request(app)
      .post('/auth')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });
});
