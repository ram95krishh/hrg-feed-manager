const router = require('express').Router();
const config = require('config');
const mongoose = require('mongoose');
const { omit } = require('ramda')

const { logger, api } = require('../lib');
const userUtils = require('./utils/users');
const { UserModel } = require('../models');

const auth = require('../middleware/auth');
const upload = require('../middleware/upload')

const onboardUsers = async (req, res) => {
  try {
    const usersUrl = config.get('usersUrl');
    const users = await api.callGet(usersUrl);
    let userObjects = userUtils.shapeUsersData(users);
    userObjects = await userUtils.addPasswords(userObjects);
    const existingUsers = await UserModel.find().lean();
    const existingIds = existingUsers.map(usr => usr.id)
    const newUsers = userObjects.filter(usr => !existingIds.includes(usr.id))
    if (newUsers.length) {
      const insertAction = await UserModel.collection.insertMany(userObjects);
      return res.status(200).json(userObjects);
    }
    return res.status(200).send();
  } catch (e) {
    logger.error(`Error in onboarding user :: Exception :: ${e.stack}`);
    return res.status(500).json({ error: e.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await UserModel.findByCredentials(username, password);
    if (!user) {
      return res.status(401).send({ error: 'Login failed! Check authentication credentials' })
    }
    const token = await user.generateAuthToken();
    return res.status(200).send(token);
  } catch (e) {
    logger.error(`Error in login :: Exception :: ${e.stack}`);
    return res.status(500).json({ error: e.message });
  }
}

const logout = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => token.token != req.token);
    await req.user.save();
    res.send();
  } catch (error) {
      res.status(500).send(error)
  }
}

const logoutAll = async (req, res) => {
  try {
    req.user.tokens.splice(0, req.user.tokens.length);
    await req.user.save();
    res.send();
  } catch (error) {
      res.status(500).send(error);
  }
}

const getUserInfo = async (req, res) => {
  try {
    const userDetails = omit(userUtils.sensitiveKeys, req.user.toJSON())
    return res.status(200).json(userDetails);
  } catch (e) {
    logger.error(`Error in login :: Exception :: ${e.stack}`);
    return res.status(500).json({ error: e.message });
  }
}

const getAllUsers = async (req, res) => {
  try {
    const { role } = req.user.toJSON();
    if (role !== 'admin') {
      return res.status(401).send({ error: 'Not authorized to do this operation' });
    }
    const allUsers = await UserModel.find({}).select(userUtils.sensitiveKeysExclusionString);
    return res.status(200).json(allUsers);
  } catch (e) {
    logger.error(`Error retrieving all users :: Exception :: ${e.stack}`);
    return res.status(500).json({ error: e.message });
  }
}

const returnUploadResponse = async(req, res) => {
  try {
    await UserModel.findByIdAndUpdate(req.user._id, { profilePic: req.fileUrl });
    return res.status(200).send(req.fileUrl);
  } catch (e) {
    logger.error(`Error while updating profile picture :: ${e.stack}`);
    return res.status(500).json({ error: e.message });
  }
}


router.route('/onboard').get(onboardUsers);

router.route('/my-info').get(auth, getUserInfo);
router.route('/get-all').get(auth, getAllUsers);
router.route('/profile-pic').post(auth, upload.single('profilePic'), returnUploadResponse);

router.route('/login').post(login);
router.route('/logout').get(auth, logout);
router.route('/logout-all').get(auth, logoutAll);

module.exports = router;