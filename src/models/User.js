const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');

const jwtKey = config.get('jwtKey');
const defaultProfilePic = config.get('defaultProfilePic');

const SALT_WORK_FACTOR = 10;
const { Schema } = mongoose;

const AddressSchema = new Schema({
  street: {
    required: true,
    type: Schema.Types.String,
  },
  suite: {
    required: true,
    type: Schema.Types.String,
  },
  city: {
    required: true,
    type: Schema.Types.String,
  },
  zipcode: {
    required: true,
    type: Schema.Types.String,
  },
  geo: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number],
      index: '2dsphere',
      required: true
    }
  }
}, { _id : false });

const CompanySchema = new Schema({
  name: {
    required: true,
    type: Schema.Types.String,
  },
  catchPhrase: {
    type: Schema.Types.String,
  },
  bs: {
    type: Schema.Types.String,
  }
}, { _id : false })

const UserSchema = new Schema({
  id: {
    required: true,
    unique: true,
    type: Schema.Types.Number,
  },
  name: {
    required: true,
    type: Schema.Types.String,
  },
  username: {
    required: true,
    type: Schema.Types.String,
  },
  password: {
    type: Schema.Types.String,
    required: true
  },
  profilePic: {
    type: Schema.Types.String,
    required: true,
    default: defaultProfilePic
  },
  email: {
    required: true,
    lowercase: true,
    trim: true,
    unique: true,
    type: Schema.Types.String,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  phone: {
    required: true,
    type: Schema.Types.String,
  },
  website: {
    required: true,
    type: Schema.Types.String,
  },
  role: {
    required: true,
    type: Schema.Types.String,
  },
  address: {
    type: AddressSchema
  },
  company: {
    type: CompanySchema
  },
  tokens: [{
    token: {
        type: String,
        required: true
    }
  }]
});

UserSchema.methods.generateAuthToken = async function() {
  // Generate an auth token for the user
  const user = this
  const token = jwt.sign({ _id: user._id }, jwtKey)
  user.tokens = user.tokens.concat({ token })
  await user.save()
  return token
}

UserSchema.statics.findByCredentials = async (username, password) => {
  // Search for a user by email and password.
  const user = await User.findOne({ username } )
  if (!user) {
      throw new Error('Invalid login credentials');s
  }
  const isPasswordCorrect = await bcrypt.compare(password, user.password)
  if (!isPasswordCorrect) {
      throw new Error('Invalid login credentials');
  }
  return user;
}

const User = mongoose.model('User', UserSchema);

module.exports = User;
