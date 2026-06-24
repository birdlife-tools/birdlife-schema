#!/usr/bin/env node
const avro = require('avsc');
const fs = require('fs');
const path = require('path');

const avroDir = path.join(__dirname, '..', 'avro');
const examplesDir = path.join(__dirname, '..', 'examples');
const entities = ['taxon', 'observation', 'location', 'observer', 'protocol', 'evidence'];

let failed = false;

console.log('Validating examples against schemas...\n');

for (const entity of entities) {
  const schemaPath = path.join(avroDir, `${entity}.avsc`);
  const examplePath = path.join(examplesDir, `${entity}.json`);

  if (!fs.existsSync(examplePath)) {
    console.log(`  - ${entity} (no example)`);
    continue;
  }

  try {
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    const data = JSON.parse(fs.readFileSync(examplePath, 'utf8'));
    const type = avro.Type.forSchema(schema);

    if (type.isValid(data)) {
      console.log(`  ✓ ${entity}`);
    } else {
      console.log(`  ✗ ${entity}`);
      type.isValid(data, {
        errorHook: (path, any, type) => {
          console.log(`    - ${path.join('.')}: expected ${type}`);
        }
      });
      failed = true;
    }
  } catch (e) {
    console.log(`  ✗ ${entity}: ${e.message}`);
    failed = true;
  }
}

console.log('');
process.exit(failed ? 1 : 0);
