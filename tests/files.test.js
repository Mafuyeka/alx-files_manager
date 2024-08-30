
const request = require('supertest');
const app = require('../server'); // Adjust the path as necessary

describe('Files', () => {
  it('should upload a file', async () => {
    const res = await request(app)
      .post('/files')
      .attach('file', 'path/to/file.jpg'); // Adjust the path as necessary
    expect(res.statusCode).toEqual(201);
  });

  it('should list all files', async () => {
    const res = await request(app).get('/files');
    expect(res.statusCode).toEqual(200);
  });
});
