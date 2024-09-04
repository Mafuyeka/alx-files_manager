import redisClient from '../utils/redis.js';
import dbClient from '../utils/db.js';
import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';

class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

    const [email, password] = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const user = await dbClient.db.collection('users').findOne({ email, password: sha1(password) });
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const token = uuidv4();
    await redisClient.set(`auth_${token}`, user._id, 86400); // 24 hours
    res.status(200).json({ token });
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    await redisClient.del(`auth_${token}`);
    res.status(204).send();
  }

  static async getMe(req, res) {
    const token = req.headers['x-token'];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await dbClient.db.collection('users').findOne({ _id: userId });
    res.status(200).json({ id: user._id, email: user.email });
  }
}

export default AuthController;
