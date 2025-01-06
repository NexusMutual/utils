# Nexus Mutual Utilities

## Table of Contents

- [Nexus Mutual Utilities](#nexus-mutual-utilities)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Log Level Library](#log-level-library)
    - [Usage](#usage)
      - [Importing the Log Level Utility](#importing-the-log-level-utility)
      - [Usage in Code](#usage-in-code)
    - [Log Levels](#log-levels)
  - [Development](#development)
    - [Install Dependencies](#install-dependencies)
    - [Build Locally](#build-locally)

## Installation

Install the package using npm:

```bash
npm install @nexusmutual/utils
```

## Log Level Library

The `log-level` library provides a utility to manage and handle logging levels in your application.

### Usage

#### Importing the Log Level Utility

```typescript
import { setLogLevel } from '@nexusmutual/utils';
```

#### Usage in Code

Call `setLogLevel` at the start of the entry point to configure log levels.

```typescript
setLogLevel(process.env.LOG_LEVEL);
```

### Log Levels

The `log-level` utility supports the following logging levels (case insensitive) and ordered from the most verbose to the least verbose logging:

- `all`: Enables logging of all levels.
- `trace`: Enables logging of `trace`, `debug`, `info`, `warn`, and `error`.
- `debug`: Enables logging of `debug`, `info`, `warn`, and `error`. Disables `trace`.
- `info`: Enables logging of `info`, `log`, `warn`, and `error`. Disables `trace` and `debug`. Same as `log`
- `log`: Enables logging of `log`, `info`, `warn`, and `error`. Disables `trace` and `debug`. Same as `info`
- `warn`: Enables logging of `warn` and `error`. Disables `trace`, `debug`, and `info`.
- `error`: Enables logging of `error` only. Disables `trace`, `debug`, `info` and `warn`. 
- `silence`: Disables all logging output.

## Development

### Install Dependencies

Install all dependencies with:

```bash
npm ci
```

### Build Locally

To build the library locally, run:

```bash
npm run build
```

This will compile the TypeScript code into JavaScript in the `dist` folder.
