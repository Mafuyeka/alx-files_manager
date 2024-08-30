const request = require('supertest');
const app = require('../server'); // Adjust the path as necessary

describe('Users', () => {
  it('should get user profile', async () => {
    const res = await request(app).get('/users/me');
    expect(res.statusCode).toEqual(200);
  });

  it('should update user profile', async () => {
    const res = await request(app)
      .put('/users/me')
      .send({
        name: 'New Name'
      });
    expect(res.statusCode).toEqual(200);
  });
});
