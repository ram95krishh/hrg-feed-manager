const {
  posts,
  users,
} = require('../service');

module.exports = (app) => {
  app.get('/health', (req, res) => res.sendStatus(200));
  app.use('/posts', posts);
  app.use('/users', users);
};
