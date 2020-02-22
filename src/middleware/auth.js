const jwt = require('jsonwebtoken');
const config = require('config');

const jwtKey = config.get('jwtKey');
const User = require('../models/User');

const auth = async(req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).send({ error: 'Not authorized to access this resource' });
  }
  const token = authHeader.replace('Bearer ', '');
  try {
    const data = jwt.verify(token, jwtKey);
    const user = await User.findOne({ _id: data._id, 'tokens.token': token })
    if (!user) {
      throw new Error()
    }
    req.user = user;
    req.token = token
    next();
  } catch (error) {
    res.status(401).send({ error: 'Not authorized to access this resource' })
  }
}
module.exports = auth