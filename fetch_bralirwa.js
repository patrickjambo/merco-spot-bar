const https = require('https');

https.get('https://www.bralirwa.co.rw/brands', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const urls = data.match(/https:\/\/[^"']+\.(png|jpg|jpeg)/g);
    console.log(urls ? urls.slice(0, 10) : 'No URLs found');
  });
}).on('error', console.error);
