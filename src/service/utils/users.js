const { applySpec, compose, prop, path, merge, dissocPath, tap } = require('ramda');
const bcrypt = require('bcrypt');
const config = require('config');

const { logger } = require('../../lib');
const defaultProfilePic = config.get('defaultProfilePic');

const sensitiveKeys = ['tokens', '__v', '_id', 'password'];
const sensitiveKeysExclusionString = '-_id -__v -password -tokens';

const shapeUsersData = function (users) {
  const userObjects = [];
  users.forEach(user => {
    userObjects.push(transformUserObj(user));
  })
  return userObjects;
}

const transformUserObj = (user) => {
  let coordinates = [0,0];
  try {
    coordinates = [parseFloat(path(['address', 'geo', 'lat'], user)), parseFloat(path(['address', 'geo', 'lng'], user))];
  } catch (e) {
    logger.error("Failing gracefully" + e.message);
  }
  let userObj = shapeUserObj(user, coordinates);
  return userObj;
}

const shapeUserObj = (user, coordinates) => {
  let userObj = applySpec({
    id: prop('id'),
    name: prop('name'),
    username: prop('username'),
    email: prop('email'),
    phone: prop('phone'),
    website: prop('website'),
    address: {
      street: path(['address','street']),
      suite: path(['address','suite']),
      city: path(['address','city']),
      zipcode: path(['address', 'zipcode']),
    },
    company: prop('company')
  })(user);
  userObj = merge(userObj, {
    'address': {
      'geo': coordinates,
      ...userObj.address
    },
    'role': (Math.ceil(Math.random() * 10)) % 2 ? 'admin' : 'viewer',
    'profilePic': defaultProfilePic
  })
  return userObj;
}

const addPasswords = async (userObjs) => {
  return Promise.all(userObjs.map(userObj => addHashedPassword(userObj)));
}

const addHashedPassword = async (userObj) => {
  const emailInverse = userObj.email.split('').reverse().join('');
  // hash the password using our new salt
  const hashedPassword = await bcrypt.hash(emailInverse, 10);

  // override the cleartext password with the hashed one
  userObj.password = hashedPassword;
  return userObj;
}

module.exports = {
  shapeUsersData,
  addPasswords,
  sensitiveKeys,
  sensitiveKeysExclusionString
};