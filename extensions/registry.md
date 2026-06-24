# Extension Namespace Registry

Tools using BirdLife Schema can add custom fields via the `extensions` map. To avoid collisions and aid discovery, register your namespace here.

## How to Register

1. Open a PR adding your namespace to the table below
2. Use lowercase namespace matching your tool/organization name
3. Provide contact and brief description

## Registered Namespaces

| Namespace | Tool/Organization | Contact | Description |
|-----------|-------------------|---------|-------------|
| `birdlife` | BirdLife Schema | info@birdlife.tech | Reserved for official extensions |
| `ebird` | eBird compatibility | — | eBird-specific fields (speciesCode, etc.) |
| `gbif` | GBIF compatibility | — | GBIF-specific fields |

## Extension Key Format

Keys must match the pattern: `^[a-z][a-z0-9_]*\.[a-zA-Z][a-zA-Z0-9_]*$`

Examples:
- `myapp.nestingStatus` ✓
- `myapp.brood_size` ✓
- `MyApp.field` ✗ (namespace must be lowercase)
- `nestingStatus` ✗ (missing namespace)

## Guidelines

1. **Namespace ownership**: Use a namespace you control (your tool name, org name)
2. **Be specific**: `myapp.nestingConfirmed` is better than `myapp.status`
3. **Document your extensions**: Maintain documentation in your tool's repo
4. **Consider proposing to core**: If your extension is broadly useful, propose adding it to the core schema
