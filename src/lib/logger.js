const config = require('config');
const winston = require('winston');
const WinstonContext = require('winston-context');

// const AirbrakeTransport = require('./AirbrakeTransport');

const consoleFormat = winston.format.printf(info => (
  JSON.stringify(info, null, '\n')
));

const isProductionEnvironment = () => process.env.NODE_CONFIG_ENV === 'prod';

const logLevel = isProductionEnvironment() ? 'info' : 'silly';

const isTestEnvironment = process.env.NODE_ENV === 'test';

function createLogger(env) {
  let logger;
  if (env && !['local'].includes(env)) {
    logger = winston.createLogger({
      level: logLevel,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.label({ label: config.get('logPrefix') }),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.Console({ silent: isTestEnvironment }),
      ],
    });
  } else {
    logger = winston.createLogger({
      level: logLevel,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.label({ label: config.get('logPrefix') }),
        consoleFormat,
      ),
      transports: [
        new winston.transports.Console({ silent: isTestEnvironment }),
      ],
    });
  }
  return logger;
}

const logger = createLogger(process.env.NODE_ENV);

const contextLogger = new WinstonContext(logger, '', {
  requestId: (Math.random() * 1e20).toString(36),
});

module.exports = contextLogger;
