#!/usr/bin/env node

// Get env vars from .env
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');

const {
  AWS_ACCESS_KEY,
  AWS_SECRET_ACCESS_KEY,
  AWS_CONTENT_BUCKET,
} = process.env;

// Configure S3
AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

// Ensure content/notes directory exists
if (!fs.existsSync(path.resolve('content/notes'))) {
  fs.mkdirSync(path.resolve('content/notes'), { recursive: true });
}

// List and write content bucket items to file system
s3.listObjectsV2({ Bucket: AWS_CONTENT_BUCKET }, (error, data) => {
  if (error) {
    console.error(error);
    return;
  }

  const content = data.Contents || [];

  content.forEach(({ Key }) => {
    s3.getObject({ Bucket: AWS_CONTENT_BUCKET, Key }, (error, file) => {
      if (error) {
        console.error(error);
        return;
      }
      const fileContent = file.Body.toString();
      fs.writeFileSync(path.resolve(`content/notes/${Key}`), fileContent);
    });
  });
});
