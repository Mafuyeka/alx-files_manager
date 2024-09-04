const { MongoClient } = require('mongodb');

class DBClient {
  constructor(host = 'localhost', port = 27017, database = 'manager') {
    const username = 'gmarkd';
    const password = 'UEO2AqP2DLHJEqab';
    const url = `mongodb://${username}:${password}@${host}:${port}/${database}`;

    MongoClient.connect(
      url,
      { useUnifiedTopology: true },
      (err, client) => {
        if (err) throw err;
        this.db = client.db(database);
      }
    );
  }

  isAlive() {
    return !!this.db;
  }

  async nbUsers() {
    return this.db.collection('users').countDocuments();
  }

  async nbFiles() {
    return this.db.collection('files').countDocuments();
  }
}

const dbClient = new DBClient(
  process.env.DB_HOST,
  process.env.DB_PORT,
  process.env.DB_DATABASE
);

module.exports = dbClient;
