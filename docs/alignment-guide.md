# Tool Alignment Guide

How to declare and verify that your tool is compatible with BirdLife Schema.

## Declaring Compatibility

Add a `birdlife` section to your project's manifest file:

### package.json (Node.js)

```json
{
  "name": "my-bird-tool",
  "version": "1.0.0",
  "birdlife": {
    "schemaVersion": "^0.1.0",
    "produces": ["observation", "location"],
    "consumes": ["taxon", "observation"]
  }
}
```

### pyproject.toml (Python)

```toml
[tool.birdlife]
schemaVersion = "^0.1.0"
produces = ["observation", "location"]
consumes = ["taxon", "observation"]
```

### birdlife.json (Generic)

```json
{
  "schemaVersion": "^0.1.0",
  "produces": ["observation", "location"],
  "consumes": ["taxon", "observation"]
}
```

## Field Meanings

| Field | Description |
|-------|-------------|
| `schemaVersion` | Semver range of compatible schema versions |
| `produces` | Entities your tool creates/outputs |
| `consumes` | Entities your tool reads/accepts as input |

## Validation

### In Your Test Suite

Add schema validation to your tests:

```javascript
// Node.js example with avsc
const avro = require('avsc');
const taxonSchema = require('birdlife-schema/avro/taxon.avsc');

const type = avro.Type.forSchema(taxonSchema);

test('output matches taxon schema', () => {
  const output = myTool.generateTaxon();
  expect(type.isValid(output)).toBe(true);
});
```

```python
# Python example with fastavro
import fastavro
import json

with open('node_modules/birdlife-schema/avro/taxon.avsc') as f:
    schema = json.load(f)

def test_output_matches_schema():
    output = my_tool.generate_taxon()
    # fastavro.validate will raise if invalid
    fastavro.validate(output, schema)
```

### CI Integration

Add to your GitHub Actions workflow:

```yaml
- name: Validate schema compatibility
  run: |
    npm install birdlife-schema
    npm run validate-schema
```

## Using the Resolution API

For consistent IDs, use the BirdLife Resolution API:

```javascript
// Get deterministic taxon ID
const response = await fetch(
  'https://birdlife.tech/api/v1/taxon/resolve?name=Erithacus+rubecula'
);
const { taxonID, slug, scientificName } = await response.json();
```

## Compatibility Badge

Once verified, add the compatibility badge to your README:

```markdown
[![BirdLife Schema](https://img.shields.io/badge/BirdLife%20Schema-v0.1.0-blue)](https://github.com/birdlife-tools/birdlife-schema)
```

## Common Issues

### Missing Required Fields

All required fields must be present:
- `taxonID`, `slug`, `scientificName` for Taxon
- `occurrenceID`, `taxonID`, `eventDate` for Observation
- etc.

### Invalid Extension Keys

Extension keys must be namespaced: `namespace.fieldName`

```json
// Wrong
{ "extensions": { "nestingStatus": "confirmed" } }

// Correct
{ "extensions": { "myapp.nestingStatus": "confirmed" } }
```

### Date Format

All dates must be ISO 8601: `2026-06-24T08:30:00Z`

## Help

- **Questions**: [#birdlife-schema:matrix.org](https://matrix.to/#/#birdlife-schema:matrix.org)
- **Issues**: [GitHub Issues](https://github.com/birdlife-tools/birdlife-schema/issues)
