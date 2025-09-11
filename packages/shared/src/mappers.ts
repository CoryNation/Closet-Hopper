import { Listing, EbayListing, PoshmarkForm } from './schemas';

// Brand mapping from eBay to Poshmark
const BRAND_MAP: Record<string, string> = {
  'nike': 'Nike',
  'adidas': 'Adidas',
  'lululemon': 'Lululemon',
  'zara': 'Zara',
  'h&m': 'H&M',
  'forever 21': 'Forever 21',
  'urban outfitters': 'Urban Outfitters',
  'anthropologie': 'Anthropologie',
  'free people': 'Free People',
  'madewell': 'Madewell',
  'j.crew': 'J.Crew',
  'banana republic': 'Banana Republic',
  'gap': 'Gap',
  'old navy': 'Old Navy',
  'target': 'Target',
  'walmart': 'Walmart',
  'amazon': 'Amazon',
  'shein': 'SHEIN',
  'asos': 'ASOS',
  'boohoo': 'Boohoo'
};

// Size mapping
const SIZE_MAP: Record<string, string> = {
  'xs': 'XS',
  'small': 'S',
  'medium': 'M',
  'large': 'L',
  'xl': 'XL',
  'xxl': 'XXL',
  'xxxl': 'XXXL',
  '0': '0',
  '2': '2',
  '4': '4',
  '6': '6',
  '8': '8',
  '10': '10',
  '12': '12',
  '14': '14',
  '16': '16',
  '18': '18',
  '20': '20'
};

// Condition mapping
const CONDITION_MAP: Record<string, string> = {
  'new with tags': 'New with tags',
  'new without tags': 'New without tags',
  'like new': 'Like new',
  'excellent': 'Excellent',
  'very good': 'Very good',
  'good': 'Good',
  'fair': 'Fair',
  'poor': 'Poor'
};

// Category mapping (eBay -> Poshmark)
const CATEGORY_MAP: Record<string, string[]> = {
  'women\'s clothing': ['Women', 'Clothing'],
  'men\'s clothing': ['Men', 'Clothing'],
  'shoes': ['Shoes'],
  'handbags': ['Handbags'],
  'jewelry': ['Jewelry'],
  'accessories': ['Accessories'],
  'beauty': ['Beauty'],
  'home': ['Home']
};

export function normalizeBrand(brand?: string): string | undefined {
  if (!brand) return undefined;
  const normalized = brand.toLowerCase().trim();
  return BRAND_MAP[normalized] || brand;
}

export function normalizeSize(size?: string): string | undefined {
  if (!size) return undefined;
  const normalized = size.toLowerCase().trim();
  return SIZE_MAP[normalized] || size;
}

export function normalizeCondition(condition?: string): string | undefined {
  if (!condition) return undefined;
  const normalized = condition.toLowerCase().trim();
  return CONDITION_MAP[normalized] || condition;
}

export function normalizeCategory(category?: string): string[] | undefined {
  if (!category) return undefined;
  const normalized = category.toLowerCase().trim();
  return CATEGORY_MAP[normalized] || [category];
}

export function parsePrice(priceStr: string): number {
  // Remove currency symbols and parse
  const cleaned = priceStr.replace(/[$,]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export function ebayToListing(ebay: EbayListing): Listing {
  return {
    sku: ebay.id,
    title: ebay.title,
    description: ebay.description,
    brand: normalizeBrand(ebay.brand),
    category_guess: normalizeCategory(ebay.category),
    size: normalizeSize(ebay.size),
    color: ebay.color ? [ebay.color] : undefined,
    condition: normalizeCondition(ebay.condition),
    original_price: parsePrice(ebay.price),
    list_price: parsePrice(ebay.price),
    images: ebay.images,
    material: ebay.material ? [ebay.material] : undefined,
    style: ebay.style ? [ebay.style] : undefined,
    gender: ebay.gender,
    source: {
      platform: 'ebay',
      id: ebay.id,
      raw: ebay
    }
  };
}

export function listingToPoshmark(listing: Listing): PoshmarkForm {
  return {
    title: listing.title,
    description: listing.description,
    brand: listing.brand,
    size: listing.size,
    color: listing.color?.[0],
    condition: listing.condition,
    price: listing.list_price,
    category: listing.category_guess?.[0],
    gender: listing.gender,
    material: listing.material?.[0],
    style: listing.style?.[0]
  };
}
