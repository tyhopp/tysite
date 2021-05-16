# upload-to-s3

A lambda function to upload content files to S3.

### Usage

1. Ensure [Netlify CLI](https://github.com/netlify/cli) is installed on your machine.
2. `netlify dev` to run the Netlify build locally
3. To test the function locally, run:

```
npx --package=netlify-cli netlify functions:invoke --name upload-to-s3 --no-identity --payload '"<!--
title: Hello world!
slug: /notes/my-first-note
date: 2020-11-26
description: This is my first note
categories: Misc
-->

This is my first note
"'
```

### Resources

See [Netlify Dev Intro](https://github.com/netlify/cli/blob/master/docs/netlify-dev.md) for more information.

### Gotchas

If the project dies, it doesn't kill the port. Do so manually:

1. sudo lsof -i :8000
2. kill -9 PID

Netlify dev only supports POST invocations from the command line.

_Make sure you set the 'Content-Type': 'application/json' header on your request, otherwise AWS API Gateway may convert your payload to base64_.
