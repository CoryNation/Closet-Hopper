// Core data types for Closet Hopper extension

export interface ListingData {
  // Core identification
  id: string;
  sourceUrl: string;
  downloadedAt: string;
  
  // Poshmark required fields
  photos: string[]; // Array of image URLs
  category: string;
  subcategory: string;
  title: string;
  description: string;
  brand: string;
  price: number; // in cents
  size: string;
  newWithTags: boolean;
  
  // Limited selections
  colors: string[]; // Max 2 from predefined list
  styleTags: string[]; // Max 3
  
  // Status tracking
  status: 'downloaded' | 'edited' | 'listed' | 'archived';
  listedAt?: string;
  poshmarkUrl?: string;
  
  // eBay specific data
  condition?: string;
  itemId?: string;
  sellerId?: string;
}

export interface ExtractedEbayData {
  // Basic info
  title: string;
  price: string;
  condition: string;
  imageUrl: string;
  listingUrl: string;
  itemId: string;
  
  // Detailed info (from individual listing page)
  description?: string;
  brand?: string;
  size?: string;
  category?: string;
  subcategory?: string;
  photos?: string[];
  sellerId?: string;
  
  // Metadata
  extractedAt: string;
  source: 'ebay';
}

export interface PoshmarkFormData {
  // Required fields for Poshmark
  title: string;
  description: string;
  brand: string;
  price: number; // in cents
  size: string;
  category: string;
  subcategory: string;
  condition: 'new' | 'like_new' | 'good' | 'fair';
  newWithTags: boolean;
  colors: string[];
  styleTags: string[];
  photos: string[];
}

// Predefined color options for Poshmark
export const POSHMARK_COLORS = [
  'Red', 'Pink', 'Orange', 'Yellow', 'Green', 'Blue', 
  'Purple', 'Gold', 'Silver', 'Black', 'Gray', 'White', 
  'Cream', 'Brown', 'Tan'
] as const;

export type PoshmarkColor = typeof POSHMARK_COLORS[number];

// Poshmark categories mapping
export const POSHMARK_CATEGORIES = {
  'Women': {
    'Dresses': ['Casual', 'Cocktail', 'Formal', 'Maxi', 'Mini', 'Midi', 'Wrap', 'Shift', 'A-Line', 'Bodycon'],
    'Tops': ['Blouses', 'T-Shirts', 'Tank Tops', 'Sweaters', 'Hoodies', 'Cardigans', 'Crop Tops', 'Tunics'],
    'Bottoms': ['Jeans', 'Pants', 'Shorts', 'Skirts', 'Leggings', 'Joggers', 'Trousers'],
    'Outerwear': ['Jackets', 'Coats', 'Blazers', 'Vests', 'Ponchos', 'Kimonos'],
    'Shoes': ['Heels', 'Flats', 'Boots', 'Sneakers', 'Sandals', 'Loafers', 'Oxfords'],
    'Bags': ['Handbags', 'Clutches', 'Totes', 'Crossbody', 'Backpacks', 'Satchels'],
    'Accessories': ['Jewelry', 'Scarves', 'Belts', 'Hats', 'Sunglasses', 'Watches']
  },
  'Men': {
    'Tops': ['T-Shirts', 'Dress Shirts', 'Polo Shirts', 'Sweaters', 'Hoodies', 'Tank Tops'],
    'Bottoms': ['Jeans', 'Pants', 'Shorts', 'Joggers', 'Trousers', 'Chinos'],
    'Outerwear': ['Jackets', 'Coats', 'Blazers', 'Vests', 'Sweaters'],
    'Shoes': ['Sneakers', 'Dress Shoes', 'Boots', 'Sandals', 'Loafers', 'Oxfords'],
    'Accessories': ['Watches', 'Belts', 'Hats', 'Sunglasses', 'Ties', 'Wallets']
  }
} as const;

export interface FileSystemHandle {
  kind: 'file' | 'directory';
  name: string;
  getFile(): Promise<File>;
  createWritable(): Promise<FileSystemWritableFileStream>;
}

export interface DirectoryHandle extends FileSystemHandle {
  kind: 'directory';
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileHandle>;
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<DirectoryHandle>;
  removeEntry(name: string, options?: { recursive?: boolean }): Promise<void>;
  keys(): AsyncIterableIterator<string>;
  values(): AsyncIterableIterator<FileSystemHandle>;
  entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
}

export interface FileHandle extends FileSystemHandle {
  kind: 'file';
}
