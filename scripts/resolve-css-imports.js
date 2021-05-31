const fs = require('fs');
const path = require('path');

const entry = path.resolve('dist/styles/main.css');

let main = fs.readFileSync(entry).toString();

function resolveImports(main) {
  const firstImport = main.match(/@import\s'(.*?)';/);

  if (!firstImport) {
    return main;
  }

  const firstImportContent = fs.readFileSync(
    path.resolve('dist/styles/', firstImport[1])
  );

  main = main.replace(firstImport[0], firstImportContent);
  return resolveImports(main);
}

const resolvedMain = resolveImports(main);

fs.writeFileSync(path.resolve(entry), resolvedMain);

console.log('\x1b[35m', '[Tysite] Resolved CSS imports', '\x1b[0m');
