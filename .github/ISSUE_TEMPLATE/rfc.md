---
name: RFC (Major Change)
about: Formal proposal for breaking changes
title: '[RFC] '
labels: rfc
assignees: ''
---

## RFC: [Title]

**Status**: Draft | Discussion | Accepted | Rejected
**Author**: @username
**Created**: YYYY-MM-DD

## Summary

One paragraph summary of the proposal.

## Motivation

Why is this change necessary? What problems does it solve?

## Detailed Design

### Current State

How does the schema work today?

### Proposed Changes

Detailed description of changes:

1. Change 1
2. Change 2
3. ...

### Schema Diff

```diff
- "oldField": "string"
+ "newField": ["null", "string"]
```

## Migration Path

How should existing tools migrate?

### For Producers

Steps for tools that create this entity.

### For Consumers

Steps for tools that read this entity.

### Timeline

- v0.x.0: Deprecation warning
- v0.y.0: Both old and new supported
- v1.0.0: Old format removed

## Drawbacks

Why might we NOT want to do this?

## Alternatives

What other approaches were considered?

## Unresolved Questions

What needs further discussion?

## References

- Related issues: #
- External references:
