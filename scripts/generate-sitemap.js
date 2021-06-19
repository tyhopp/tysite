#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { parse } = require('prpl');

const notes = fs.readdirSync(path.resolve('content/notes'));
const contentFiles = notes.map((note) => path.resolve(`content/notes/${note}`));

let urls = '';

const urlTemplate = `
<url>
  <loc>[url]</loc>
  <lastmod>[date]</lastmod>
  <priority>0.7</priority>
</url>
`;

contentFiles.forEach((file) => {
  let content = fs.readFileSync(file).toString();

  const contentData = parse(content);
  const { slug } = contentData;
  const url = `https://tyhopp.com/${slug}`;
  const date = contentData['raw-date'];

  const parsedContentData = {
    url,
    date,
  };

  let urlTemplateInstance = String(urlTemplate);

  for (const key in parsedContentData) {
    if (urlTemplateInstance.includes(`[${key}]`)) {
      const regex = new RegExp(`\\[${key}\\]`, 'g');
      urlTemplateInstance = urlTemplateInstance.replace(
        regex,
        parsedContentData[key]
      );
    }
  }

  urls = `${urls}${urlTemplateInstance}`;
});

const now = new Date();
const year = now.getFullYear();
const month = now.getMonth() + 1;
const day = now.getDate();
const w3cMonth = month < 10 ? `0${month}` : month;
const updated = `${year}-${w3cMonth}-${day}`;

const sitemap = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://tyhopp.com</loc>
    <lastmod>${updated}</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://tyhopp.com/notes</loc>
    <lastmod>${updated}</lastmod>
    <priority>1.0</priority>
  </url>
  ${urls}
</urlset>`;

fs.writeFileSync(path.resolve('dist/sitemap.xml'), sitemap);

console.log('\x1b[35m', '[Tysite] Generated sitemap', '\x1b[0m');
