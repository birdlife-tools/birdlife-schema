---
name: Schema Proposal
about: Propose a new field or entity for the schema
title: '[PROPOSAL] '
labels: proposal
assignees: ''
---

## Summary

One-line description of the proposed change.

## Motivation

Why is this change needed? What problem does it solve?

## Proposed Change

### Entity/Field

Which entity does this affect? What fields are being added/modified?

### Schema Definition

```json
{
  "name": "newField",
  "type": ["null", "string"],
  "default": null,
  "doc": "Description of the field"
}
```

### Example Usage

```json
{
  "existingField": "value",
  "newField": "example value"
}
```

## Darwin Core Alignment

Does this map to a Darwin Core term? If so, which one?

- Term: `dwc:termName`
- Reference: https://dwc.tdwg.org/terms/#dwc:termName

## Backward Compatibility

- [ ] Additive (new optional field) — backward compatible
- [ ] Modification of existing field — may break compatibility
- [ ] Removal of field — breaking change

## Alternatives Considered

What other approaches did you consider?

## Additional Context

Any other information that might be relevant.
