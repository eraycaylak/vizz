const https = require('https');
const fs = require('fs');

const queries = [
  "Energy drink", "Ice pop"
];

async function getWikiImage(query) {
  return new Promise((resolve) => {
    const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrlimit=1&gsrsearch=${encodeURIComponent(query)}&prop=pageimages&format=json&pithumbsize=280`;
    const options = { headers: { 'User-Agent': 'Vizz/1.0 (test@example.com)' } };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query.pages;
          const pageId = Object.keys(pages)[0];
          if (pageId && pageId !== '-1' && pages[pageId].thumbnail) {
            resolve(pages[pageId].thumbnail.source);
          } else { resolve(null); }
        } catch(e) { resolve(null); }
      });
    });
  });
}
async function main() {
  const results = {};
  for(const q of queries) { results[q] = await getWikiImage(q); }
  console.log(JSON.stringify(results, null, 2));
}
main();
