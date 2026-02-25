const fs = require('fs');
try {
  const courses = JSON.parse(fs.readFileSync('./src/data/courses.json', 'utf8'));
  console.log(JSON.stringify(courses.map(c => ({ id: c.id, title: c.title })), null, 2));
} catch (e) {
  console.error('Error parsing courses.json:', e.message);
}
