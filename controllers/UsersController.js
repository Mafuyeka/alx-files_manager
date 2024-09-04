import sha1 from 'sha1';
import { ObjectID } from 'mongodb';
import Queue from 'bull';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const userQueue = new Queue('userQueue', 'redis://127.0.0.1:6379');

class UsersController {
  // Create a new user
  static postNew(request, response) {
    const { email, password } = request.body;

    // Check if email and password are provided
    if (!email) {
      return response.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return response.status(400).json({ error: 'Missing password' });
    }

    const users = dbClient.db.collection('users');

    // Check if user already exists
    users.findOne({ email }, (err, user) => {
      if (user) {
        return response.status(400).json({ error: 'Already exist' });
      }

      // Hash password and insert new user
      const hashedPassword = sha1(password);
      users.insertOne({
        email,
        password: hashedPassword,
      })
        .then((result) => {
          response.status(201).json({ id: result.insertedId, email });
          userQueue.add({ userId: result.insertedId });  // Add user creation to a queue for processing
        })
        .catch((error) => {
          console.log(error);
          response.status(500).json({ error: 'Server error' });
        });
    });
  }

  // Get current logged-in user
  static async getMe(request, response) {
    const token = request.header('X-Token');
    const key = `auth_${token}`;
    const userId = await redisClient.get(key);

    // Check if user exists in Redis
    if (!userId) {
      return response.status(401).json({ error: 'Unauthorized' });
    }

    const users = dbClient.db.collection('users');
    const idObject = new ObjectID(userId);

    // Fetch the user details from the database
    users.findOne({ _id: idObject }, (err, user) => {
      if (!user) {
        return response.status(401).json({ error: 'Unauthorized' });
      }
      response.status(200).json({ id: userId, email: user.email });
    });
  }
}

module.exports = UsersController;
