const multer = require('multer');
const multerS3 = require('multer-s3');
const config = require('config');

const s3 = require('../lib/s3');
const bucketName = config.get('s3BucketName');
const s3BaseUrl = config.get('s3BaseUrl');

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true)
  } else {
      cb(null, false)
  }
}

const multerS3Config = multerS3({
  s3: s3,
  bucket: bucketName,
  metadata: function (req, file, cb) {
    cb(null, {fieldName: file.fieldname});
  },
  key: function (req, file, cb) {
    const userFolder = `User${req.user.id}/`;
    const dateString = Date.now().toString();
    const ext = file.mimetype === 'image/jpeg' ? '.jpeg' : '.png'
    const fileName = userFolder + dateString + ext;
    req.fileUrl = s3BaseUrl + fileName;
    cb(null, fileName)
  }
})

const upload = multer({
  storage: multerS3Config,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 3 // 3MB max size
  }
})

module.exports = upload;