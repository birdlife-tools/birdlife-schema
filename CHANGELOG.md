# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.5] - 2026-06-26

### Added
- Matrix notification on release (posts to #birdlife-schema:matrix.org)

## [0.3.4] - 2026-06-25

### Fixed
- Org README update now replaces all version references (badge, alt text, release link)

## [0.3.3] - 2026-06-25

### Fixed
- npm badge URL in README to use scoped package name

## [0.3.2] - 2026-06-25

### Fixed
- npm token configuration for CI/CD publishing

## [0.3.1] - 2026-06-25

### Fixed
- Release workflow syntax error for organization README updates

## [0.3.0] - 2026-06-25

### Added
- npm publishing via `@birdlife-tools/birdlife-schema` scoped package
- Automated organization README version updates on release

### Changed
- Package name scoped to `@birdlife-tools/birdlife-schema`

## [0.2.0] - 2026-06-24

### Added
- CLI tool (`birdlife-schema`) for validating data against schemas
- JSON Schema generation from Avro schemas
- CI check to ensure JSON Schema files are up to date

### Changed
- Moved `avsc` from devDependencies to dependencies (required for CLI)

## [0.1.0] - 2026-06-24

### Added
- Initial Tier 1 entity schemas: Taxon, Observation, Location, Observer, Protocol, Evidence
- Darwin Core term mappings
- Example JSON instances for each entity
- Schema validation tooling
- CI/CD workflows for schema validation and compatibility checking
- Repository initialization
- Project documentation and governance structure
- Apache 2.0 license with Darwin Core (CC BY 4.0) attribution
