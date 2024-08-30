const request = require('supertest');
const app = require('../server'); // Adjust the path as necessary

describe('App', () => {
  it('should return 200 OK', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
  });
});
