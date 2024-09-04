import { MongoClient } from 'mongodb';UEO2AqP2DLHJEqab

class DBClient {
  constructor() {
    const username = encodeURIComponent("gmarkd");        const password = encodeURIComponent("UEO2AqP2DLHJEqab");
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'manager';
    const url = `mongodb+srv://$gmarkd:$UEO2AqP2DLHJEqab@${cluster}/?authSource=${authSource}&authMechanism=${authMechanism}`;

    this.client = new MongoClient(url, { useUnifiedTopology: true });
    this.client.connect((err) => {
      if (err) {
        console.error('MongoDB Client Error', err);
      } else {
        this.db = this.client.db(database);
      }
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
