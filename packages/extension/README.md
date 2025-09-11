# Closet Hopper Chrome Extension

## Chrome Web Store Submission

### Required Files for Store Submission

1. **Icons** (create these):
   - `icons/icon16.png` - 16x16 pixels
   - `icons/icon48.png` - 48x48 pixels  
   - `icons/icon128.png` - 128x128 pixels

2. **Screenshots** (create these):
   - `screenshots/screenshot1.png` - 1280x800 or 640x400
   - `screenshots/screenshot2.png` - 1280x800 or 640x400
   - `screenshots/screenshot3.png` - 1280x800 or 640x400

3. **Store Listing**:
   - Short description: "Migrate eBay listings to Poshmark with drag & drop"
   - Detailed description: See below
   - Category: Productivity
   - Language: English

### Store Description

**Short Description:**
Migrate eBay listings to Poshmark with drag & drop

**Detailed Description:**
Closet Hopper makes it easy to migrate your eBay listings to Poshmark without retyping or re-photographing items.

**How it works:**
1. Export your eBay listings using our CLI tool
2. Drag the exported folder into Poshmark's create listing page
3. Closet Hopper automatically fills in all the details and uploads your photos
4. Review and publish your listing

**Features:**
- Drag & drop interface
- Automatic form filling
- Image forwarding
- One-time purchase, lifetime access
- No subscription required

**Requirements:**
- Valid Closet Hopper license
- Chrome browser
- eBay account with listings

**Privacy:**
- All data processed locally
- No personal information stored
- License validation only

### Building for Store

```bash
npm run build
# This creates the dist/ folder ready for Chrome Web Store
```

### Submission Process

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
2. Pay $5 one-time registration fee
3. Upload the `dist/` folder as a ZIP file
4. Fill out store listing information
5. Submit for review (usually 1-3 days)
