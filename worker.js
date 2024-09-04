import { Queue, Worker } from 'bull';
import dbClient from './utils/db.js';
import fs from 'fs';
import path from 'path';
import thumbnail from 'image-thumbnail';
import { fileQueue } from './utils/fileQueue.js';

const worker = new Worker('fileQueue', async (job) => {
  const { userId, fileId, fileName } = job.data;

  if (!fileId) throw new Error('Missing fileId');
  if (!userId) throw new Error('Missing userId');

  const fileDocument = await dbClient.db.collection('files').findOne({ _id: fileId, userId });
  if (!fileDocument) throw new Error('File not found');

  const localPath = process.env.FOLDER_PATH || '/tmp/files_manager';
  const originalFilePath = path.join(localPath, fileName);

  // Generate thumbnails
  const sizes = [500, 250, 100];
  for (const size of sizes) {
    const thumbnailOptions = { width: size };
    const thumbnailPath = path.join(localPath, `${fileName}_${size}`);
    const thumbnailImage = await thumbnail(originalFilePath, thumbnailOptions);
    fs.writeFileSync(thumbnailPath, thumbnailImage);
  }
});

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed!`);
});

worker.on('failed', (job, err) => {
  console.log(`Job ${job.id} failed with error: ${err.message}`);
});

console.log('Worker started...');
