import redisClient from '../utils/redis.js';
import dbClient from '../utils/db.js';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

class FilesController {
  static async postUpload(req, res) {
    const token = req.headers['x-token'];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { name, type, data, parentId, isPublic } = req.body;

    if (!name) return res.status(400).json({ error: 'Missing name' });
    if (!type || !['file', 'folder', 'image'].includes(type)) return res.status(400).json({ error: 'Missing type' });
    if ((type === 'file' || type === 'image') && !data) return res.status(400).json({ error: 'Missing data' });

    let parentFile;
    if (parentId) {
      parentFile = await dbClient.db.collection('files').findOne({ _id: parentId });
      if (!parentFile) return res.status(400).json({ error: 'Parent not found' });
      if (parentFile.type !== 'folder') return res.status(400).json({ error: 'Parent is not a folder' });
    }

    const localPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    if (!fs.existsSync(localPath)) fs.mkdirSync(localPath, { recursive: true });

    let fileData = null;
    if (type === 'file' || type === 'image') {
      const fileName = uuidv4();
      fileData = Buffer.from(data, 'base64');
      fs.writeFileSync(path.join(localPath, fileName), fileData);
    }

    const newFile = {
      userId,
      name,
      type,
      isPublic: isPublic || false,
      parentId: parentId || 0,
      localPath: fileData ? path.join(localPath, uuidv4()) : null,
    };

    const result = await dbClient.db.collection('files').insertOne(newFile);
    res.status(201).json({ id: result.insertedId, ...newFile });
  }
}

export default FilesController;
