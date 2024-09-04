import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import fs from 'fs'; // Required for file operations

class FilesController {
  // Upload a file or create a folder
  static async postUpload(req, res) {
    const { name, type, parentId = '0', isPublic = false, data } = req.body;
    const token = req.headers['x-token'];
    
    // Validate user token
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing or invalid type' });
    }

    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    // Validate parent folder if provided
    if (parentId !== '0') {
      const parent = await dbClient.db.collection('files').findOne({
        _id: dbClient.client.db.ObjectId(parentId),
        userId: dbClient.client.db.ObjectId(userId),
      });
      if (!parent) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (parent.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    // Prepare folder path and file storage path
    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    const filePath = `${folderPath}/${uuidv4()}`;

    // Handle folder creation
    if (type === 'folder') {
      const newFile = {
        userId: dbClient.client.db.ObjectId(userId),
        name,
        type,
        isPublic,
        parentId: parentId === '0' ? 0 : dbClient.client.db.ObjectId(parentId),
      };
      const result = await dbClient.db.collection('files').insertOne(newFile);
      return res.status(201).json({ id: result.insertedId, ...newFile });
    }

    // Handle file or image upload
    if (type === 'file' || type === 'image') {
      const newFile = {
        userId: dbClient.client.db.ObjectId(userId),
        name,
        type,
        isPublic,
        parentId: parentId === '0' ? 0 : dbClient.client.db.ObjectId(parentId),
        localPath: filePath,
      };

      await dbClient.db.collection('files').insertOne(newFile);
      await fs.promises.writeFile(filePath, Buffer.from(data, 'base64'));
      return res.status(201).json(newFile);
    }
  }

  // Show details of a specific file
  static async getShow(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const file = await dbClient.db.collection('files').findOne({
      _id: dbClient.client.db.ObjectId(req.params.id),
      userId: dbClient.client.db.ObjectId(userId),
    });
    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    return res.status(200).json(file);
  }

  // List files within a specific folder, or at the root
  static async getIndex(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { parentId = '0', page = 0 } = req.query;
    const files = await dbClient.db.collection('files')
      .find({
        userId: dbClient.client.db.ObjectId(userId),
        parentId: parentId === '0' ? 0 : dbClient.client.db.ObjectId(parentId),
      })
      .skip(page * 20)
      .limit(20)
      .toArray();

    return res.status(200).json(files);
  }

  // Publish a file (make it public)
  static async putPublish(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const file = await dbClient.db.collection('files').findOneAndUpdate(
      {
        _id: dbClient.client.db.ObjectId(req.params.id),
        userId: dbClient.client.db.ObjectId(userId),
      },
      { $set: { isPublic: true } },
      { returnDocument: 'after' }
    );

    if (!file.value) {
      return res.status(404).json({ error: 'Not found' });
    }

    return res.status(200).json(file.value);
  }

  // Unpublish a file (make it private)
  static async putUnpublish(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const file = await dbClient.db.collection('files').findOneAndUpdate(
      {
        _id: dbClient.client.db.ObjectId(req.params.id),
        userId: dbClient.client.db.ObjectId(userId),
      },
      { $set: { isPublic: false } },
      { returnDocument: 'after' }
    );

    if (!file.value) {
      return res.status(404).json({ error: 'Not found' });
    }

    return res.status(200).json(file.value);
  }
}

export default FilesController;
