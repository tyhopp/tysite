#!/usr/bin/env node

// Get env vars from .env
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');

const {
  TYSITE_AWS_ACCESS_KEY,
  TYSITE_AWS_SECRET_ACCESS_KEY,
  TYSITE_AWS_CONTENT_BUCKET,
  TYSITE_AWS_CONTENT_BUCKET_REGION,
} = process.env;

// Configure S3
AWS.config.update({
  accessKeyId: TYSITE_AWS_ACCESS_KEY,
  secretAccessKey: TYSITE_AWS_SECRET_ACCESS_KEY,
  region: TYSITE_AWS_CONTENT_BUCKET_REGION,
});

const s3 = new AWS.S3();

// Ensure content/notes directory exists
if (!fs.existsSync(path.resolve('content/notes'))) {
  fs.mkdirSync(path.resolve('content/notes'), { recursive: true });
}

// List and write content bucket items to file system
s3.listObjectsV2({ Bucket: TYSITE_AWS_CONTENT_BUCKET }, (error, data) => {
  if (error) {
    console.error(error);
    return;
  }

  const content = data.Contents || [];

  content.forEach(({ Key }) => {
    s3.getObject({ Bucket: TYSITE_AWS_CONTENT_BUCKET, Key }, (error, file) => {
      if (error) {
        console.error(error);
        return;
      }
      const fileContent = file.Body.toString();
      fs.writeFileSync(
        path.resolve(`content/notes/${Key}.md`),
        JSON.parse(fileContent)
      );
    });
  });
});
