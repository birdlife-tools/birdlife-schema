# Schema Governance

This document describes the process for proposing and approving changes to BirdLife Schema.

## Principles

1. **Stability first**: Schema changes affect all downstream tools
2. **Backward compatibility**: Prefer additive changes over breaking changes
3. **Community consensus**: Major changes require discussion and review
4. **Darwin Core alignment**: New fields should align with Darwin Core where applicable

## Change Categories

| Category | Version Bump | Review Period | Approvals |
|----------|--------------|---------------|-----------|
| Documentation only | PATCH | None | 1 |
| New optional field | MINOR | 7 days | 2 |
| New entity | MINOR | 7 days | 2 |
| Breaking change | MAJOR | 14 days | 2 + RFC |

## Process

### 1. Proposal

Open a GitHub Issue using the "Schema Proposal" template:
- Describe the change and rationale
- Show example usage
- Assess backward compatibility impact
- Reference Darwin Core terms if applicable

### 2. Discussion

- Community feedback via issue comments
- Minimum discussion period based on change category
- Maintainers may request changes or clarification

### 3. RFC (Major Changes Only)

For MAJOR version changes, create a formal RFC document:
- Detailed specification
- Migration path for existing tools
- Timeline for deprecation of removed fields

### 4. Implementation

Once approved:
1. Create PR with schema changes
2. Update examples to demonstrate new fields
3. Add/update mapping documentation
4. Update CHANGELOG.md

### 5. Review & Merge

- PR requires approval from maintainers (see CODEOWNERS)
- All CI checks must pass
- Squash merge to main

### 6. Release

After merge:
1. Update VERSION file
2. Create git tag
3. Publish release notes

## Deprecation Policy

Fields are not removed without warning:

1. Mark field with `@deprecated` in doc string
2. Maintain for minimum 2 MINOR versions
3. Remove only in MAJOR version
4. Document migration path

## Roles

| Role | Responsibilities |
|------|------------------|
| **Maintainer** | Review PRs, approve changes, manage releases |
| **Contributor** | Propose changes, submit PRs, participate in discussion |
| **Community** | Report issues, request features, provide feedback |

## Contact

- **Matrix**: [#birdlife-schema:matrix.org](https://matrix.to/#/#birdlife-schema:matrix.org)
- **Email**: info@birdlife.tech
