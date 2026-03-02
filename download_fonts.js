const fs = require('fs');
const https = require('https');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: { 'User-Agent': 'Node.js' }
    }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return download(response.headers.location, dest).then(resolve).catch(reject);
      }
      const file = fs.createWriteStream(dest);
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function run() {
  console.log('Downloading fonts...');
  try {
    await download('https://github.com/googlefonts/amiri/raw/main/fonts/ttf/Amiri-Regular.ttf', 'e:/web/Namaa Academy/public/fonts/Amiri-Regular.ttf');
    await download('https://github.com/googlefonts/amiri/raw/main/fonts/ttf/Amiri-Bold.ttf', 'e:/web/Namaa Academy/public/fonts/Amiri-Bold.ttf');
    console.log('Done');
  } catch (err) {
    console.error(err);
  }
}
run();
