// tests/auth.test.js
import request from 'supertest';
import app from './setup';

describe('GET /connect', () => {
  it('should authenticate a user and return a token', async () => {
    const res = await request(app)
      .get('/connect')
      .set('Authorization', 'Basic dGVzdEBleGFtcGxlLmNvbTpwYXNzd29yZDEyMw=='); // Base64 encoded "email:password"
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should return error for invalid credentials', async () => {
    const res = await request(app)
      .get('/connect')
      .set('Authorization', 'Basic dGVzdEBleGFtcGxlLmNvbTphYmNkZWY='); // Wrong credentials
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('error', 'Unauthorized');
  });
});
