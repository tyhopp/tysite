#!/usr/bin/env node

const AWS = require('aws-sdk');

const {
  AWS_ACCESS_KEY,
  AWS_SECRET_ACCESS_KEY,
  AWS_CONTENT_BUCKET,
  UPLOAD_TO_S3,
} = process.env;

/**
 * A lambda function to upload content files to S3.
 */
exports.handler = async (event) => {
  // Ensure credentials are passed
  if (
    !event.headers['x-upload-to-s3'] ||
    event.headers['x-upload-to-s3'] !== UPLOAD_TO_S3
  ) {
    return {
      statusCode: 401,
      body: 'Invalid Credentials',
    };
  }

  // Parse method and take appropriate action
  switch (event.httpMethod) {
    case 'POST':
    case 'PUT':
      // Configure S3
      AWS.config.update({
        accessKeyId: AWS_ACCESS_KEY,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      });

      const s3 = new AWS.S3();
      const title = exec(/title:.*\/(.*?)\n/, event.body)[1];
      const slug = exec(/slug:.*\/(.*?)\n/, event.body)[1];

      s3.putObject(
        { Bucket: AWS_CONTENT_BUCKET, Key: slug, Body: event.body },
        (error) => {
          if (error) {
            return {
              statusCode: 500,
              body: 'Internal Server Error',
            };
          }

          return {
            statusCode: 200,
            body: `Success, published ${title}`,
          };
        }
      );
    default:
      return {
        statusCode: 405,
        body: 'Method Not Allowed',
      };
  }
};
