import { Queue, Worker, QueueScheduler } from 'bullmq';
import { createClient } from 'redis';
import dbClient from './utils/mongo';
import redisClient from './utils/redis';

const connection = createClient();

const fileQueue = new Queue('fileQueue', { connection });
const fileQueueScheduler = new QueueScheduler('fileQueue', { connection });

const worker = new Worker('fileQueue', async job => {
  const { fileId, userId } = job.data;

  const file = await dbClient.db.collection('files').findOne({ _id: fileId, userId });
  if (!file) {
    throw new Error('File not found');
  }

  // Perform the background task (e.g., generate a thumbnail)
  if (file.type === 'image') {
    const thumbnail = await generateThumbnail(file.localPath);
    await dbClient.db.collection('files').updateOne({ _id: fileId }, { $set: { thumbnail } });
  }
}, { connection });

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed with error ${err.message}`);
});

async function generateThumbnail(filePath) {
  // Implement your thumbnail generation logic here
  // For example, using the image-thumbnail library
  const imageThumbnail = require('image-thumbnail');
  const thumbnail = await imageThumbnail(filePath);
  return thumbnail;
}

export { fileQueue, fileQueueScheduler, worker };
