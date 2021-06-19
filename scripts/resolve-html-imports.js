#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const htmlFiles = [
  path.resolve('dist/index.html'),
  path.resolve('dist/notes.html'),
  ...fs
    .readdirSync(path.resolve('dist/notes'), { withFileTypes: true })
    .reduce((files, file) => {
      if (path.extname(file.name) === '.html') {
        files.push(path.resolve(`dist/notes/${file.name}`));
      }
      return files;
    }, []),
];

function resolveImports(html) {
  const firstImport = html.match(/<link rel="import" href="(.*?)" \/>/);

  if (!firstImport) {
    return html;
  }

  const firstImportContent = fs.readFileSync(
    path.resolve('dist/', firstImport[1])
  );

  html = html.replace(firstImport[0], firstImportContent);
  return resolveImports(html);
}

for (let i = 0; i < htmlFiles.length; i++) {
  const html = fs.readFileSync(htmlFiles[i]).toString();
  const resolvedHtml = resolveImports(html);
  fs.writeFileSync(htmlFiles[i], resolvedHtml);
}

console.log('\x1b[35m', '[Tysite] Resolved HTML imports', '\x1b[0m');
