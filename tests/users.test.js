// tests/users.test.js
import request from 'supertest';
import app from './setup';

describe('POST /users', () => {
  it('should create a new user', async () => {
    const res = await request(app)
      .post('/users')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('email', 'test@example.com');
  });

  it('should return error for missing email', async () => {
    const res = await request(app).post('/users').send({ password: 'password123' });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error', 'Missing email');
  });

  it('should return error for missing password', async () => {
    const res = await request(app).post('/users').send({ email: 'test@example.com' });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error', 'Missing password');
  });
});
