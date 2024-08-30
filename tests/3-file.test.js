const File = require('../src/File');

describe('File', () => {
  it('should create a new file', async () => {
    const file = new File();
    await file.createFile('testFile', 'testContent');
    expect(file).toHaveProperty('id');
    expect(file).toHaveProperty('name', 'testFile');
    expect(file).toHaveProperty('content', 'testContent');
  });

  it('should read a file', async () => {
    const file = new File();
    await file.createFile('testFile', 'testContent');
    const fileContent = await file.readFile('testFile');
    expect(fileContent).toBe('testContent');
  });

  it('should update a file', async () => {
    const file = new File();
    await file.createFile('testFile', 'testContent');
    await file.updateFile('testFile', 'newContent');
    const updatedFileContent = await file.readFile('testFile');
    expect(updatedFileContent).toBe('newContent');
  });

  it('should delete a file', async () => {
    const file = new File();
    await file.createFile('testFile', 'testContent');
    await file.deleteFile('testFile');
    const deletedFile = await file.readFile('testFile');
    expect(deletedFile).toBeNull();
  });
});
