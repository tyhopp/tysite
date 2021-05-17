const fs = require('fs');
const path = require('path');

// Set up prism
const prism = require('prismjs');
const loadLanguages = require('prismjs/components/');

let loadedLanguages = [];

const notes = fs.readdirSync(path.resolve('dist/notes'));
const htmlFiles = notes
  .filter((note) => note.includes('html'))
  .map((note) => path.resolve(`dist/notes/${note}`));
htmlFiles.forEach((file) => {
  let html = fs.readFileSync(file).toString();

  console.log(html);

  const codeBlocks = [
    ...html.matchAll(/<code class="language-(.*?)">(.*?)<\/code>/gs),
  ];

  codeBlocks?.forEach(([block, language, code]) => {
    // Load language in prism if it is not already
    if (!loadedLanguages.includes(language)) {
      loadLanguages(language);
      loadedLanguages.push(language);
    }

    // Highlight code
    const highlightedCode = prism.highlight(
      code,
      prism.languages[language],
      language
    );

    // Reconstruct block
    const reconstructedBlock = `<code class="language-${language}">${highlightedCode}</code>`;

    // Replace block in original html
    html = html.replace(block, reconstructedBlock);
  });

  fs.writeFileSync(file, html);
});
