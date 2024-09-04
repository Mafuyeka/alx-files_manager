import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  // Returns the status of the Redis and DB connections
  static getStatus(req, res) {
    res.status(200).json({ redis: redisClient.isAlive(), db: dbClient.isAlive() });
  }

  // Returns the statistics for users and files in the database
  static async getStats(req, res) {
    try {
      const usersNum = await dbClient.nbUsers();
      const filesNum = await dbClient.nbFiles();
      res.status(200).json({ users: usersNum, files: filesNum });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while fetching statistics' });
    }
  }
}

export default AppController;
