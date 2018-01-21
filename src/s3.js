'use strict';

const AWS = require('aws-sdk');

const uploadFile = function (data, resolve) {
    var base64data = new Buffer(data, 'utf8');
    
    var s3 = new AWS.S3();
    s3.putObject({
      Bucket: 'jmlopezdona',
      Key: 'iptv/guia.xml',
      Body: base64data,
      ACL: 'public-read'
    },function (resp) {
      console.log(arguments);
      console.log('Successfully uploaded package.');
      resolve();
    });
};

module.exports = {
  uploadFile: uploadFile
};
