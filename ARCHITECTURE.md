# Architecture Notes

## Monorepo layout
crosslist-assist/
  packages/
    extension/   # Chrome MV3
    exporter/    # Node CLI
    shared/      # Zod schemas, mappers
  apps/
    web/         # Next.js site

## Data flow
eBay Exporter → listing.json + images per folder → drag folder into Poshmark assistant → form filled + images forwarded → user reviews + publishes.

## Shared schema (Zod)
- sku
- title
- description
- brand
- category_guess [string, string, string]
- size
- color [string, string?]
- condition
- original_price
- list_price
- images [string[]]
- material [string[]]
- style [string[]]
- gender
- source (platform, id, raw)

## Future expansion
- Add Mercari/Etsy exporters later.
- Build optional RPA auto-uploader (local only).
