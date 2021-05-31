# Tysite

The personal site of Ty Hopp. See it deployed [here](https://tyhopp.com).

## Usage

- `git checkout https://github.com/tyhopp/tysite.git`
- `cd tysite && npm i`
- `npm run start`

## Lambda functions

- [upload-to-s3](./functions/upload-to-s3/upload-to-s3.js), a lambda function that lets me write in [Bear](https://bear.app) and upload notes to S3

## Scripts

- [fetch-remote-content](./scripts/fetch-remote-content.js), a script that pulls down notes from S3 into the file system
- [generate-rss](./scripts/generate-rss.js), a script that generates an Atom RSS feed at build time
- [highlight-syntax](./scripts/highlight-syntax.js), a script uses [Prism](https://prismjs.com/) to highlight code block syntax at build time
- [resolve-css-imports](./scripts/resolve-css-imports.js), a script that resolves all CSS `@import` statements at build time

## Tools

- [PRPL](https://github.com/tyhopp/prpl), an HTML-based static site generator built concurrently with this site

## Notes

- This version of the site is a complete rewrite of [tysite-basework](https://github.com/tyhopp/tysite-basework), a prior version written with a completely different set of tools.
- The content for this site is stored in S3, so if you clone or fork this repo and run it, it may break. However, the source code can still be useful as a reference.
