# Darwin Core Mapping

This document maps BirdLife Schema fields to [Darwin Core](https://dwc.tdwg.org/) terms.

## Attribution

Darwin Core is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) by [Biodiversity Information Standards (TDWG)](https://www.tdwg.org/).

## Taxon

| BirdLife Field | Darwin Core Term | Notes |
|----------------|------------------|-------|
| `taxonID` | `dwc:taxonID` | UUID v5 from scientificName |
| `scientificName` | `dwc:scientificName` | Full name with authorship |
| `vernacularNames` | `dwc:vernacularName` | Map by locale vs single value |
| `taxonRank` | `dwc:taxonRank` | Enum vs free text |
| `kingdom` | `dwc:kingdom` | Direct mapping |
| `phylum` | `dwc:phylum` | Direct mapping |
| `class` | `dwc:class` | Direct mapping |
| `order` | `dwc:order` | Direct mapping |
| `family` | `dwc:family` | Direct mapping |
| `genus` | `dwc:genus` | Direct mapping |
| `iucnStatus` | — | Not in Darwin Core |
| `gbifKey` | — | GBIF-specific |

## Observation → Occurrence

| BirdLife Field | Darwin Core Term | Notes |
|----------------|------------------|-------|
| `occurrenceID` | `dwc:occurrenceID` | Direct mapping |
| `taxonID` | `dwc:taxonID` | Reference to Taxon |
| `eventDate` | `dwc:eventDate` | ISO 8601 format |
| `locationID` | `dwc:locationID` | Reference to Location |
| `observerID` | `dwc:recordedBy` | UUID vs name string |
| `count` | `dwc:individualCount` | Direct mapping |
| `behavior` | `dwc:behavior` | Array vs string |
| `remarks` | `dwc:occurrenceRemarks` | Direct mapping |

## Location

| BirdLife Field | Darwin Core Term | Notes |
|----------------|------------------|-------|
| `locationID` | `dwc:locationID` | UUID vs URI |
| `decimalLatitude` | `dwc:decimalLatitude` | Direct mapping |
| `decimalLongitude` | `dwc:decimalLongitude` | Direct mapping |
| `coordinateUncertaintyInMeters` | `dwc:coordinateUncertaintyInMeters` | Direct mapping |
| `geodeticDatum` | `dwc:geodeticDatum` | Direct mapping |
| `country` | `dwc:country` | Direct mapping |
| `countryCode` | `dwc:countryCode` | Direct mapping |
| `locality` | `dwc:locality` | Direct mapping |
| `habitat` | `dwc:habitat` | Array vs string |

## Conversion Notes

When converting to Darwin Core format:

1. **IDs**: Darwin Core typically uses URIs; convert UUIDs to `https://birdlife.tech/{entity}/{uuid}`
2. **Arrays**: Concatenate with ` | ` separator (Darwin Core convention)
3. **Vernacular names**: Export one row per language or use primary language only
4. **Observer**: Use `displayName` if `anonymized: false`, else use observerID
