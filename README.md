# Tysite

The personal site of Ty Hopp. See it deployed [here](https://tyhopp.com).

## Usage

- `git checkout https://github.com/tyhopp/tysite.git`
- `cd tysite && npm i`
- `npm run start`

## Lambda functions

- [upload-to-s3](./functions/upload-to-s3/upload-to-s3.js), a lambda function that lets me write in [Bear](https://bear.app) and upload notes to S3

## Pre-build scripts

- [fetch-remote-content](./scripts/fetch-remote-content.js) pulls down notes from S3 into the file system prior to the build step

## Post-build scripts

- [post-build](./scripts/post-build.js) runs the following build scripts in a child process to keep the [package.json](./package.json) script commands clean:
  - [resolve-css-imports](./scripts/resolve-css-imports.js) resolves all CSS `@import` statements
  - [resolve-html-imports](./scripts/resolve-html-imports.js) resolves all HTML `<link rel="import" href="..." />` statements
  - [highlight-syntax](./scripts/highlight-syntax.js) uses [Prism](https://prismjs.com/) to highlight code block syntax
  - [generate-rss](./scripts/generate-rss.js) generates an Atom RSS feed
  - [generate-sitemap](./scripts/generate-sitemap.js) generates a sitemap

## Tools

- [PRPL](https://github.com/tyhopp/prpl), an HTML-based static site generator built concurrently with this site

## Notes

- This version of the site is a complete rewrite of [tysite-basework](https://github.com/tyhopp/tysite-basework), a prior version written with a completely different set of tools.
- The content for this site is stored in S3, so if you clone or fork this repo and run it, it may break. However, the source code can still be useful as a reference.
