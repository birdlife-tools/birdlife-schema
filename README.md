# BirdLife Schema

Language-agnostic data contract schemas for the BirdLife open-source ecosystem.

## Overview

This repository defines the canonical data shapes for bird observation and biodiversity data across all BirdLife community tools. Built on [Apache Avro](https://avro.apache.org/) for schema evolution and interoperability.

**Namespace:** `tech.birdlife.schema`

## Status

**Work in Progress** — Initial schema definitions coming soon.

See [DATA_CONTRACT_SPECIFICATION.md](https://github.com/birdlife-tools/birdlife-schema/blob/main/docs/DATA_CONTRACT_SPECIFICATION.md) for the full design document (to be added).

## Core Entities (Tier 1)

| Entity | Description |
|--------|-------------|
| Taxon | Species taxonomy (aligned with Darwin Core) |
| Observation | Bird sighting occurrence record |
| Location | Geographic location data |
| Observer | Privacy-conscious observer identity |
| Protocol | Survey methodology |
| Evidence | Supporting documentation (photos, audio) |

## Foundation

This schema builds on established biodiversity standards:

- **[Darwin Core](https://dwc.tdwg.org/)** — International standard for biodiversity data
- **[GBIF](https://www.gbif.org/)** — Global Biodiversity Information Facility compatibility
- **[eBird](https://ebird.org/)** — Citizen science data model alignment

## License

This project is licensed under the **Apache License 2.0** — see [LICENSE](LICENSE) for details.

### Third-Party Attribution

This schema incorporates terms from [Darwin Core](https://dwc.tdwg.org/), a standard maintained by [Biodiversity Information Standards (TDWG)](https://www.tdwg.org/).

Darwin Core is licensed under the **Creative Commons Attribution 4.0 International License (CC BY 4.0)**.

© Biodiversity Information Standards (TDWG)

## Community

- **Website:** [birdlife.tech](https://birdlife.tech)
- **Matrix:** [#birdlife-tools:matrix.org](https://matrix.to/#/#birdlife-tools:matrix.org)
- **Email:** info@birdlife.tech

## Contributing

Schema changes require review. See the governance process in the specification document.

---

Part of the [BirdLife Tools](https://github.com/birdlife-tools) open-source conservation toolkit.
