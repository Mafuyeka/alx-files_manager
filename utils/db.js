import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = process.env.MONGODB_URL || `mongodb://${host}:${port}/${database}`;

    this.client = new MongoClient(url, { useUnifiedTopology: true });

    this.client.connect()
      .then(() => console.log('Connected to MongoDB'))
      .catch(err => console.error('Failed to connect to MongoDB', err));
  }

  async isAlive() {
    try {
      await this.client.db().command({ ping: 1 });
      return true;
    } catch (err) {
      return false;
    }
  }

  async nbUsers() {
    try {
      return await this.client.db().collection('users').countDocuments();
    } catch (err) {
      console.error('Failed to count users', err);
      throw err;
    }
  }

  async nbFiles() {
    try {
      return await this.client.db().collection('files').countDocuments();
    } catch (err) {
      console.error('Failed to count files', err);
      throw err;
    }
  }

  async getUser(query) {
    try {
      return await this.client.db().collection('users').findOne(query);
    } catch (err) {
      console.error('Failed to get user', err);
      throw err;
    }
  }

  async close() {
    try {
      await this.client.close();
      console.log('MongoDB connection closed');
    } catch (err) {
      console.error('Failed to close MongoDB connection', err);
    }
  }
}

const dbClient = new DBClient();
export default dbClient;
