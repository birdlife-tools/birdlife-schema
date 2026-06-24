#!/usr/bin/env node
/**
 * Convert Avro schemas to JSON Schema
 *
 * Usage: node tools/generate-json-schema.js
 * Output: json-schema/*.json
 */

const fs = require('fs');
const path = require('path');

const avroDir = path.join(__dirname, '..', 'avro');
const outputDir = path.join(__dirname, '..', 'json-schema');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Track defined types for reuse
const definedTypes = {};

function avroToJsonSchema(avroType, definitions = {}) {
  // Handle null
  if (avroType === 'null') {
    return { type: 'null' };
  }

  // Handle primitives
  if (typeof avroType === 'string') {
    switch (avroType) {
      case 'string': return { type: 'string' };
      case 'int': return { type: 'integer' };
      case 'long': return { type: 'integer' };
      case 'float': return { type: 'number' };
      case 'double': return { type: 'number' };
      case 'boolean': return { type: 'boolean' };
      case 'bytes': return { type: 'string', contentEncoding: 'base64' };
      default:
        // Reference to named type
        if (definedTypes[avroType]) {
          return { $ref: `#/$defs/${avroType}` };
        }
        return { type: 'string' }; // fallback
    }
  }

  // Handle arrays (unions in Avro)
  if (Array.isArray(avroType)) {
    // Filter out null to determine if optional
    const nonNull = avroType.filter(t => t !== 'null');
    const hasNull = avroType.includes('null');

    if (nonNull.length === 1) {
      // Simple optional type
      const schema = avroToJsonSchema(nonNull[0], definitions);
      if (hasNull) {
        // Make it nullable using oneOf
        return { oneOf: [schema, { type: 'null' }] };
      }
      return schema;
    } else {
      // Multiple types union
      const schemas = nonNull.map(t => avroToJsonSchema(t, definitions));
      if (hasNull) schemas.push({ type: 'null' });
      return { oneOf: schemas };
    }
  }

  // Handle complex types
  if (typeof avroType === 'object') {
    switch (avroType.type) {
      case 'array':
        return {
          type: 'array',
          items: avroToJsonSchema(avroType.items, definitions)
        };

      case 'map':
        return {
          type: 'object',
          additionalProperties: avroToJsonSchema(avroType.values, definitions)
        };

      case 'enum':
        definedTypes[avroType.name] = true;
        const enumSchema = {
          type: 'string',
          enum: avroType.symbols
        };
        if (avroType.doc) enumSchema.description = avroType.doc;
        definitions[avroType.name] = enumSchema;
        return { $ref: `#/$defs/${avroType.name}` };

      case 'record':
        return convertRecord(avroType, definitions);

      default:
        return { type: 'string' }; // fallback
    }
  }

  return { type: 'string' }; // fallback
}

function convertRecord(avroSchema, definitions = {}) {
  const properties = {};
  const required = [];

  for (const field of avroSchema.fields) {
    const isOptional = Array.isArray(field.type) && field.type.includes('null');

    let fieldSchema;
    if (isOptional) {
      // For optional fields, get the non-null type
      const nonNull = field.type.filter(t => t !== 'null');
      if (nonNull.length === 1) {
        fieldSchema = avroToJsonSchema(nonNull[0], definitions);
      } else {
        fieldSchema = avroToJsonSchema(field.type, definitions);
      }
    } else {
      fieldSchema = avroToJsonSchema(field.type, definitions);
      required.push(field.name);
    }

    if (field.doc) {
      fieldSchema.description = field.doc;
    }

    properties[field.name] = fieldSchema;
  }

  const schema = {
    type: 'object',
    properties,
    required: required.length > 0 ? required : undefined,
    additionalProperties: false
  };

  if (avroSchema.doc) {
    schema.description = avroSchema.doc;
  }

  return schema;
}

function convertAvroFile(avroPath, outputPath) {
  const avroSchema = JSON.parse(fs.readFileSync(avroPath, 'utf8'));
  const definitions = {};

  // Reset defined types for each file
  Object.keys(definedTypes).forEach(k => delete definedTypes[k]);

  const jsonSchema = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: `https://birdlife.tech/schema/${avroSchema.name.toLowerCase()}.json`,
    title: avroSchema.name,
    ...convertRecord(avroSchema, definitions)
  };

  // Add definitions if any enums were created
  if (Object.keys(definitions).length > 0) {
    jsonSchema.$defs = definitions;
  }

  fs.writeFileSync(outputPath, JSON.stringify(jsonSchema, null, 2) + '\n');
}

// Main
console.log('Generating JSON Schema from Avro...\n');

const avroFiles = fs.readdirSync(avroDir).filter(f => f.endsWith('.avsc'));

for (const file of avroFiles) {
  const baseName = file.replace('.avsc', '');
  const avroPath = path.join(avroDir, file);
  const outputPath = path.join(outputDir, `${baseName}.json`);

  try {
    convertAvroFile(avroPath, outputPath);
    console.log(`  ✓ ${baseName}.json`);
  } catch (e) {
    console.log(`  ✗ ${baseName}: ${e.message}`);
    process.exit(1);
  }
}

console.log(`\nGenerated ${avroFiles.length} JSON Schema files in json-schema/`);
