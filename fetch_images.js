const https = require('https');
const fs = require('fs');

const queries = [
  "Chocolate bar", "Wafer", "White chocolate", "Nutella", 
  "Potato chip", "Tortilla chip", "Pretzel", "Popcorn", 
  "Oreo", "Cracker (food)", "Granola bar",
  "Coca-Cola", "Sprite (drink)", "Bottled water", "Mineral water", "Juice", "Red Bull", "Iced coffee", "Ayran",
  "Ice cream cone", "Popsicle", "Ice cream sandwich", "Ice cream",
  "Chewing gum", "Gummy bear", "Lollipop", "Mint (candy)",
  "Hazelnut", "Roasted chickpea", "Sunflower seed", "Pistachio", "Almond",
  "Toast sandwich", "Simit", "Börek",
  "Lighter", "AA battery", "Candle", "Wet wipe"
];

async function getWikiImage(query) {
  return new Promise((resolve) => {
    const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrlimit=1&gsrsearch=${encodeURIComponent(query)}&prop=pageimages&format=json&pithumbsize=280`;
    const options = {
      headers: { 'User-Agent': 'Vizz/1.0 (test@example.com)' }
    };
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
          } else {
            resolve(null);
          }
        } catch(e) { resolve(null); }
      });
    });
  });
}

async function main() {
  const results = {};
  for(const q of queries) {
    const img = await getWikiImage(q);
    results[q] = img;
  }
  fs.writeFileSync('wiki_images.json', JSON.stringify(results, null, 2));
  console.log("Done");
}
main();
