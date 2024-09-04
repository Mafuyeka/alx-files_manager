import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  static async getConnect(request, response) {
    const authData = request.header('Authorization');
    if (!authData || !authData.startsWith('Basic ')) {
      return response.status(401).json({ error: 'Unauthorized' });
    }

    const userEmail = Buffer.from(authData.split(' ')[1], 'base64').toString('ascii');
    const [email, password] = userEmail.split(':');
    if (!email || !password) {
      return response.status(401).json({ error: 'Unauthorized' });
    }

    const hashedPassword = sha1(password);
    const users = await dbClient.client.db().collection('users').findOne({ email, password: hashedPassword });
    if (!users) {
      return response.status(401).json({ error: 'Unauthorized' });
    }

    const token = uuidv4();
    const key = `auth_${token}`;
    await redisClient.set(key, users._id.toString(), 60 * 60 * 24);
    return response.status(200).json({ token });
  }

  static async getDisconnect(request, response) {
    const token = request.header('X-Token');
    if (!token) {
      return response.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;
    const id = await redisClient.get(key);
    if (id) {
      await redisClient.del(key);
      return response.status(204).send();
    } else {
      return response.status(401).json({ error: 'Unauthorized' });
    }
  }
}

export default AuthController;
