# Closet Hopper

Migrate your eBay listings to Poshmark with drag & drop simplicity.

## Overview

Closet Hopper is an assistive tool that helps sellers migrate their eBay listings to Poshmark without retyping or re-photographing items. The core workflow is:

1. **Export** eBay listings (via CLI tool) → creates folders with `listing.json` + images
2. **Drag & Drop** folders into Poshmark's create listing page
3. **Auto-fill** form fields and forward images to Poshmark's uploader
4. **User reviews** and publishes (staying in control)

## Architecture

This is a monorepo containing:

- **`packages/extension`** - Chrome MV3 extension for Poshmark integration
- **`packages/exporter`** - Node CLI for eBay data export
- **`packages/shared`** - Zod schemas and data mappers
- **`apps/web`** - Next.js landing site with licensing system

## Getting Started

### Prerequisites

- Node.js 18+
- Chrome browser
- eBay account with listings

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd closet-hopper
```

2. Install dependencies:
```bash
npm install
```

3. Build all packages:
```bash
npm run build
```

### Development

1. Start the web app:
```bash
cd apps/web
npm run dev
```

2. Build the extension:
```bash
cd packages/extension
npm run dev
```

3. Build the exporter:
```bash
cd packages/exporter
npm run build
```

## Usage

### 1. Export eBay Listings

```bash
cd packages/exporter
npm run start export -u your-ebay-username
```

This will create folders in `./export/` containing:
- `listing.json` - structured listing data
- `image_1.jpg`, `image_2.jpg`, etc. - listing photos

### 2. Install Chrome Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select `packages/extension/dist/`
4. The Closet Hopper extension will appear in your extensions

### 3. Migrate to Poshmark

1. Go to Poshmark's create listing page
2. Drag one of your exported folders onto the page
3. Closet Hopper will fill in the form fields and upload images
4. Review and publish your listing

## License System

The extension requires a valid license key. Purchase a license at [closethopper.com](https://closethopper.com) for $49 (one-time fee, lifetime access).

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Framer Motion
- **Extension**: Chrome MV3, TypeScript, Webpack
- **CLI**: Node.js, Puppeteer, TypeScript
- **Database**: Prisma, SQLite (dev) / PostgreSQL (prod)
- **Validation**: Zod schemas

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is proprietary software. All rights reserved.

## Support

For support, visit [closethopper.com/help](https://closethopper.com/help) or contact us at support@closethopper.com.