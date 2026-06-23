# Rename Change Directories

## Purpose

Fix the OpenSpec CLI constraint that rejects change names starting with numbers.

## Requirements

### Requirement: Active Changes Renamed
All 10 active change directories must use the `change-` prefix.

### Requirement: Archived Changes Renamed
The archived `01-backend-foundation` directory must use the `change-` prefix.

### Requirement: Content Preserved
All internal files (proposal.md, design.md, tasks.md, .openspec.yaml) must remain intact after rename.
