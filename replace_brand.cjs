const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const searchPaths = [
  path.join(rootDir, 'src'),
  path.join(rootDir, 'index.html'),
  path.join(rootDir, 'README.md')
];

// Replaces text but explicitly avoids "Namaa-Academy/" and similar paths for Cloudinary.
// We'll replace occurrences of "Namaa Academy", "أكاديمية نماء", "نماء أكاديمي", "متدرب نماء"
// "Namaa" (standalone or with spaces, but not "Namaa-Academy" or "NamaaSans" etc unless UI)

const replacements = [
  { regex: /Namaa Academy/g, replace: 'AgriVinka' },
  { regex: /أكاديمية نماء/g, replace: 'AgriVinka' },
  { regex: /نماء أكاديمي/g, replace: 'AgriVinka' },
  { regex: /متدرب نماء/g, replace: 'AgriVinka Trainee' },
  { regex: /نماء/g, replace: 'AgriVinka' },
  { regex: /نَماء/g, replace: 'AgriVinka' },
  // For 'Namaa' we want to avoid replacing 'Namaa-Academy', 'NamaaSans', 'NamaaArabic', 'NamaaSerif'
  // So we match 'Namaa' not followed by '-', 'Sans', 'Arabic', 'Serif'
  { regex: /Namaa(?![A-Za-z\-])/g, replace: 'AgriVinka' },
  // And to handle index.html title and url
  { regex: /namaaacademy\.com/g, replace: 'agrivinka.com' }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else {
      if (fullPath.match(/\.(js|jsx|html|md)$/)) {
        processFile(fullPath);
      }
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let newContent = content;

  for (const rule of replacements) {
    newContent = newContent.replace(rule.regex, rule.replace);
  }

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log('Updated:', filePath);
  }
}

for (const p of searchPaths) {
  if (fs.existsSync(p)) {
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      processDirectory(p);
    } else {
      processFile(p);
    }
  }
}

console.log('Replacement complete.');
