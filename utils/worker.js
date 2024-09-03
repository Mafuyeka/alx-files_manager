import Queue from 'bull';
import { ObjectId } from 'mongodb';
import imageThumbnail from 'image-thumbnail';
import fs from 'fs';
import dbClient from './utils/db';

const fileQueue = new Queue('fileQueue');

fileQueue.process(async (job) => {
  const { userId, fileId } = job.data;

  if (!fileId) throw new Error('Missing fileId');
  if (!userId) throw new Error('Missing userId');

  const file = await dbClient.db.collection('files').findOne({ _id: ObjectId(fileId), userId: ObjectId(userId) });
  if (!file) throw new Error('File not found');

  const originalPath = file.localPath;
  const sizes = [500, 250, 100];

  for (const size of sizes) {
    const thumbnail = await imageThumbnail(originalPath, { width: size });
    const thumbnailPath = `${originalPath}_${size}`;
    await fs.promises.writeFile(thumbnailPath, thumbnail);
  }
});

console.log('Worker is running');
