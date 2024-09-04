import Queue from 'bull';
import imageThumbnail from 'image-thumbnail';
import fs from 'fs';
import { ObjectID } from 'mongodb';
import dbClient from './utils/db';

const fileQueue = new Queue('fileQueue', 'redis://127.0.0.1:6379');

async function generateThumbnail(path, width) {
  const thumbnail = await imageThumbnail(path, { width });
  const thumbnailPath = `${path}_${width}`;
  await fs.promises.writeFile(thumbnailPath, thumbnail);
}

fileQueue.process(async (job) => {
  const { fileId, userId } = job.data;

  if (!fileId) {
    throw new Error('Missing fileId');
  }

  if (!userId) {
    throw new Error('Missing userId');
  }

  const files = dbClient.db.collection('files');
  const file = await files.findOne({
    _id: ObjectID(fileId),
    userId: ObjectID(userId),
  });

  if (!file) {
    throw new Error('File not found');
  }

  const sizes = [500, 250, 100];
  const thumbnailPromises = sizes.map((size) => generateThumbnail(file.localPath, size));

  await Promise.all(thumbnailPromises);
});
