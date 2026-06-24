# eBird Mapping

This document describes field mappings between BirdLife Schema and [eBird](https://ebird.org/) data formats.

## Overview

eBird uses its own data model for checklists and observations. This mapping enables:
- Import from eBird exports
- Export in eBird-compatible format
- Cross-referencing with eBird data

## Checklist Mapping

eBird checklists map to a combination of BirdLife entities:

| eBird Concept | BirdLife Equivalent |
|---------------|---------------------|
| Checklist | Protocol + Location + Observer + multiple Observations |
| Observation | Observation entity |
| Location (hotspot) | Location entity |
| Observer | Observer entity |

## Field Mappings

### eBird → BirdLife

| eBird Field | BirdLife Field | Notes |
|-------------|----------------|-------|
| `COMMON NAME` | `taxon.vernacularNames.en` | Lookup via scientificName |
| `SCIENTIFIC NAME` | `taxon.scientificName` | Primary key for taxon |
| `OBSERVATION COUNT` | `observation.count` | Parse "X" as null |
| `OBSERVATION DATE` | `observation.eventDate` | Convert to ISO 8601 |
| `TIME OBSERVATIONS STARTED` | `observation.eventDate` | Combine with date |
| `LATITUDE` | `location.decimalLatitude` | Direct |
| `LONGITUDE` | `location.decimalLongitude` | Direct |
| `LOCATION` | `location.name` | Direct |
| `DURATION MINUTES` | `protocol.effortMinutes` | Direct |
| `EFFORT DISTANCE KM` | `protocol.distanceKm` | Direct |
| `ALL SPECIES REPORTED` | `protocol.allSpeciesReported` | 1=true, 0=false |
| `PROTOCOL TYPE` | `protocol.type` | Map to enum (see below) |

### Protocol Type Mapping

| eBird Protocol | BirdLife ProtocolType |
|----------------|----------------------|
| `eBird - Casual Observation` | `CASUAL` |
| `eBird - Stationary Count` | `STATIONARY` |
| `eBird - Traveling Count` | `TRAVELING` |
| `eBird - Area Count` | `AREA` |
| `eBird - Nocturnal Flight Call Count` | `NOCTURNAL` |

### BirdLife → eBird

For exporting to eBird format, reverse the mappings above. Note:
- eBird requires specific column headers
- Some BirdLife fields have no eBird equivalent (extensions, evidence)
- Observer anonymization should be respected

## eBird Species Codes

eBird uses 4-6 letter species codes. These can be stored in extensions:

```json
{
  "extensions": {
    "ebird.speciesCode": "eurrob1"
  }
}
```

## Resources

- [eBird Data Download](https://ebird.org/data/download)
- [eBird Basic Dataset](https://science.ebird.org/en/use-ebird-data/download-ebird-data-products)
- [eBird API Documentation](https://documenter.getpostman.com/view/664302/S1ENwy59)
