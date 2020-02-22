const config = require('config');
const mongoose = require('mongoose');
const logger = require('./logger');

const contextLogger = logger.getContext('', {
  type: 'mongo-db',
});

const connectionUri = config.get('MongoDbConnectionString');

const conn = mongoose.connection;
conn.on('connected', () => contextLogger.info('Connected'));
conn.once('open', () => contextLogger.info('Connection open'));
conn.on('disconnected', () => contextLogger.warn('Disconnected'));
conn.on('reconnected', () => contextLogger.info('Reconnected'));
conn.on('error', error => contextLogger.error(`${error.stack}`));

async function retryStrategy() {
  try {
    const options = { useUnifiedTopology: true, useNewUrlParser: true, poolSize: 10 };
    await mongoose.connect(connectionUri, options);
  } catch (e) {
    contextLogger.error(`${e.stack}`);
    setTimeout(retryStrategy, 1000);
  }
}

retryStrategy();
