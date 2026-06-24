# GBIF Mapping

This document describes how to export BirdLife Schema data for submission to [GBIF](https://www.gbif.org/).

## Overview

GBIF accepts data in Darwin Core Archive (DwC-A) format. BirdLife Schema is designed to be GBIF-compatible through Darwin Core alignment.

## Export Process

1. Convert BirdLife entities to Darwin Core terms (see [darwin-core.md](darwin-core.md))
2. Package as Darwin Core Archive (ZIP with meta.xml)
3. Submit via GBIF IPT or API

## Key Field Mappings

### Occurrence Core

| GBIF Field | BirdLife Source | Transformation |
|------------|-----------------|----------------|
| `occurrenceID` | `observation.occurrenceID` | Prefix with dataset namespace |
| `basisOfRecord` | — | Set to `HumanObservation` |
| `scientificName` | `taxon.scientificName` | Join via taxonID |
| `eventDate` | `observation.eventDate` | ISO 8601 |
| `decimalLatitude` | `location.decimalLatitude` | Join via locationID |
| `decimalLongitude` | `location.decimalLongitude` | Join via locationID |
| `countryCode` | `location.countryCode` | Join via locationID |
| `individualCount` | `observation.count` | Direct |
| `recordedBy` | `observer.displayName` | Join via observerID, respect anonymization |

### Taxon Extension

Use `gbifKey` field to link to GBIF backbone taxonomy for consistent species matching.

## GBIF-Specific Fields

Fields not in BirdLife Schema but required/recommended by GBIF:

| GBIF Field | Suggested Value |
|------------|-----------------|
| `institutionCode` | `BirdLifeTools` or contributing organization |
| `collectionCode` | Tool name (e.g., `bird-collision-reporter`) |
| `basisOfRecord` | `HumanObservation` |
| `license` | `CC0` or `CC BY 4.0` |

## Resources

- [GBIF Data Quality Requirements](https://www.gbif.org/data-quality-requirements)
- [Darwin Core Archive Guide](https://dwc.tdwg.org/text/)
- [IPT User Manual](https://ipt.gbif.org/manual/)
