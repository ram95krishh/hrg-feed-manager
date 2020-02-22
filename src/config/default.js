const Joi = require('joi');

require('dotenv').config();

// Define validation for all the environment variables
const envVarsSchema = Joi.object({
  APP_URL_HOST: Joi.string()
    .required(),
  MONGO_CONNECTION_STRING: Joi.string().required(),
  NODE_ENV: Joi.string()
    .allow(['development', 'production'])
    .default('development'),
  NODE_CONFIG_ENV: Joi.string()
    .allow(['dev', 'qa', 'uat', 'prod'])
    .default('dev'),
  PORT: Joi.number().default(7600),
  USERS_URL: Joi.string().uri().required(),
  POSTS_URL: Joi.string().uri().required(),
  COMMENTS_URL: Joi.string().uri().required(),
  JWT_KEY: Joi.string().required(),
  S3_BUCKET_NAME: Joi.string().required(),
  AWS_ACCESS_KEY_ID: Joi.string().required(),
  AWS_SECRET_KEY: Joi.string().required(),
  DEFAULT_PROFILE_PIC: Joi.string().uri().required(),
  S3_BASE_URL: Joi.string().uri().required()
})
  .unknown()
  .required();

const { error, value: env } = Joi.validate(process.env, envVarsSchema);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  MongoDbConnectionString: env.MONGO_CONNECTION_STRING,
  env: env.NODE_CONFIG_ENV.trim(),
  logPrefix: `HRG Feed Manager Service :: ${env.NODE_CONFIG_ENV} :: `,
  port: env.PORT,
  usersUrl: env.USERS_URL,
  postsUrl: env.POSTS_URL,
  commentsUrl: env.COMMENTS_URL,
  jwtKey: env.JWT_KEY,
  s3BucketName: env.S3_BUCKET_NAME,
  awsAccessKey: env.AWS_ACCESS_KEY_ID,
  awsSecret: env.AWS_SECRET_KEY,
  defaultProfilePic: env.DEFAULT_PROFILE_PIC,
  s3BaseUrl: env.S3_BASE_URL
};

module.exports = config;
