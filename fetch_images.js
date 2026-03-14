const https = require('https');

async function searchUnsplash(query) {
  return new Promise((resolve) => {
    https.get(`https://unsplash.com/s/photos/${encodeURIComponent(query)}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const match = data.match(/https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9\-]+[^"]+/g);
        if (match) {
          const urls = match.filter(u => u.includes('w=500') || u.includes('auto=format')).map(u => u.split('?')[0] + '?w=500&h=500&fit=crop');
          resolve(urls[0] || null);
        } else {
          resolve(null);
        }
      });
    });
  });
}

async function run() {
  console.log('Heineken:', await searchUnsplash('heineken'));
  console.log('Primus beer:', await searchUnsplash('beer bottle'));
  console.log('Jack Daniels:', await searchUnsplash('jack daniels'));
}
run();
