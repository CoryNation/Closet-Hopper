import { z } from 'zod';

// Core listing schema that both eBay and Poshmark data will map to
export const ListingSchema = z.object({
  sku: z.string(),
  title: z.string(),
  description: z.string(),
  brand: z.string().optional(),
  category_guess: z.tuple([z.string(), z.string(), z.string()]).optional(),
  size: z.string().optional(),
  color: z.tuple([z.string(), z.string().optional()]).optional(),
  condition: z.string().optional(),
  original_price: z.number().optional(),
  list_price: z.number(),
  images: z.array(z.string()),
  material: z.array(z.string()).optional(),
  style: z.array(z.string()).optional(),
  gender: z.string().optional(),
  source: z.object({
    platform: z.string(),
    id: z.string(),
    raw: z.record(z.any()).optional()
  })
});

export type Listing = z.infer<typeof ListingSchema>;

// eBay-specific data structure (what we'll scrape)
export const EbayListingSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  price: z.string(),
  condition: z.string().optional(),
  brand: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  category: z.string().optional(),
  images: z.array(z.string()),
  gender: z.string().optional(),
  material: z.string().optional(),
  style: z.string().optional(),
  url: z.string(),
  seller: z.string().optional()
});

export type EbayListing = z.infer<typeof EbayListingSchema>;

// Poshmark form fields (what we'll fill)
export const PoshmarkFormSchema = z.object({
  title: z.string(),
  description: z.string(),
  brand: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  condition: z.string().optional(),
  price: z.number(),
  category: z.string().optional(),
  gender: z.string().optional(),
  material: z.string().optional(),
  style: z.string().optional()
});

export type PoshmarkForm = z.infer<typeof PoshmarkFormSchema>;
