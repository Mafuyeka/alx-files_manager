const request = require('supertest');
const app = require('../server'); // Adjust the path as necessary

describe('Files Tests', () => {
  it('should upload a file', async () => {
    const res = await request(app)
      .post('/files')
      .attach('file', 'path/to/file.txt'); // Adjust the path as necessary
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
  });

  it('should retrieve a file', async () => {
    const res = await request(app)
      .get('/files/1'); // Adjust the ID as necessary
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('name');
  });
});
