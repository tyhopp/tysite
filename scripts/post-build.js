#!/usr/bin/env node

const path = require('path');
const { execSync } = require('child_process');

const postBuildScripts = [
  'scripts/resolve-css-imports.js',
  'scripts/resolve-html-imports.js',
  'scripts/highlight-syntax.js',
  'scripts/generate-rss.js',
  'scripts/generate-sitemap.js',
];

for (let i = 0; i < postBuildScripts.length; i++) {
  execSync(`node ${postBuildScripts[i]}`, {
    stdio: [0, 1, 2],
    cwd: path.resolve(''),
  });
}
