const router = require('express').Router();
const config = require('config');
const mongoose = require('mongoose');

const { logger, api } = require('../lib');
const auth = require('../middleware/auth');

const userUtils = require('./utils/users');
const { UserModel, PostSchema } = require('../models');


const addPostsWithComments = async (posts, allComments) => {
  const userId = posts[0].userId;
  const db = mongoose.connection.useDb('user' + userId);
  const postsToAdd = posts.map(post => {
    postComments = allComments.filter(comment => comment.postId == post.id);
    return Object.assign({}, {
      ...post,
      comments: postComments
    });
  })
  PostModel = db.model('Post', PostSchema);
  return PostModel.insertMany(postsToAdd);
}

const injectPosts = async (req, res) => {
  try {
    const postsUrl = config.get('postsUrl');
    const commentsUrl = config.get('commentsUrl');
    const users = await UserModel.find().lean();
    if (!users.length) {
      return res.status(500).send('Onboard users before injecting posts');
    }
    const [posts, comments] = await Promise.all([api.callGet(postsUrl), api.callGet(commentsUrl)])
    const postAddActions = await Promise.all(users.map(user => {
      const postsToAdd = posts.filter(post => post.userId === user.id);
      if (postsToAdd.length) {
        return addPostsWithComments(postsToAdd, comments)
      }
    }));
    return res.status(200).send('Success');
  } catch (e) {
    logger.error(`Error in onboarding user :: Exception :: ${e.stack}`);
    return res.status(500).json({ error: e.message });
  }
};

const fetchUserPosts = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const db = mongoose.connection.useDb('user' + userId);
    PostModel = db.model('Post', PostSchema);
    const posts = await PostModel.find({ userId }).select('-_id -__v');
    return res.status(200).json(posts);
  } catch (e) {
    logger.error(`Error while retrieving user posts :: Exception :: ${e.stack}`);
    return res.status(500).json({ error: e.message });
  }
}

const getAllPosts = async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'admin') {
      return res.status(401).send({ error: 'Not authorized to do this operation' });
    }
    const allUsers = await UserModel.find({}).select(userUtils.sensitiveKeysExclusionString).lean();
    const userIds = allUsers.map(user => user.id);
    const postArrays = await Promise.all(userIds.map(id => {
      const db = mongoose.connection.useDb('user' + id);
      PostModel = db.model('Post', PostSchema);
      return PostModel.find({}).select('-_id -__v');
    }));

    if (!postArrays.length) return res.status(200).json([]);
  
    const posts = postArrays.reduce((acc, val) => acc.concat(val), [])
    return res.status(200).json(posts);
  } catch (e) {
    logger.error(`Error while retrieving user posts :: Exception :: ${e.stack}`);
    return res.status(500).json({ error: e.message });
  }
}

router.route('/get-all').get(auth, getAllPosts);
router.route('/inject').get(injectPosts);
router.route('/').get(auth, fetchUserPosts);

module.exports = router;