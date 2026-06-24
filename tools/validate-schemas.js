#!/usr/bin/env node
const avro = require('avsc');
const fs = require('fs');
const path = require('path');

const avroDir = path.join(__dirname, '..', 'avro');
const files = fs.readdirSync(avroDir).filter(f => f.endsWith('.avsc'));

let failed = false;

console.log('Validating Avro schemas...\n');

for (const file of files) {
  const filePath = path.join(avroDir, file);
  try {
    const schema = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    avro.Type.forSchema(schema);
    console.log(`  ✓ ${file}`);
  } catch (e) {
    console.log(`  ✗ ${file}: ${e.message}`);
    failed = true;
  }
}

console.log('');
process.exit(failed ? 1 : 0);
