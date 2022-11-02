# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# Development

## 4.11.4 - 2022-11-02

### Changed

- **GHA**: Update actions - publish

## 4.11.2 - 2022-11-02

### Changed

- **GHA**: Update actions - checkout

## 4.10.0 - 2022-11-01

May require a Graphistry server 2.39.31+

### Features

- **node properties**: Mapping fields to node source/destination properties causes them to appear as node properties. Currently only well-defined when unique for each node.

### Changed

- **dependencies**: Update client-api to 4.2.0 and package-lock

### Fix

- **Hello**: Revert use of bad client-api version that was not showing graphs
- **layout**: Layout button works again - avoid sending null/undefined values
- **histograms**: Enable by default

# Latest

## 4.0.6 - 2022-06-30

### Features

- **js-upload-api**: Created environment-neutral upload API
- **package.json**: Version number is now reflected in the tool
- **pbiviz.json**: "Graphistry" appears on logo hover


### Fix

- **visual.ts**: Simplified field names
- **capabilities.json**: All edge properties appear
- **capabilities.json**: Numeric layout properties are now accepted in UI


