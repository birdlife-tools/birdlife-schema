# BirdLife Schema

Language-agnostic data contract schemas for the BirdLife open-source ecosystem.

[![npm version](https://img.shields.io/npm/v/birdlife-schema)](https://www.npmjs.com/package/birdlife-schema)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue)](LICENSE)
[![Matrix](https://img.shields.io/badge/Matrix-%23birdlife--schema-black?logo=matrix)](https://matrix.to/#/#birdlife-schema:matrix.org)

## Overview

This repository defines the canonical data shapes for bird observation and biodiversity data across all BirdLife community tools. Built on [Apache Avro](https://avro.apache.org/) for schema evolution and interoperability.

**Namespace:** `tech.birdlife.schema`

## Resolution API [![live](https://img.shields.io/badge/status-live-brightgreen)](https://birdlife.tech/docs)

Need deterministic IDs without running your own registry? Use the **[Resolution API](https://birdlife.tech/docs)**:

```bash
# Taxon → always same UUID for same scientific name
curl "https://birdlife.tech/api/v1/taxon/resolve?name=Erithacus+rubecula"

# Location → deduplicated by coordinates (~11m precision)
curl -X POST https://birdlife.tech/api/v1/location/resolve \
  -H "Content-Type: application/json" \
  -d '{"name": "Minsmere", "latitude": 52.2456, "longitude": 1.6234}'
```

All API responses are validated against this schema.

## Installation

```bash
# Install globally for CLI access
npm install -g birdlife-schema

# Or install locally in your project
npm install birdlife-schema
```

## CLI Usage

### Validate data against a schema

```bash
# Validate a single file
birdlife-schema validate taxon my-taxon.json

# Validate with JSON output (for CI/scripts)
birdlife-schema validate observation data.json --json
```

**Output:**
```
Validating my-taxon.json against taxon schema...

✓ Valid: 1 record(s)
```

**Error example:**
```
Validating bad-data.json against taxon schema...

✗ Invalid: 1 record(s)

  Record 0 (123):
    - slug: expected "string"
    - taxonRank: expected enum value
```

### List available entities

```bash
birdlife-schema list
```

### Generate JSON Schema from Avro

```bash
birdlife-schema generate
```

## Programmatic Usage (Node.js)

```javascript
const avro = require('avsc');
const fs = require('fs');

// Load the schema
const taxonSchema = require('birdlife-schema/avro/taxon.avsc');
const type = avro.Type.forSchema(taxonSchema);

// Validate data
const myData = {
  taxonID: "8f14e45f-ceea-467f-a8f8-5c8e1c8d0a3b",
  slug: "erithacus-rubecula",
  scientificName: "Erithacus rubecula",
  taxonRank: "SPECIES"
};

if (type.isValid(myData)) {
  console.log('Valid!');
} else {
  console.log('Invalid');
}
```

## JSON Schema (for web apps)

JSON Schema versions are auto-generated for use in web applications:

```javascript
// Use with any JSON Schema validator (ajv, etc.)
const taxonJsonSchema = require('birdlife-schema/json-schema/taxon.json');
```

## Core Entities (Tier 1)

| Entity | Description | Schema |
|--------|-------------|--------|
| Taxon | Species taxonomy (aligned with Darwin Core) | [avro](avro/taxon.avsc) / [json](json-schema/taxon.json) |
| Observation | Bird sighting occurrence record | [avro](avro/observation.avsc) / [json](json-schema/observation.json) |
| Location | Geographic location data | [avro](avro/location.avsc) / [json](json-schema/location.json) |
| Observer | Privacy-conscious observer identity | [avro](avro/observer.avsc) / [json](json-schema/observer.json) |
| Protocol | Survey methodology | [avro](avro/protocol.avsc) / [json](json-schema/protocol.json) |
| Evidence | Supporting documentation (photos, audio) | [avro](avro/evidence.avsc) / [json](json-schema/evidence.json) |

See [examples/](examples/) for valid JSON instances of each entity.

## Extensions

Add custom fields to any entity using the `extensions` map:

```json
{
  "taxonID": "...",
  "scientificName": "Erithacus rubecula",
  "extensions": {
    "myapp.nestingStatus": "confirmed",
    "myapp.broodSize": 4
  }
}
```

**Rules:**
- Keys must be namespaced: `namespace.fieldName`
- Pattern: `^[a-z][a-z0-9_]*\.[a-zA-Z][a-zA-Z0-9_]*$`

See [extensions/registry.md](extensions/registry.md) to register your namespace.

## Foundation

This schema builds on established biodiversity standards:

- **[Darwin Core](https://dwc.tdwg.org/)** — International standard for biodiversity data
- **[GBIF](https://www.gbif.org/)** — Global Biodiversity Information Facility compatibility
- **[eBird](https://ebird.org/)** — Citizen science data model alignment

See [mappings/](mappings/) for field-level mappings to these standards.

## Documentation

- [DATA_CONTRACT_SPECIFICATION.md](docs/DATA_CONTRACT_SPECIFICATION.md) — Full design document
- [governance.md](docs/governance.md) — Schema change process
- [alignment-guide.md](docs/alignment-guide.md) — Tool integration guide

## License

This project is licensed under the **Apache License 2.0** — see [LICENSE](LICENSE) for details.

### Third-Party Attribution

This schema incorporates terms from [Darwin Core](https://dwc.tdwg.org/), a standard maintained by [Biodiversity Information Standards (TDWG)](https://www.tdwg.org/).

Darwin Core is licensed under the **Creative Commons Attribution 4.0 International License (CC BY 4.0)**.

© Biodiversity Information Standards (TDWG)

## Community

- **Website:** [birdlife.tech](https://birdlife.tech)
- **Matrix:** [#birdlife-schema:matrix.org](https://matrix.to/#/#birdlife-schema:matrix.org)
- **Email:** info@birdlife.tech

## Contributing

Schema changes require review. See [governance.md](docs/governance.md) for the change process.

---

Part of the [BirdLife Tools](https://github.com/birdlife-tools) open-source conservation toolkit.
