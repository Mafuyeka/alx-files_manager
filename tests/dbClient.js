// tests/dbClient.test.js
import dbClient from '../utils/db';

describe('DB Client Tests', () => {
  it('should return true when DB is alive', async () => {
    expect(await dbClient.isAlive()).toBe(true);
  });

  it('should return the number of users', async () => {
    const numUsers = await dbClient.nbUsers();
    expect(numUsers).toBeGreaterThanOrEqual(0);
  });

  it('should return the number of files', async () => {
    const numFiles = await dbClient.nbFiles();
    expect(numFiles).toBeGreaterThanOrEqual(0);
  });
});
