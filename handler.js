'use strict';

const generateEPG = require('./src/generateEPG');

module.exports.generateEPG = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event,
    }),
  };

  generateEPG().then(function() {
    callback(null, response);
    console.log('UEEE!');
  });
};
