// remove_empty_verses.js
// Usage: node remove_empty_verses.js path/to/hymns.json
const fs = require('fs');
const path = require('path');

const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Usage: node remove_empty_verses.js path/to/hymns.json');
  process.exit(1);
}

const absPath = path.resolve(inputPath);
if (!fs.existsSync(absPath)) {
  console.error('File not found:', absPath);
  process.exit(1);
}

try {
  const raw = fs.readFileSync(absPath, 'utf8');
  const data = JSON.parse(raw);

  if (!Array.isArray(data)) {
    console.error('Expected a JSON array at the root.');
    process.exit(1);
  }

  // Backup original
  const backupPath = absPath + '.backup.' + Date.now() + '.json';
  fs.copyFileSync(absPath, backupPath);
  console.log('Backup created at:', backupPath);

  // Filter array: keep items where verses is an array with length > 0
  const filtered = data.filter(item => {
    return Array.isArray(item && item.verses) ? (item.verses.length > 0 ) : false;
  });

  const outPath = path.join(path.dirname(absPath), 'CLEANED_' + path.basename(absPath));
  fs.writeFileSync(outPath, JSON.stringify(filtered, null, 2), 'utf8');
  console.log(`Done. ${data.length - filtered.length} items removed. Cleaned file: ${outPath}`);
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
