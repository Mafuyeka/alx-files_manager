const Apps = require('../src/Apps');

describe('Apps', () => {
  it('should create a new app', async () => {
    const apps = new Apps();
    const app = await apps.createApp('testApp');
    expect(app).toHaveProperty('id');
    expect(app).toHaveProperty('name', 'testApp');
  });

  it('should get all apps', async () => {
    const apps = new Apps();
    await apps.createApp('testApp1');
    await apps.createApp('testApp2');
    const allApps = await apps.getAllApps();
    expect(allApps).toHaveLength(2);
  });

  it('should get an app by ID', async () => {
    const apps = new Apps();
    const app = await apps.createApp('testApp');
    const retrievedApp = await apps.getAppById(app.id);
    expect(retrievedApp).toEqual(app);
  });
});
