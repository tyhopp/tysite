#!/usr/bin/env node

const AWS = require('aws-sdk');
const fetch = require('node-fetch');

const {
  TYSITE_AWS_ACCESS_KEY,
  TYSITE_AWS_SECRET_ACCESS_KEY,
  TYSITE_AWS_CONTENT_BUCKET,
  TYSITE_AWS_CONTENT_BUCKET_REGION,
  TYSITE_UPLOAD_TO_S3,
  TYSITE_CONTENT_PUBLISH_HOOK,
} = process.env;

/**
 * A lambda function to upload content files to S3.
 */
exports.handler = async (event) => {
  // Ensure credentials are passed
  if (
    !event.headers['x-upload-to-s3'] ||
    event.headers['x-upload-to-s3'] !== TYSITE_UPLOAD_TO_S3
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
      try {
        AWS.config.update({
          accessKeyId: TYSITE_AWS_ACCESS_KEY,
          secretAccessKey: TYSITE_AWS_SECRET_ACCESS_KEY,
          region: TYSITE_AWS_CONTENT_BUCKET_REGION,
        });

        const parsedEventBody = JSON.parse(event.body);

        const s3 = new AWS.S3();
        const title = /title:\s(.*?)\n/.exec(parsedEventBody)[1];
        const slug = /slug:\s(.*?)\n/.exec(parsedEventBody)[1];

        // Upload to S3
        const response = await s3
          .putObject({
            Bucket: TYSITE_AWS_CONTENT_BUCKET,
            Key: slug,
            Body: parsedEventBody,
          })
          .promise();

        if (!response) {
          return {
            statusCode: 500,
            body: 'Internal Server Error',
          };
        }

        // Trigger site rebuild
        await fetch(TYSITE_CONTENT_PUBLISH_HOOK, { method: 'POST' });

        return {
          statusCode: 200,
          body: `Success, published ${title}`,
        };
      } catch (error) {
        return {
          statusCode: 200,
          body: `Failed to upload file to S3\n${error}`,
        };
      }
    default:
      return {
        statusCode: 405,
        body: 'Method Not Allowed',
      };
  }
};
