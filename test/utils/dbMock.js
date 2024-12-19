const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectToDB = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
  });
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
};

module.exports = { connectToDB, disconnectDB };