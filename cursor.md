# Cursor Guidance for Crosslist Assist

## Philosophy
- Lean, modular, TypeScript-first.
- Keep the Chrome extension simple, assistive, and ToS-safe.
- Use shared schemas/mappers to normalize data.
- Build exporter with eBay API first, scrape fallback second.

## Style Guide
- TypeScript everywhere.
- Zod for schemas/validation.
- Minimal dependencies; keep bundle sizes small.
- Comment critical DOM selectors (Poshmark UI is brittle).

## Priorities
1. Get the **Poshmark assistant dropzone** working (fill fields + forward drag event).
2. Implement **Node exporter** with eBay API fetch → JSON + images → folders.
3. Build **shared mappers** for brand, size, condition, categories.
4. Spin up **Next.js landing site** with Tailwind, license integration.
5. Wire licensing check into extension + exporter.

## Architecture
- `packages/extension`: MV3 extension, content scripts, drop handler, DOM fillers.
- `packages/exporter`: Node CLI for eBay export (API → JSON + images).
- `packages/shared`: Zod schemas, mappers, utilities.
- `apps/web`: Next.js site with Tailwind; Lemon Squeezy/Gumroad checkout.

## Coding Prompts
When adding or editing code:
- Always validate listing.json against the shared Zod schema.
- Write helper functions for DOM filling (`fillTitle`, `fillDescription`, `pickBrand`).
- For exporter: use async/await + p-limit to throttle API/image fetches.
- For extension: re-dispatch the original drag event to Poshmark’s photo target.

## Don’ts
- Don’t automate the final “Publish” click (user should always review).
- Don’t hardcode credentials; load from `.env` (exporter) or `chrome.storage` (extension).
- Don’t rely on brittle selectors without comments and backup strategies.
