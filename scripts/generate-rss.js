const fs = require('fs');
const path = require('path');
const { ensure, parse } = require('prpl');

const notes = fs.readdirSync(path.resolve('content/notes'));
const contentFiles = notes.map((note) => path.resolve(`content/notes/${note}`));

let entries = '';

const entryTemplate = `
<entry>
  <id>[url]</id>
  <published>[date]</published>
  <updated>[date]</updated>
  <title>[title]</title>
  [interpolatedCategories]
  <link rel="alternate" type="text/html" href="[url]"></link>
  <author>
    <name>Ty Hopp</name>
  </author>
  <summary>[description]</summary>
  <content type="text/html" src="[url]"></content>
</entry>
`;

contentFiles.forEach((file) => {
  let content = fs.readFileSync(file).toString();

  const contentData = parse(content);
  const { title, slug, description, categories, body } = contentData;

  const rawDate = new Date(contentData['raw-date']);
  const date = rawDate.toISOString();

  const url = `https://tyhopp.com/${slug}`;

  const extractedCategories = [
    ...categories.matchAll(/<span>(.*?)<\/span>/g),
  ].map((categoryMatch) => categoryMatch[1]);
  const interpolatedCategories = extractedCategories.reduce((acc, curr) => {
    acc = `${acc}<category term="${curr}"/>`;
    return acc;
  }, '');

  const parsedContentData = {
    url,
    date,
    title,
    interpolatedCategories,
    description,
    body,
  };

  let entryInstance = String(entryTemplate);

  for (const key in parsedContentData) {
    if (entryInstance.includes(`[${key}]`)) {
      const regex = new RegExp(`\\[${key}\\]`, 'g');
      entryInstance = entryInstance.replace(regex, parsedContentData[key]);
    }
  }

  entries = `${entries}${entryInstance}`;
});

const now = new Date();
const updated = now.toISOString();

const atomFeed = `
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en">
  <title>Ty Hopp</title>
  <icon>https://tyhopp.com/assets/meta/favicon-32.png</icon>
  <link type="text/html" href="https://tyhopp.com/" rel="alternate"/>
  <updated>${updated}</updated>
  <author>
    <name>Ty Hopp</name>
  </author>
  <id>https://tyhopp.com/rss/atom.xml</id>
  ${entries}
</feed>
`;

ensure('dist/rss');

fs.writeFileSync(path.resolve('dist/rss/atom.xml'), atomFeed);
