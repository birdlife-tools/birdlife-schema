# BirdLife Data Contract Specification

> Establishing a language-agnostic schema contract for the BirdLife open-source ecosystem.

## Purpose

This document specifies the foundation for `birdlife-schema` — a dedicated repository that defines the **canonical data shapes** for the entire BirdLife community. Every tool, service, or integration in the ecosystem must align with these contracts to ensure interoperability.

**Why a separate schema repository?**
- **Language agnostic**: Python tools, TypeScript services, Go CLIs — all consume the same truth
- **Single source of truth**: No drift between implementations
- **Clear compatibility**: Tools declare which schema version they support
- **Community governance**: Schema changes go through PR review, not hidden in app code

---

## Alignment with Industry Standards

We don't reinvent biodiversity data structures. We build on established standards:

### Darwin Core (Primary Foundation)

[Darwin Core](https://dwc.tdwg.org/) is **the** international standard for biodiversity data, maintained by TDWG (Biodiversity Information Standards). It provides:

- **Occurrence records**: When/where a species was observed
- **Taxon**: Species identification and taxonomy
- **Event**: Sampling events and protocols
- **Location**: Geographic data
- **Record-level terms**: Metadata about the record itself

Our schemas extend Darwin Core terms where applicable, using their namespaces and semantics.

> **📋 License Note**: Darwin Core is licensed under **CC BY 4.0** (Creative Commons Attribution 4.0 International) by Biodiversity Information Standards (TDWG). We are free to use, extend, and build upon it — attribution required. See [License & Attribution](#license--attribution) section.

### GBIF Compatibility

[GBIF](https://www.gbif.org/) (Global Biodiversity Information Facility) aggregates biodiversity data worldwide. Their data model is Darwin Core-based. Our schemas should produce GBIF-compatible exports for contribution to global datasets.

### eBird Alignment

[eBird](https://ebird.org/) represents the largest citizen-science bird database. Where our schemas overlap with eBird's data model (checklists, observations), we maintain mapping compatibility.

---

## Schema Format: Apache Avro

After evaluating options, **Apache Avro** is recommended as the primary schema definition language.

### Why Avro?

| Criteria | Avro | JSON Schema | Protocol Buffers |
|----------|------|-------------|------------------|
| Schema evolution | Excellent | Limited | Good |
| Human readable | Yes (JSON) | Yes | No (.proto) |
| Language support | Wide | Wide | Wide (codegen) |
| Code generation required | No | No | Yes |
| Binary serialization | Yes | No | Yes |
| Validation tooling | Good | Excellent | Limited |
| Open source ecosystem | Apache | IETF Draft | Google |

### Decision Rationale

1. **Schema Evolution**: Avro has the strongest rules for backward/forward compatibility — critical for a growing ecosystem
2. **No Mandatory Codegen**: Tools can parse schemas dynamically; no build step required
3. **JSON Definition**: Schemas are human-readable JSON, easy to review in PRs
4. **Dual Format**: Can serialize to readable JSON or compact binary (tools choose based on need)
5. **Darwin Core Heritage**: Many biodiversity data pipelines use Avro (GBIF Parquet exports share this lineage)

### Complementary: JSON Schema for Validation

While Avro defines the canonical shapes, we'll generate **JSON Schema** files for runtime validation in web applications and APIs. This is a one-way derivation: Avro → JSON Schema.

---

## Core Domain Entities

Initial entity scope based on ornithology domain analysis:

### Tier 1: Foundation (v1.0.0)

```
┌─────────────────────────────────────────────────────────────────────┐
│                           TAXONOMY                                   │
├─────────────────────────────────────────────────────────────────────┤
│  Taxon                                                               │
│  ├── taxonID (string, required, UUID v5 from scientificName)        │
│  ├── slug (string, auto-generated from scientificName)              │
│  ├── scientificName (string, required)                              │
│  ├── vernacularNames (map<locale,string>, optional)                 │
│  │     e.g. {"en": "European Robin", "de": "Rotkehlchen"}           │
│  ├── taxonRank (enum: species|subspecies|family|order|...)          │
│  ├── kingdom → phylum → class → order → family → genus              │
│  ├── iucnStatus (enum: LC|NT|VU|EN|CR|EW|EX|DD|NE)                 │
│  └── gbifKey (int, optional, for GBIF alignment)                    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                          OCCURRENCE                                  │
├─────────────────────────────────────────────────────────────────────┤
│  Observation                                                         │
│  ├── occurrenceID (string, required, random UUID v4)                │
│  ├── taxonID (string, required, ref: Taxon)                         │
│  ├── eventDate (ISO8601 timestamp)                                  │
│  ├── location (ref: Location)                                       │
│  ├── observer (ref: Observer)                                       │
│  ├── count (int, nullable = "presence only")                        │
│  ├── countType (enum: exact|estimate|x_plus|present)                │
│  ├── behavior (string[], optional)                                  │
│  ├── evidence (ref: Evidence[], optional)                           │
│  └── protocol (ref: Protocol, optional)                             │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                           LOCATION                                   │
├─────────────────────────────────────────────────────────────────────┤
│  Location                                                            │
│  ├── locationID (string, required, UUID v5 from coords or random)   │
│  ├── slug (string, auto-generated from name)                        │
│  ├── name (string, required)                                        │
│  ├── decimalLatitude (double, optional)                             │
│  ├── decimalLongitude (double, optional)                            │
│  ├── coordinateUncertaintyInMeters (int, optional)                  │
│  ├── geodeticDatum (string, default: "WGS84")                       │
│  ├── country (ISO 3166-1 alpha-2)                                   │
│  ├── countryCode (string)                                           │
│  ├── locality (string, optional)                                    │
│  └── habitat (string[], optional)                                   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                           OBSERVER                                   │
├─────────────────────────────────────────────────────────────────────┤
│  Observer                                                            │
│  ├── observerID (string, required, random UUID v4)                  │
│  ├── slug (string, optional, from displayName if provided)          │
│  ├── displayName (string, optional)                                 │
│  ├── anonymized (boolean, default: true)                            │
│  └── affiliations (string[], optional)                              │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                           PROTOCOL                                   │
├─────────────────────────────────────────────────────────────────────┤
│  Protocol (how the observation was conducted)                        │
│  ├── protocolID (string, required, random UUID v4)                  │
│  ├── type (enum, required):                                         │
│  │     casual        — incidental sighting, no fixed effort         │
│  │     stationary    — observation from fixed point                 │
│  │     traveling     — observation while moving (transect/walk)     │
│  │     area          — systematic survey of defined area            │
│  │     point_count   — standardized timed count at point            │
│  │     mist_netting  — capture-based survey                         │
│  │     playback      — using audio playback                         │
│  │     nocturnal     — night survey                                 │
│  ├── effortMinutes (int, optional, duration of survey)              │
│  ├── distanceKm (double, optional, for traveling protocol)          │
│  ├── areaHa (double, optional, for area protocol)                   │
│  ├── numberOfObservers (int, optional)                              │
│  └── allSpeciesReported (boolean, default: false)                   │
│        — true = complete checklist, false = incomplete              │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                           EVIDENCE                                   │
├─────────────────────────────────────────────────────────────────────┤
│  Evidence (documentation supporting the observation)                 │
│  ├── evidenceID (string, required, random UUID v4)                  │
│  ├── type (enum, required):                                         │
│  │     photo         — still image                                  │
│  │     audio         — sound recording                              │
│  │     video         — video recording                              │
│  │     specimen      — physical specimen (museum, etc.)             │
│  │     written       — field notes, description                     │
│  ├── url (string, optional, link to media file)                     │
│  ├── thumbnailUrl (string, optional)                                │
│  ├── license (string, optional, e.g., "CC BY 4.0")                  │
│  ├── attribution (string, optional, photographer/recordist)         │
│  ├── capturedAt (ISO8601, optional, when evidence was captured)     │
│  └── notes (string, optional)                                       │
└─────────────────────────────────────────────────────────────────────┘
```

**Tier 1 Entity Dependency Graph:**
```
Observation (central entity)
    ├── references → Taxon
    ├── references → Location
    ├── references → Observer
    ├── references → Protocol
    └── references → Evidence[]
```

**Extensions Field (all entities):**
Every Tier 1 entity includes an optional `extensions` field:
```
├── extensions (map<string,any>, optional)
│     Keys must match: ^[a-z][a-z0-9_]*\.[a-zA-Z][a-zA-Z0-9_]*$
│     e.g. {"myapp.nestingStatus": "confirmed", "myapp.broodSize": 4}
```

### Tier 2: Extended (v1.1.0+)

- **Checklist**: Collection of observations from a single survey event (groups Observations + shared Protocol)
- **Site**: Named locations with boundaries (IBAs, reserves, hotspots)
- **Project**: Research or conservation initiative grouping
- **Annotation**: Community notes, corrections, identifications
- **MediaCollection**: Grouped media assets (e.g., all photos from one trip)

### Tier 3: Analytics (v2.0.0+)

- **Trend**: Population trend data
- **Distribution**: Range maps, seasonal occurrence
- **Threat**: Conservation threat assessments

---

## Versioning Strategy

### Semantic Versioning for Schemas

```
MAJOR.MINOR.PATCH

MAJOR: Breaking changes (field removal, type change, required field added)
MINOR: Backward-compatible additions (new optional fields, new entities)
PATCH: Documentation, descriptions, non-structural fixes
```

### Compatibility Rules

| Change Type | Compatibility | Version Bump |
|-------------|---------------|--------------|
| Add optional field | Backward ✓ Forward ✓ | MINOR |
| Add new entity | Backward ✓ Forward ✓ | MINOR |
| Add enum value | Backward ✓ Forward ✗ | MINOR |
| Remove field | Backward ✗ Forward ✓ | MAJOR |
| Rename field | Backward ✗ Forward ✗ | MAJOR |
| Change field type | Backward ✗ Forward ✗ | MAJOR |
| Make optional → required | Backward ✗ Forward ✓ | MAJOR |

### Deprecation Policy

1. Field marked `@deprecated` with migration note
2. Minimum 2 MINOR versions before removal
3. Removal only in MAJOR version bump

---

## Repository Structure

```
birdlife-schema/
├── README.md
├── CHANGELOG.md
├── VERSION                    # Current version (e.g., "1.0.0")
│
├── avro/                      # Canonical Avro schemas
│   ├── taxon.avsc
│   ├── observation.avsc
│   ├── location.avsc
│   ├── observer.avsc
│   └── ...
│
├── json-schema/               # Generated JSON Schema (for validation)
│   └── (auto-generated from avro/)
│
├── mappings/                  # Interoperability mappings
│   ├── darwin-core.md         # DwC term mapping table
│   ├── gbif.md                # GBIF export mapping
│   └── ebird.md               # eBird field mapping
│
├── extensions/                # Extension namespace registry
│   └── registry.md            # Registered namespaces (namespace|tool|contact|desc)
│
├── examples/                  # Valid instance examples
│   ├── taxon-example.json
│   ├── observation-example.json
│   └── ...
│
├── tools/                     # Schema utilities
│   ├── validate.sh            # Validate a file against schema
│   ├── avro-to-jsonschema.sh  # Generate JSON Schema
│   └── compatibility-check.sh # Check backward/forward compat
│
├── docs/                      # Extended documentation
│   ├── governance.md          # Schema change process
│   ├── alignment-guide.md     # How tools declare compatibility
│   └── migration/             # Version migration guides
│       └── v1-to-v2.md
│
└── .github/
    ├── CODEOWNERS                     # Enforces maintainer review
    ├── PULL_REQUEST_TEMPLATE.md       # PR checklist
    ├── ISSUE_TEMPLATE/
    │   ├── schema-proposal.md         # New entity/field proposal
    │   ├── bug-report.md              # Schema bug report
    │   └── rfc.md                     # Major change RFC template
    └── workflows/
        ├── validate-schemas.yml       # CI: schema syntax valid
        ├── check-compatibility.yml    # CI: no breaking changes on main
        ├── validate-examples.yml      # CI: examples match schemas
        └── generate-artifacts.yml     # CI: build JSON Schema, docs
```

---

## Alignment Verification

Tools in the BirdLife ecosystem declare their schema compatibility and can be verified.

### Tool Compatibility Declaration

Each tool's `package.json`, `pyproject.toml`, or equivalent includes:

```json
{
  "birdlife": {
    "schemaVersion": "^1.0.0",
    "produces": ["observation", "location"],
    "consumes": ["taxon", "observation"]
  }
}
```

### Verification Approaches

1. **CI Validation**: Tools run schema validation in their test suites
2. **Badge System**: Verified tools display compatibility badge
3. **Registry**: Central registry of compatible tools (future)

### Validation Example (Conceptual)

```bash
# Validate a JSON file against the Observation schema
birdlife-schema validate observation my-data.json

# Check if tool's output matches declared schema
birdlife-schema verify-tool ./my-tool-output/
```

---

## Resolution API

A lightweight API service for generating deterministic, consistent IDs across the ecosystem.

**Purpose:** Community tools need consistent IDs without maintaining their own registries. This API provides a single source of truth for ID generation.

**Schema Alignment:** API responses conform to `birdlife-schema` Avro definitions. CI validates that all API response shapes match their corresponding schema entities. This ensures the API is a valid producer of schema-compliant data.

### Endpoints

#### 1. Taxon Resolution

```
GET https://birdlife.tech/api/v1/taxon/resolve?name=Erithacus+rubecula
```

**Logic:**
- UUID v5 computed deterministically from scientific name
- Same name → same UUID, always, everywhere
- No database lookup required (pure computation)

**Response:**
```json
{
  "taxonID": "8f14e45f-ceea-467f-a8f8-5c8e1c8d0a3b",
  "slug": "erithacus-rubecula",
  "scientificName": "Erithacus rubecula",
  "computed": true
}
```

#### 2. Location Resolution

```
POST https://birdlife.tech/api/v1/location/resolve
Content-Type: application/json

{
  "name": "Minsmere Reserve",
  "latitude": 52.2456,
  "longitude": 1.6234
}
```

**Logic:**
```
lat/lng provided?
    │
    ├── YES → Compute UUID from coordinates (4 decimal precision, ~11m)
    │         → Check if exists in DB
    │             ├── EXISTS → Return existing (ignore provided name)
    │             └── NEW → Create entry with coords + name
    │
    └── NO → Generate random UUID v4
             → Create entry with name only
```

**Response:**
```json
{
  "locationID": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "slug": "minsmere-reserve",
  "name": "Minsmere Reserve",
  "latitude": 52.2456,
  "longitude": 1.6234,
  "matched": true,
  "matchedName": "RSPB Minsmere"
}
```

### API Best Practices

| Concern | Implementation |
|---------|----------------|
| **Rate Limiting** | 60 requests/minute per IP (adjustable) |
| **Rate Exceeded** | `429 Too Many Requests` with `Retry-After` header |
| **Versioning** | URL path versioning (`/api/v1/...`) |
| **Authentication** | Public for now; API keys for higher limits (future) |
| **CORS** | Enabled for browser-based tools |
| **Response Format** | JSON only, UTF-8 |
| **Errors** | RFC 7807 Problem Details format |

**Error Response Example:**
```json
{
  "type": "https://birdlife.tech/errors/rate-limit-exceeded",
  "title": "Too Many Requests",
  "status": 429,
  "detail": "Rate limit of 60 requests/minute exceeded",
  "retryAfter": 45
}
```

### Infrastructure Notes

> **Implementation details — private repository**

| Component | Choice | Notes |
|-----------|--------|-------|
| **Repository** | `birdlife-api` (private) | Owners only, strict access |
| **Hosting** | AWS (same region as birdlife.tech) | Low latency |
| **Database** | PostgreSQL or DynamoDB | Location registry storage |
| **CI/CD** | GitHub Actions → AWS | Automated deployments |
| **Monitoring** | CloudWatch + alerts | Uptime, latency, error rates |
| **CDN/Cache** | CloudFront | Cache taxon lookups (deterministic) |

**Caching Strategy:**
- Taxon endpoint: Heavily cacheable (deterministic, immutable)
- Location endpoint: Cache by coordinates, invalidate on new entries

### Roadmap

- **v1.0**: Taxon + Location resolution (MVP)
- **v1.1**: Bulk resolution endpoints (`POST /api/v1/taxon/resolve-batch`)
- **v2.0**: Observer resolution (optional, privacy-conscious)

---

## Governance

This is a **contract repository** — changes affect the entire ecosystem. Strict controls are non-negotiable.

### Repository Protection Rules

#### Branch Protection (main)

| Rule | Setting |
|------|---------|
| Require PR before merging | ✅ Required |
| Required approvals | **2 maintainers minimum** |
| Dismiss stale reviews on new commits | ✅ Enabled |
| Require review from CODEOWNERS | ✅ Required |
| Require status checks to pass | ✅ Required |
| Require branches to be up to date | ✅ Required |
| Allow force pushes | ❌ Never |
| Allow deletions | ❌ Never |
| Restrict who can push | Maintainers only |

#### CODEOWNERS

```
# .github/CODEOWNERS
# All schema changes require maintainer approval

*                     @BirdLife-Tech/schema-maintainers
/avro/                @BirdLife-Tech/schema-maintainers
/json-schema/         @BirdLife-Tech/schema-maintainers
VERSION               @BirdLife-Tech/schema-maintainers
CHANGELOG.md          @BirdLife-Tech/schema-maintainers
```

#### Required CI Checks (must pass before merge)

1. **schema-validate** — All `.avsc` files are valid Avro syntax
2. **schema-compatibility** — No breaking changes vs. previous version (on main)
3. **examples-validate** — All example files validate against their schemas
4. **json-schema-generate** — JSON Schema generation succeeds
5. **docs-build** — Documentation builds without errors

### Who Can Merge

| Role | Can Approve | Can Merge | Notes |
|------|-------------|-----------|-------|
| Owner | ✅ | ✅ | Full access |
| Maintainer | ✅ | ✅ | Schema team members |
| Contributor | ❌ | ❌ | Can open PRs, discuss |
| Community | ❌ | ❌ | Can open issues, propose |

**No exceptions.** Even maintainers cannot self-merge — requires approval from another maintainer.

### Schema Change Process

1. **Proposal**: Open GitHub Issue with rationale and impact analysis
2. **Discussion**: Community feedback period (minimum 7 days for MINOR, 14 for MAJOR)
3. **RFC**: For MAJOR changes, formal RFC document required
4. **Implementation**: PR with schema changes, examples, and migration guide
5. **Review**: Requires 2 maintainer approvals (CODEOWNERS enforced)
6. **CI Gates**: All checks must pass
7. **Merge**: Maintainer merges (squash or merge commit, no rebase)
8. **Release**: Tag version, publish artifacts, update CHANGELOG

### Decision Criteria

- Does it align with Darwin Core semantics?
- Is it needed by multiple tools (not single-use)?
- Does it maintain backward compatibility (preferred)?
- Is there a migration path for breaking changes?

---

## Implementation Roadmap

### Phase 1: Bootstrap (Current)
- [ ] Create `birdlife-schema` repository under BirdLife-Tech org
- [ ] Add Apache 2.0 LICENSE file
- [ ] Add Darwin Core attribution in README
- [ ] Configure branch protection rules on `main`
- [ ] Set up CODEOWNERS file
- [ ] Create GitHub team `@BirdLife-Tech/schema-maintainers`
- [ ] Define Tier 1 entities in Avro
- [ ] Set up CI workflows (validate, compatibility, examples)
- [ ] Document Darwin Core mappings
- [ ] Create example instances for each entity

### Phase 2: Tooling & API
- [ ] Build validation CLI tool
- [ ] Set up JSON Schema generation
- [ ] Create compatibility checker
- [ ] Define badge/certification process
- [ ] Create `birdlife-api` private repository
- [ ] Implement Resolution API v1 (taxon + location endpoints)
- [ ] Set up AWS infrastructure (DB, API hosting, CloudFront)
- [ ] Configure rate limiting and monitoring
- [ ] Deploy to `birdlife.tech/api/v1/`

### Phase 3: Adoption
- [ ] Integrate with first community tool
- [ ] Publish to package registries (npm, PyPI as validation libs)
- [ ] Publish API client libraries (optional convenience wrappers)
- [ ] Establish schema registry (optional, for streaming use cases)

### Phase 4: Evolution
- [ ] Tier 2 entities based on community needs
- [ ] GBIF submission pipeline
- [ ] Cross-tool data exchange verified

---

## License & Attribution

### BirdLife Schema License

The `birdlife-schema` repository and its contents are released under the **Apache License 2.0**.

```
SPDX-License-Identifier: Apache-2.0
```

**Why Apache 2.0:**
- Permissive open-source license
- Allows commercial and non-commercial use
- Compatible with most other open-source licenses
- Patent grant protection
- Standard choice for data/schema projects

### License Compatibility Note

**Darwin Core (CC BY 4.0) + Apache 2.0 = ✅ Compatible**

- Darwin Core is a *vocabulary/standard*, not software code
- We reference their terms and definitions, not copy their implementation
- CC BY 4.0 requires attribution only — we fulfill this (see below)
- Many projects in the biodiversity ecosystem use this exact combination (GBIF tools, eBird integrations, etc.)
- No license conflict exists

### Third-Party Attribution (Required)

This project incorporates terminology and concepts from third-party standards. The following attributions **MUST** be included in the repository README and any published documentation:

#### Darwin Core

> This schema incorporates terms from [Darwin Core](https://dwc.tdwg.org/), a standard maintained by [Biodiversity Information Standards (TDWG)](https://www.tdwg.org/).
> 
> Darwin Core is licensed under the **Creative Commons Attribution 4.0 International License (CC BY 4.0)**.
> 
> © Biodiversity Information Standards (TDWG). See: https://dwc.tdwg.org/

**What CC BY 4.0 allows us to do:**
- ✅ Use Darwin Core terms freely
- ✅ Extend and adapt for our needs
- ✅ Include in open source and commercial tools
- ✅ Distribute and share

**What CC BY 4.0 requires:**
- ⚠️ **Attribution**: We must give appropriate credit to TDWG
- ⚠️ **Indicate changes**: Note where we've extended or modified terms

### Attribution Checklist for Repository

When creating `birdlife-schema` repo, ensure:

- [ ] README.md contains Darwin Core attribution block (above)
- [ ] LICENSE file includes both our license AND third-party notices
- [ ] Each schema file using DwC terms includes a header comment referencing Darwin Core
- [ ] NOTICE or ATTRIBUTION file lists all third-party standards used

---

## References

### Standards
- [Darwin Core Standard](https://dwc.tdwg.org/)
- [Darwin Core Terms](https://dwc.tdwg.org/terms/)
- [GBIF Data Standards](https://www.gbif.org/standards)
- [TDWG Standards](https://www.tdwg.org/standards/)

### Schema Formats
- [Apache Avro Specification](https://avro.apache.org/docs/current/spec.html)
- [JSON Schema](https://json-schema.org/)
- [Schema Evolution Best Practices](https://www.conduktor.io/glossary/schema-evolution-best-practices)

### Data Sources
- [eBird API Documentation](https://documenter.getpostman.com/view/664302/S1ENwy59)
- [GBIF Occurrence Downloads](https://techdocs.gbif.org/en/data-use/download-formats)
- [GBIF on AWS Open Data](https://registry.opendata.aws/gbif/)

### Research
- [Darwin Core: An Evolving Community-Developed Biodiversity Data Standard](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0029715)

---

## Design Decisions

Key architectural decisions made for v1.0.0:

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Namespace** | `tech.birdlife.schema` | Own identity, DwC mappings in docs |
| **Schema Format** | Apache Avro | Best evolution rules, no mandatory codegen |
| **License** | Apache 2.0 | Permissive, compatible with DwC (CC BY 4.0) |
| **Foundation Standard** | Darwin Core | Industry standard, GBIF/eBird compatible |

### ID Strategy

| Entity | UUID Type | Source | Slug |
|--------|-----------|--------|------|
| Taxon | v5 (deterministic) | Scientific name | From scientific name |
| Location | v5 or v4 | Coordinates (if provided) or random | From name |
| Observation | v4 (random) | — | — |
| Observer | v4 (random) | — | Optional, from displayName |
| Protocol | v4 (random) | — | — |
| Evidence | v4 (random) | — | — |

### Localization

- **Schema**: `vernacularNames: map<locale, string>` using ISO 639-1 codes
- **API v1**: Not included (keeps it simple)
- **Example**: `{"en": "European Robin", "de": "Rotkehlchen", "sr": "Црвендаћ"}`

### Privacy

- **Default**: Pseudonymous (`anonymized: true`)
- **observerID**: Always required (random UUID)
- **displayName**: Optional (user's choice, not real name)
- **Linkability**: `anonymized: false` = user consents to cross-dataset correlation
- **Compliance**: GDPR-compatible, no PII required

### Extensions

All entities support an optional `extensions` field for tool-specific data:

```json
{
  "extensions": {
    "myapp.nestingStatus": "confirmed",
    "myapp.broodSize": 4
  }
}
```

| Rule | Enforced |
|------|----------|
| Field type: `map<string, any>` | ✅ Schema validated |
| Key format: `namespace.fieldName` | ✅ Regex: `^[a-z][a-z0-9_]*\.[a-zA-Z][a-zA-Z0-9_]*$` |
| Namespace ownership | ⚠️ Honor system (registry helps) |
| Extension values | ❌ Not validated (by design) |

**Lifecycle**: Extension → Proposal → Core field (if broadly useful)

---

## Next Steps

### Immediate (Phase 1)
1. Create `birdlife-schema` repository under BirdLife-Tech GitHub org
2. Add LICENSE (Apache 2.0) and README with Darwin Core attribution
3. Configure branch protection + CODEOWNERS
4. Implement Tier 1 Avro schemas (6 entities)
5. Set up CI workflows (validate, compatibility, examples)
6. Create example JSON instances for each entity

### Short-term (Phase 2)
7. Create `birdlife-api` private repository
8. Implement Resolution API v1 (taxon + location endpoints)
9. Deploy to AWS, configure rate limiting
10. Publish validation CLI/library

### Medium-term (Phase 3)
11. Integrate with first community tool
12. Publish to package registries (npm, PyPI)
13. Gather feedback, iterate on schema

---

*Document version: 1.0-rc1*  
*Last updated: 2026-06-24*  
*Status: Ready for implementation*
