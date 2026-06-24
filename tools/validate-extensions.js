#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const examplesDir = path.join(__dirname, '..', 'examples');
const pattern = /^[a-z][a-z0-9_]*\.[a-zA-Z][a-zA-Z0-9_]*$/;
const files = fs.readdirSync(examplesDir).filter(f => f.endsWith('.json'));

let failed = false;

console.log('Checking extension key format...\n');

for (const file of files) {
  const filePath = path.join(examplesDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  let fileValid = true;

  if (data.extensions && typeof data.extensions === 'object' && data.extensions !== null) {
    for (const key of Object.keys(data.extensions)) {
      if (!pattern.test(key)) {
        console.log(`  ✗ ${file}: invalid key "${key}"`);
        fileValid = false;
        failed = true;
      }
    }
  }

  if (fileValid) {
    console.log(`  ✓ ${file}`);
  }
}

console.log('');
process.exit(failed ? 1 : 0);
