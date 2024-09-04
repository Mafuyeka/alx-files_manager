import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  // Handles user login and token generation
  static async getConnect(req, res) {
    const authData = req.header('Authorization');
    if (!authData || !authData.startsWith('Basic ')) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    let userEmail = authData.split(' ')[1];
    const buff = Buffer.from(userEmail, 'base64');
    userEmail = buff.toString('ascii');
    const data = userEmail.split(':'); // [email, password]

    if (data.length !== 2) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const [email, plainPassword] = data;
    const hashedPassword = sha1(plainPassword);
    const users = dbClient.db.collection('users');

    try {
      const user = await users.findOne({ email, password: hashedPassword });
      if (user) {
        const token = uuidv4();
        const key = `auth_${token}`;
        await redisClient.set(key, user._id.toString(), 60 * 60 * 24); // 24-hour token expiration
        res.status(200).json({ token });
      } else {
        res.status(401).json({ error: 'Unauthorized' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Handles user logout and token invalidation
  static async getDisconnect(req, res) {
    const token = req.header('X-Token');
    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);

    if (userId) {
      await redisClient.del(key);
      res.status(204).json({});
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  }
}

export default AuthController;
