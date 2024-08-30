const request = require('supertest');
const app = require('../server'); // Adjust the path as necessary

describe('Users Tests', () => {
  it('should create a new user', async () => {
    const res = await request(app)
      .post('/users')
      .send({
        email: 'user@example.com',
        password: 'password123'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
  });

  it('should get user profile', async () => {
    const res = await request(app)
      .get('/users/me')
      .set('Authorization', 'Bearer token'); // Adjust the token as necessary
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('email');
  });
});
