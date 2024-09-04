// tests/files.test.js
import request from 'supertest';
import app from './setup';

describe('POST /files', () => {
  it('should upload a file', async () => {
    const token = await getAuthToken(); // Mock or use real token
    const res = await request(app)
      .post('/files')
      .set('X-Token', token)
      .send({
        name: 'testFile',
        type: 'image',
        data: 'base64encodeddata==',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
  });
});
