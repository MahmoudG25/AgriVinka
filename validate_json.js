const fs = require('fs');
try {
  const data = fs.readFileSync('./src/data/courses.json', 'utf8');
  JSON.parse(data);
  console.log('Valid JSON');
} catch (e) {
  console.log('Error:', e.message);
  // Extract position if available
  const match = e.message.match(/position (\d+)/);
  if (match) {
    const pos = parseInt(match[1]);
    const lines = data.substring(0, pos).split('\n');
    console.log('Approximate Line:', lines.length);
    console.log('Approximate Column:', lines[lines.length - 1].length);
  }
}
