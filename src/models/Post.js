const mongoose = require('mongoose');

const { Schema } = mongoose;

const CommentSchema = new Schema({
  postId: {
    required: true,
    type: Schema.Types.Number,
  },
  id: {
    required: true,
    unique: true,
    type: Schema.Types.Number,
  },
  name: {
    required: true,
    type: Schema.Types.String,
  },
  email: {
    required: true,
    type: Schema.Types.String,
  },
  body: {
    required: true,
    type: Schema.Types.String,
  }
}, { _id: false });

const PostSchema = new Schema({
  userId: {
    required: true,
    type: Schema.Types.Number,
  },
  id: {
    required: true,
    unique: true,
    type: Schema.Types.Number,
  },
  title: {
    required: true,
    type: Schema.Types.String,
  },
  body: {
    required: true,
    type: Schema.Types.String,
  },
  comments: {
    type: [CommentSchema]
  }
})

module.exports = PostSchema;
