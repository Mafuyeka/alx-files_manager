import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = mongodb+srv://gmarkd:<UEO2AqP2DLHJEqab>@manager.xrimd.mongodb.net/;
    this.client = new MongoClient(url, { useUnifiedTopology: true });
    this.client.connect().then(() => {
      this.db = this.client.db(database);
    });
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    return this.db.collection('users').countDocuments();
  }

  async nbFiles() {
    return this.db.collection('files').countDocuments();
  }
}

const dbClient = new DBClient();
export default dbClient;
