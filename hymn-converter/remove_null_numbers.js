// remove_null_numbers.js
// Usage: node remove_null_numbers.js path/to/hymns.json

const fs = require('fs');
const path = require('path');

const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Usage: node remove_null_numbers.js path/to/hymns.json');
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

  // Filter array: keep only items where number is NOT null
  const filtered = data.filter(item => item.number !== null && item.number !== undefined);

  const outPath = path.join(path.dirname(absPath), 'CLEANED_' + path.basename(absPath));
  fs.writeFileSync(outPath, JSON.stringify(filtered, null, 2), 'utf8');

  console.log(`Done. ${data.length - filtered.length} items removed.`);
  console.log('Cleaned file saved as:', outPath);
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
