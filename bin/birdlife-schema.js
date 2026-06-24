#!/usr/bin/env node
/**
 * BirdLife Schema CLI
 *
 * Usage:
 *   birdlife-schema validate <entity> <file>
 *   birdlife-schema validate <entity> <file> --format=json
 *   birdlife-schema generate:jsonschema
 *   birdlife-schema list
 */

const fs = require('fs');
const path = require('path');

// Find package root (works when installed globally or locally)
function findPackageRoot() {
  let dir = __dirname;
  while (dir !== '/') {
    if (fs.existsSync(path.join(dir, 'package.json'))) {
      const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
      if (pkg.name === 'birdlife-schema') return dir;
    }
    dir = path.dirname(dir);
  }
  return path.join(__dirname, '..');
}

const ROOT = findPackageRoot();
const AVRO_DIR = path.join(ROOT, 'avro');
const JSON_SCHEMA_DIR = path.join(ROOT, 'json-schema');
const ENTITIES = ['taxon', 'observation', 'location', 'observer', 'protocol', 'evidence'];

const args = process.argv.slice(2);
const command = args[0];

function printUsage() {
  console.log(`
BirdLife Schema CLI

Usage:
  birdlife-schema validate <entity> <file>   Validate JSON file against schema
  birdlife-schema validate <entity> <file> --json   Output as JSON
  birdlife-schema generate                   Generate JSON Schema from Avro
  birdlife-schema list                       List available entities

Entities: ${ENTITIES.join(', ')}

Examples:
  birdlife-schema validate taxon my-taxon.json
  birdlife-schema validate observation data/*.json
  birdlife-schema list
`);
}

function validateFile(entity, filePath, outputJson = false) {
  let avro;
  try {
    avro = require('avsc');
  } catch (e) {
    console.error('Error: avsc package required. Run: npm install avsc');
    process.exit(1);
  }

  const schemaPath = path.join(AVRO_DIR, `${entity}.avsc`);

  if (!fs.existsSync(schemaPath)) {
    console.error(`Error: Unknown entity '${entity}'`);
    console.error(`Available: ${ENTITIES.join(', ')}`);
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }

  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  const type = avro.Type.forSchema(schema);

  let data;
  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error(`Error: Invalid JSON in ${filePath}`);
    process.exit(1);
  }

  // Handle array of records or single record
  const records = Array.isArray(data) ? data : [data];
  const results = { valid: [], invalid: [] };

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const errors = [];

    const isValid = type.isValid(record, {
      errorHook: (path, any, type) => {
        errors.push({
          path: path.join('.') || '(root)',
          message: `expected ${type}`,
          value: any
        });
      }
    });

    // Check extension keys format
    if (record.extensions && typeof record.extensions === 'object') {
      const pattern = /^[a-z][a-z0-9_]*\.[a-zA-Z][a-zA-Z0-9_]*$/;
      for (const key of Object.keys(record.extensions)) {
        if (!pattern.test(key)) {
          errors.push({
            path: `extensions.${key}`,
            message: 'invalid extension key format (expected: namespace.fieldName)',
            value: key
          });
        }
      }
    }

    if (isValid && errors.length === 0) {
      results.valid.push({ index: i, id: record[`${entity}ID`] || record.occurrenceID || i });
    } else {
      results.invalid.push({ index: i, id: record[`${entity}ID`] || record.occurrenceID || i, errors });
    }
  }

  if (outputJson) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    console.log(`\nValidating ${filePath} against ${entity} schema...\n`);

    if (results.valid.length > 0) {
      console.log(`✓ Valid: ${results.valid.length} record(s)`);
    }

    if (results.invalid.length > 0) {
      console.log(`✗ Invalid: ${results.invalid.length} record(s)\n`);
      for (const item of results.invalid) {
        console.log(`  Record ${item.index}${item.id ? ` (${item.id})` : ''}:`);
        for (const err of item.errors) {
          console.log(`    - ${err.path}: ${err.message}`);
        }
      }
    }

    console.log('');
  }

  process.exit(results.invalid.length > 0 ? 1 : 0);
}

function generateJsonSchema() {
  require('../tools/generate-json-schema.js');
}

function listEntities() {
  console.log('\nAvailable entities:\n');
  for (const entity of ENTITIES) {
    const schemaPath = path.join(AVRO_DIR, `${entity}.avsc`);
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    console.log(`  ${entity}`);
    console.log(`    ${schema.doc || 'No description'}\n`);
  }
}

// Main
switch (command) {
  case 'validate':
    const entity = args[1];
    const file = args[2];
    const jsonOutput = args.includes('--json');

    if (!entity || !file) {
      console.error('Error: Missing arguments');
      printUsage();
      process.exit(1);
    }
    validateFile(entity, file, jsonOutput);
    break;

  case 'generate':
    generateJsonSchema();
    break;

  case 'list':
    listEntities();
    break;

  case '--help':
  case '-h':
  case undefined:
    printUsage();
    break;

  default:
    console.error(`Unknown command: ${command}`);
    printUsage();
    process.exit(1);
}
