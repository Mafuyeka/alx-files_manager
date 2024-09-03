import Queue from 'bull';
import { ObjectId } from 'mongodb';
import imageThumbnail from 'image-thumbnail';
import fs from 'fs';
import path from 'path'; // To handle paths more safely
import dbClient from './utils/db';

const fileQueue = new Queue('fileQueue');

fileQueue.process(async (job) => {
  const { userId, fileId } = job.data;

  if (!fileId) throw new Error('Missing fileId');
  if (!userId) throw new Error('Missing userId');

  try {
    const file = await dbClient.db.collection('files').findOne({ _id: ObjectId(fileId), userId: ObjectId(userId) });
    if (!file) throw new Error('File not found');

    const originalPath = file.localPath;
    const sizes = [500, 250, 100];

    for (const size of sizes) {
      try {
        const thumbnail = await imageThumbnail(originalPath, { width: size });
        const thumbnailPath = `${originalPath}_${size}`;
        await fs.promises.writeFile(thumbnailPath, thumbnail);
        console.log(`Thumbnail created at ${thumbnailPath}`);
      } catch (thumbnailError) {
        console.error(`Failed to create thumbnail for size ${size}:`, thumbnailError);
      }
    }
  } catch (err) {
    console.error('Error processing file:', err);
    throw err; // Re-throw the error so the job will be marked as failed
  }
});

console.log('Worker is running');
