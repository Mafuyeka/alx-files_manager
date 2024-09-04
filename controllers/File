import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import { ObjectID } from 'mongodb';
import mime from 'mime-types';
import Queue from 'bull';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const fileQueue = new Queue('fileQueue', 'redis://127.0.0.1:6379');

class FilesController {
  // Retrieves user from Redis using the token from the request
  static async getUser(request) {
    const token = request.header('X-Token');
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    if (userId) {
      const users = dbClient.db.collection('users');
      const idObject = new ObjectID(userId);
      const user = await users.findOne({ _id: idObject });
      return user || null;
    }
    return null;
  }

  // Handles file upload logic
  static async postUpload(request, response) {
    const user = await FilesController.getUser(request);
    if (!user) {
      return response.status(401).json({ error: 'Unauthorized' });
    }

    const { name, type, parentId, data, isPublic = false } = request.body;

    if (!name) return response.status(400).json({ error: 'Missing name' });
    if (!type) return response.status(400).json({ error: 'Missing type' });
    if (type !== 'folder' && !data) return response.status(400).json({ error: 'Missing data' });

    const files = dbClient.db.collection('files');

    // Check for valid parent folder
    if (parentId) {
      const parentFile = await files.findOne({ _id: new ObjectID(parentId), userId: user._id });
      if (!parentFile) return response.status(400).json({ error: 'Parent not found' });
      if (parentFile.type !== 'folder') return response.status(400).json({ error: 'Parent is not a folder' });
    }

    if (type === 'folder') {
      files.insertOne({
        userId: user._id,
        name,
        type,
        parentId: parentId || 0,
        isPublic,
      }).then((result) => response.status(201).json({
        id: result.insertedId,
        userId: user._id,
        name,
        type,
        isPublic,
        parentId: parentId || 0,
      })).catch((error) => console.log(error));
    } else {
      const filePath = process.env.FOLDER_PATH || '/tmp/files_manager';
      const fileName = `${filePath}/${uuidv4()}`;
      const buffer = Buffer.from(data, 'base64');

      try {
        await fs.mkdir(filePath, { recursive: true });
        await fs.writeFile(fileName, buffer, 'utf-8');
      } catch (error) {
        console.log(error);
      }

      files.insertOne({
        userId: user._id,
        name,
        type,
        isPublic,
        parentId: parentId || 0,
        localPath: fileName,
      }).then((result) => {
        response.status(201).json({
          id: result.insertedId,
          userId: user._id,
          name,
          type,
          isPublic,
          parentId: parentId || 0,
        });
        if (type === 'image') {
          fileQueue.add({ userId: user._id, fileId: result.insertedId });
        }
      }).catch((error) => console.log(error));
    }
    return null;
  }

  // Retrieves a single file by ID
  static async getShow(request, response) {
    const user = await FilesController.getUser(request);
    if (!user) {
      return response.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = request.params;
    const files = dbClient.db.collection('files');
    const file = await files.findOne({ _id: new ObjectID(id), userId: user._id });

    if (!file) return response.status(404).json({ error: 'Not found' });
    return response.status(200).json(file);
  }

  // Retrieves list of files
  static async getIndex(request, response) {
    const user = await FilesController.getUser(request);
    if (!user) return response.status(401).json({ error: 'Unauthorized' });

    const { parentId, page = 0 } = request.query;
    const files = dbClient.db.collection('files');
    const query = parentId ? { userId: user._id, parentId: new ObjectID(parentId) } : { userId: user._id };

    const fileList = await files.find(query).skip(20 * parseInt(page, 10)).limit(20).toArray();
    return response.status(200).json(fileList.map(file => ({ ...file, id: file._id, _id: undefined })));
  }

  // Publishes a file
  static async putPublish(request, response) {
    const user = await FilesController.getUser(request);
    if (!user) return response.status(401).json({ error: 'Unauthorized' });

    const { id } = request.params;
    const files = dbClient.db.collection('files');
    const result = await files.findOneAndUpdate({ _id: new ObjectID(id), userId: user._id }, { $set: { isPublic: true } }, { returnOriginal: false });

    if (!result.value) return response.status(404).json({ error: 'Not found' });
    return response.status(200).json(result.value);
  }

  // Unpublishes a file
  static async putUnpublish(request, response) {
    const user = await FilesController.getUser(request);
    if (!user) return response.status(401).json({ error: 'Unauthorized' });

    const { id } = request.params;
    const files = dbClient.db.collection('files');
    const result = await files.findOneAndUpdate({ _id: new ObjectID(id), userId: user._id }, { $set: { isPublic: false } }, { returnOriginal: false });

    if (!result.value) return response.status(404).json({ error: 'Not found' });
    return response.status(200).json(result.value);
  }

  // Retrieves the file content
  static async getFile(request, response) {
    const { id } = request.params;
    const files = dbClient.db.collection('files');
    const file = await files.findOne({ _id: new ObjectID(id) });

    if (!file || file.type === 'folder') return response.status(404).json({ error: 'Not found' });

    if (file.isPublic || (await FilesController.getUser(request))?.userId.toString() === file.userId.toString()) {
      try {
        const content = await fs.readFile(file.localPath);
        const contentType = mime.contentType(file.name);
        return response.header('Content-Type', contentType).status(200).send(content);
      } catch (error) {
        console.log(error);
        return response.status(404).json({ error: 'Not found' });
      }
    } else {
      return response.status(404).json({ error: 'Not found' });
    }
  }
}

export default FilesController;
