const AWS = require('aws-sdk');
const config = require('config');

const awsAccessKey = config.get('awsAccessKey');
const awsSecret = config.get('awsSecret');

const s3 = new AWS.S3({
    accessKeyId: awsAccessKey,
    secretAccessKey: awsSecret
});

module.exports = s3;