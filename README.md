# sanity-plugin-document-manager

> A Sanity Studio plugin to browse, search, filter, and bulk-manage documents across datasets.

[![npm version](https://img.shields.io/npm/v/sanity-plugin-document-manager.svg)](https://www.npmjs.com/package/sanity-plugin-document-manager)
[![license](https://img.shields.io/npm/l/sanity-plugin-document-manager.svg)](https://github.com/hardik-143/sanity-plugin-document-manager/blob/main/LICENSE)

## Features

- **Multi-dataset support** — switch between datasets from a single pane
- **Full-text search** — filter by title, name, ID, or document type
- **Type filtering** — dropdown with live document counts per type
- **Draft toggle** — include or exclude draft documents
- **Bulk selection & deletion** — select documents and delete them atomically
- **Pagination** — configurable page size (default 50)
- **Zero config** — works out of the box with sensible defaults

## Installation

```bash
npm install sanity-plugin-document-manager
```

## Quick Start

```ts
// sanity.config.ts
import { defineConfig } from 'sanity'
import { documentManager } from 'sanity-plugin-document-manager'

export default defineConfig({
  // ... your project config
  plugins: [
    documentManager(),
  ],
})
```

## Configuration

```ts
import { documentManager } from 'sanity-plugin-document-manager'

documentManager({
  // Custom tool title in the Studio navbar
  title: 'Content Manager',

  // Custom tool icon (React component)
  icon: MyCustomIcon,

  // Number of documents per page (default: 50)
  pageSize: 100,

  // Sanity API version (default: '2024-06-01')
  apiVersion: '2024-06-01',

  // Filter out specific document types from the type dropdown
  excludeTypes: ['sanity.imageAsset', 'sanity.fileAsset'],

  // Default dataset to select on load
  defaultDataset: 'production',
})
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | `string` | `'Document Manager'` | Tool title in the Studio navbar |
| `icon` | `React.ComponentType` | `DatabaseIcon` | Tool icon component |
| `pageSize` | `number` | `50` | Number of documents per page |
| `apiVersion` | `string` | `'2024-06-01'` | Sanity API version for queries |
| `excludeTypes` | `string[]` | `[]` | Document types to hide from the type filter |
| `defaultDataset` | `string` | — | Pre-select a specific dataset on load |

## Requirements

- Sanity Studio v3, v4, or v5
- React 18 or 19
- A Sanity token with read+write permissions (set as `SANITY_STUDIO_WRITE_TOKEN` environment variable)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SANITY_STUDIO_WRITE_TOKEN` | Yes | Token with read & write access for document operations |

## License

MIT — see [LICENSE](./LICENSE)

## Author

**Hardik Desai** — [thehardik.in](https://thehardik.in)
