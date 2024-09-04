// tests/helpers.js
import request from 'supertest';
import app from './setup';

export const getAuthToken = async () => {
  const res = await request(app)
    .get('/connect')
    .set('Authorization', 'Basic dGVzdEBleGFtcGxlLmNvbTpwYXNzd29yZDEyMw==');
  return res.body.token;
};
