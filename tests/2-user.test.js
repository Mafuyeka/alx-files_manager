
const User = require('../src/User');

describe('User', () => {
  it('should create a new user', async () => {
    const user = new User();
    await user.createUser('testUser', 'testEmail', 'testPassword');
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('name', 'testUser');
    expect(user).toHaveProperty('email', 'testEmail');
  });

  it('should authenticate a user', async () => {
    const user = new User();
    await user.createUser('testUser', 'testEmail', 'testPassword');
    const authenticatedUser = await user.authenticate('testEmail', 'testPassword');
    expect(authenticatedUser).toEqual(user);
  });
});
