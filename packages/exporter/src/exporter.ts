import puppeteer, { Browser, Page } from 'puppeteer';
import fs from 'fs-extra';
import path from 'path';
import axios from 'axios';
import pLimit from 'p-limit';
import ora from 'ora';
import chalk from 'chalk';
import { EbayListingSchema, ListingSchema, ebayToListing } from '@closet-hopper/shared';

export interface ExporterOptions {
  username: string;
  outputDir: string;
  limit: number;
  headless: boolean;
}

export interface ExportResults {
  valid: number;
  invalid: number;
  errors: string[];
}

export class EbayExporter {
  private browser: Browser | null = null;
  private options: ExporterOptions;

  constructor(options: ExporterOptions) {
    this.options = options;
  }

  async export(): Promise<void> {
    const spinner = ora('Starting eBay export...').start();
    
    try {
      // Create output directory
      await fs.ensureDir(this.options.outputDir);
      
      // Launch browser
      spinner.text = 'Launching browser...';
      this.browser = await puppeteer.launch({
        headless: this.options.headless,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      // Get listings
      spinner.text = 'Fetching eBay listings...';
      const listings = await this.fetchListings();
      
      if (listings.length === 0) {
        spinner.fail('No listings found');
        return;
      }

      spinner.text = `Processing ${listings.length} listings...`;
      
      // Process listings with concurrency limit
      const limit = pLimit(3); // Limit concurrent operations
      const promises = listings.map(listing => 
        limit(() => this.processListing(listing))
      );
      
      await Promise.all(promises);
      
      spinner.succeed(`Exported ${listings.length} listings successfully`);
      
    } catch (error) {
      spinner.fail('Export failed');
      throw error;
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  private async fetchListings(): Promise<any[]> {
    if (!this.browser) throw new Error('Browser not initialized');
    
    const page = await this.browser.newPage();
    
    try {
      // Navigate to seller's listings page
      const url = `https://www.ebay.com/sch/${this.options.username}/m.html`;
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      // Wait for listings to load
      await page.waitForSelector('.s-item', { timeout: 10000 });
      
      // Extract listing data
      const listings = await page.evaluate(() => {
        const items = document.querySelectorAll('.s-item');
        const results: any[] = [];
        
        items.forEach((item, index) => {
          if (index === 0) return; // Skip first item (usually a header)
          
          const titleEl = item.querySelector('.s-item__title');
          const priceEl = item.querySelector('.s-item__price');
          const linkEl = item.querySelector('.s-item__link');
          const imageEl = item.querySelector('.s-item__image img');
          
          if (titleEl && priceEl && linkEl) {
            const title = titleEl.textContent?.trim() || '';
            const price = priceEl.textContent?.trim() || '';
            const link = (linkEl as HTMLAnchorElement).href;
            const image = (imageEl as HTMLImageElement)?.src || '';
            
            // Extract item ID from link
            const idMatch = link.match(/\/itm\/(\d+)/);
            const id = idMatch ? idMatch[1] : `item_${index}`;
            
            results.push({
              id,
              title,
              price,
              link,
              image,
              url: link
            });
          }
        });
        
        return results;
      });
      
      return listings.slice(0, this.options.limit);
      
    } finally {
      await page.close();
    }
  }

  private async processListing(listingData: any): Promise<void> {
    if (!this.browser) return;
    
    const page = await this.browser.newPage();
    
    try {
      // Navigate to listing page
      await page.goto(listingData.url, { waitUntil: 'networkidle2' });
      
      // Extract detailed listing information
      const detailedData = await page.evaluate(() => {
        const data: any = {};
        
        // Description
        const descEl = document.querySelector('#desc_div, .u-flL.condText, .u-flL.condText span');
        if (descEl) {
          data.description = descEl.textContent?.trim() || '';
        }
        
        // Condition
        const conditionEl = document.querySelector('.u-flL.condText, .u-flL.condText span');
        if (conditionEl) {
          data.condition = conditionEl.textContent?.trim() || '';
        }
        
        // Brand (try multiple selectors)
        const brandEl = document.querySelector('[data-testid="x-ebay-brand"], .u-flL.condText, .attrLabels');
        if (brandEl) {
          data.brand = brandEl.textContent?.trim() || '';
        }
        
        // Size
        const sizeEl = document.querySelector('[data-testid="x-ebay-size"], .u-flL.condText');
        if (sizeEl) {
          data.size = sizeEl.textContent?.trim() || '';
        }
        
        // Color
        const colorEl = document.querySelector('[data-testid="x-ebay-color"], .u-flL.condText');
        if (colorEl) {
          data.color = colorEl.textContent?.trim() || '';
        }
        
        // Category
        const categoryEl = document.querySelector('.breadcrumbs a:last-child');
        if (categoryEl) {
          data.category = categoryEl.textContent?.trim() || '';
        }
        
        // Images
        const imageEls = document.querySelectorAll('.img img, .img img[data-src]');
        data.images = Array.from(imageEls).map(img => (img as HTMLImageElement).src || (img as HTMLImageElement).getAttribute('data-src') || '').filter(Boolean);
        
        return data;
      });
      
      // Combine with basic data
      const fullListing = {
        ...listingData,
        ...detailedData,
        description: detailedData.description || listingData.title,
        images: detailedData.images.length > 0 ? detailedData.images : [listingData.image]
      };
      
      // Validate and convert to our schema
      const ebayListing = EbayListingSchema.parse(fullListing);
      const listing = ebayToListing(ebayListing);
      
      // Create folder for this listing
      const folderName = `${listing.sku}_${listing.title.substring(0, 50).replace(/[^a-zA-Z0-9]/g, '_')}`;
      const folderPath = path.join(this.options.outputDir, folderName);
      await fs.ensureDir(folderPath);
      
      // Save listing.json
      await fs.writeJson(path.join(folderPath, 'listing.json'), listing, { spaces: 2 });
      
      // Download images
      await this.downloadImages(listing.images, folderPath);
      
      console.log(chalk.green(`✅ Processed: ${listing.title}`));
      
    } catch (error) {
      console.error(chalk.red(`❌ Failed to process ${listingData.title}:`), error);
    } finally {
      await page.close();
    }
  }

  private async downloadImages(imageUrls: string[], folderPath: string): Promise<void> {
    const limit = pLimit(2); // Limit concurrent downloads
    
    const promises = imageUrls.map((url, index) => 
      limit(async () => {
        try {
          const response = await axios.get(url, { 
            responseType: 'arraybuffer',
            timeout: 10000 
          });
          
          const extension = path.extname(url) || '.jpg';
          const filename = `image_${index + 1}${extension}`;
          const filepath = path.join(folderPath, filename);
          
          await fs.writeFile(filepath, response.data);
        } catch (error) {
          console.warn(chalk.yellow(`⚠️  Failed to download image: ${url}`));
        }
      })
    );
    
    await Promise.all(promises);
  }

  async validateExports(): Promise<ExportResults> {
    const results: ExportResults = {
      valid: 0,
      invalid: 0,
      errors: []
    };
    
    try {
      const folders = await fs.readdir(this.options.outputDir);
      
      for (const folder of folders) {
        const folderPath = path.join(this.options.outputDir, folder);
        const stat = await fs.stat(folderPath);
        
        if (stat.isDirectory()) {
          const listingPath = path.join(folderPath, 'listing.json');
          
          if (await fs.pathExists(listingPath)) {
            try {
              const listingData = await fs.readJson(listingPath);
              ListingSchema.parse(listingData);
              results.valid++;
            } catch (error) {
              results.invalid++;
              results.errors.push(`Invalid listing in ${folder}: ${error}`);
            }
          } else {
            results.invalid++;
            results.errors.push(`Missing listing.json in ${folder}`);
          }
        }
      }
    } catch (error) {
      results.errors.push(`Validation error: ${error}`);
    }
    
    return results;
  }
}
