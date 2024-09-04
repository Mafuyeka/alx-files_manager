import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/mongo';
import redisClient from '../utils/redis';
import fs from 'fs';
import mime from 'mime-types';
import imageThumbnail from 'image-thumbnail';

class FilesController {
  static async postUpload(req, res) {
    const { name, type, parentId, isPublic, data } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }
    if (!type) {
      return res.status(400).json({ error: 'Missing type' });
    }
    if (!data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    const userId = await redisClient.get(`auth_${req.headers['x-token']}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const fileData = Buffer.from(data, 'base64');
    const filePath = `/tmp/${uuidv4()}`;

    fs.writeFileSync(filePath, fileData);

    const newFile = {
      userId,
      name,
      type,
      isPublic: isPublic || false,
      parentId: parentId || 0,
      localPath: filePath,
    };

    await dbClient.db.collection('files').insertOne(newFile);
    return res.status(201).json(newFile);
  }

  static async getShow(req, res) {
    const { id } = req.params;
    const userId = await redisClient.get(`auth_${req.headers['x-token']}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const file = await dbClient.db.collection('files').findOne({ _id: id, userId });
    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    if (file.type === 'folder') {
      return res.status(400).json({ error: 'A folder doesn\'t have content' });
    }

    if (!file.isPublic && file.userId !== userId) {
      return res.status(404).json({ error: 'Not found' });
    }

    const filePath = file.localPath;
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Not found' });
    }

    const mimeType = mime.lookup(filePath);
    res.setHeader('Content-Type', mimeType);
    fs.createReadStream(filePath).pipe(res);
  }

  static async getIndex(req, res) {
    const { parentId, page = 0 } = req.query;
    const userId = await redisClient.get(`auth_${req.headers['x-token']}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const query = { userId, parentId: parentId || 0 };
    const files = await dbClient.db.collection('files').find(query).skip(page * 20).limit(20).toArray();
    return res.status(200).json(files);
  }

  static async putPublish(req, res) {
    const { id } = req.params;
    const userId = await redisClient.get(`auth_${req.headers['x-token']}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const file = await dbClient.db.collection('files').findOne({ _id: id, userId });
    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    await dbClient.db.collection('files').updateOne({ _id: id }, { $set: { isPublic: true } });
    return res.status(200).json({ id, isPublic: true });
  }

  static async putUnpublish(req, res) {
    const { id } = req.params;
    const userId = await redisClient.get(`auth_${req.headers['x-token']}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const file = await dbClient.db.collection('files').findOne({ _id: id, userId });
    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    await dbClient.db.collection('files').updateOne({ _id: id }, { $set: { isPublic: false } });
    return res.status(200).json({ id, isPublic: false });
  }

  static async getThumbnail(req, res) {
    const { id } = req.params;
    const userId = await redisClient.get(`auth_${req.headers['x-token']}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const file = await dbClient.db.collection('files').findOne({ _id: id, userId });
    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    if (file.type !== 'image') {
      return res.status(400).json({ error: 'A thumbnail can only be generated for image files' });
    }

    const filePath = file.localPath;
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Not found' });
    }

    try {
      const thumbnail = await imageThumbnail(filePath);
      res.setHeader('Content-Type', 'image/png');
      res.send(thumbnail);
    } catch (error) {
      res.status(500).json({ error: 'Error generating thumbnail' });
    }
  }
}

export default FilesController;
