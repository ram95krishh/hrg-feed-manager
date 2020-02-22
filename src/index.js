if (process.NODE_CONFIG_ENV === 'production') {
    // eslint-disable-next-line
    require('newrelic');
  }
  
  const path = require('path');
  
  process.env.NODE_CONFIG_DIR = path.join(__dirname, 'config');
  
  const express = require('express');
  const bodyParser = require('body-parser');
  const morgan = require('morgan');
  const cors = require('cors');
  const routes = require('./routes');
  const { logger } = require('./lib');
  const config = require('config');
  require('./lib/mongo-db');
  
  const app = express();
  
  app.all('/', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
  
  const port = config.get('port');
  
  app.use(cors());
  app.use(bodyParser.json({
    limit: '50mb',
  }));
  
  app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
  }));
  
  app.use(morgan(':date[iso] :method :url :status :res[content-length] - :response-time ms'));
  
  const errorHandler = (err, req, res, next) => {
    logger.error(`${err.stack}`);
    if (res.headersSent) {
      next(err);
      return;
    }
    res.sendStatus(500);
  };
  
  app.use(errorHandler);
  
  const server = app.listen(port, (err) => {
    if (err) {
      logger.error(`${err.stack}`);
      return;
    }
    logger.info(`Listening on port ${port}`);
  });
  
  app.use((req, res, next) => {
    req.server = server;
    next();
  });
  
  routes(app);
  
  app.use(express.static('static'));

  /**
 * @description
 * Uncaught exceptions are logged here before terminating the application.
 * Resuming the application at this point is not safe.
 * @see https://nodejs.org/api/process.html#process_event_uncaughtexception
 * @see https://nodejs.org/api/process.html#process_warning_using_uncaughtexception_correctly
 */
process.on('uncaughtException', (err) => {
    logger.error(`uncaughtException :: ${err.stack}`);
    process.exit(1);
  });
  
  /**
   * @description
   * Unhandled Promise Rejection is deprecated. In the future release it will
   * terminate the application just like uncaught exceptions and hence it will
   * make the migration to later versions of Node.js 'painful'.
   * @see https://nodejs.org/api/process.html#process_event_unhandledrejection
   */
  process.on('unhandledRejection', (reason) => {
    logger.error(`unhandledRejection :: ${reason.stack || reason}`);
    process.exit(1);
  });
