
import { ExtractedEbayData, ListingData, POSHMARK_COLORS } from './types';

// eBay content script for extracting listing data
class EbayDataExtractor {
    private isExtracting = false;
    private extractedData: ExtractedEbayData[] = [];
    private dataFolder: FileSystemDirectoryHandle | null = null;
  
    constructor() {
      this.init();
    }
  
    private init() {
      // Listen for messages from popup
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'extractListings') {
          this.extractSelectedListings();
          sendResponse({ success: true });
        } else if (request.action === 'selectDataFolder') {
          this.selectDataFolder();
          sendResponse({ success: true });
        }
      });
  
      // Add extraction UI to eBay pages
      this.addExtractionUI();
    }
  
    private addExtractionUI() {
      // Only add UI to eBay listing pages
      if (!window.location.href.includes('ebay.com/sh/lst/')) {
        return;
      }

      const ui = document.createElement('div');
      ui.id = 'closet-hopper-ui';
      ui.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; background: white; border: 2px solid #e6007e; border-radius: 10px; padding: 15px; z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.15); min-width: 250px;">
          <h3 style="margin: 0 0 10px 0; color: #e6007e; font-size: 16px; font-weight: bold;">🦘 Closet Hopper</h3>
          <div style="margin-bottom: 10px;">
            <button id="selectDataFolder" style="width: 100%; padding: 6px; margin: 2px 0; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">📁 Select Data Folder</button>
            <div id="folderStatus" style="font-size: 10px; color: #666; margin-top: 2px;"></div>
          </div>
          <button id="selectAllListings" style="width: 100%; padding: 8px; margin: 5px 0; background: #e6007e; color: white; border: none; border-radius: 5px; cursor: pointer;">Select All Visible</button>
          <button id="extractSelected" style="width: 100%; padding: 8px; margin: 5px 0; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer;">Extract Selected (0)</button>
          <div id="extractionStatus" style="font-size: 12px; color: #666; margin-top: 10px;"></div>
        </div>
      `;

      document.body.appendChild(ui);

      // Add event listeners
      document.getElementById('selectDataFolder')?.addEventListener('click', () => {
        this.selectDataFolder();
      });

      document.getElementById('selectAllListings')?.addEventListener('click', () => {
        this.selectAllListings();
      });

      document.getElementById('extractSelected')?.addEventListener('click', () => {
        this.extractSelectedListings();
      });
    }
  
    private async selectDataFolder() {
      try {
        // Check if File System Access API is supported
        if (!('showDirectoryPicker' in window)) {
          const status = document.getElementById('folderStatus');
          if (status) status.textContent = 'File System API not supported';
          return;
        }

        // Request directory access
        const directoryHandle = await (window as any).showDirectoryPicker({
          mode: 'readwrite'
        });

        this.dataFolder = directoryHandle;
        
        const status = document.getElementById('folderStatus');
        if (status) {
          status.textContent = `📁 ${directoryHandle.name}`;
          status.style.color = '#28a745';
        }

        // Save folder reference to storage
        await chrome.storage.local.set({ 
          dataFolder: { 
            name: directoryHandle.name,
            // Note: We can't serialize the handle, so we'll store the name
            // and re-request access when needed
          }
        });

      } catch (error) {
        console.error('Error selecting data folder:', error);
        const status = document.getElementById('folderStatus');
        if (status) {
          status.textContent = 'Folder selection cancelled';
          status.style.color = '#dc3545';
        }
      }
    }

    private selectAllListings() {
      // Find all listing items on the page with multiple selectors for reliability
      const selectors = [
        '[data-testid="item-card"]',
        '.s-item',
        '.item',
        '.listing-item',
        '.ebay-item',
        '[data-view="item"]'
      ];
      
      let listings: NodeListOf<Element> | null = null;
      for (const selector of selectors) {
        listings = document.querySelectorAll(selector);
        if (listings.length > 0) break;
      }

      if (!listings || listings.length === 0) {
        const status = document.getElementById('extractionStatus');
        if (status) status.textContent = 'No listings found on this page';
        return;
      }
      
      listings.forEach((listing, index) => {
        // Check if checkbox already exists
        if (listing.querySelector('.closet-hopper-select')) return;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'closet-hopper-select';
        checkbox.dataset.index = index.toString();
        checkbox.style.marginRight = '8px';
        checkbox.style.transform = 'scale(1.2)';
        
        // Add checkbox to listing with multiple fallback positions
        const titleElement = listing.querySelector('.s-item__title, .item-title, [data-testid="item-title"], .listing-title, h3, h4');
        if (titleElement) {
          (titleElement as HTMLElement).style.position = 'relative';
          (titleElement as HTMLElement).style.display = 'flex';
          (titleElement as HTMLElement).style.alignItems = 'center';
          titleElement.insertBefore(checkbox, titleElement.firstChild);
        } else {
          // Fallback: add to the listing element itself
          (listing as HTMLElement).style.position = 'relative';
          (listing as HTMLElement).style.paddingLeft = '25px';
          listing.insertBefore(checkbox, listing.firstChild);
        }
      });

      this.updateExtractButton();
    }
  
    private updateExtractButton() {
      const selected = document.querySelectorAll('.closet-hopper-select:checked').length;
      const button = document.getElementById('extractSelected');
      if (button) {
        button.textContent = `Extract Selected (${selected})`;
      }
    }
  
    private async extractSelectedListings() {
      if (this.isExtracting) return;
      
      this.isExtracting = true;
      const status = document.getElementById('extractionStatus');
      if (status) status.textContent = 'Extracting data...';
  
      const selectedCheckboxes = document.querySelectorAll('.closet-hopper-select:checked');
      const extractedData: any[] = [];
  
      for (const checkbox of selectedCheckboxes) {
        const listingElement = checkbox.closest('[data-testid="item-card"], .s-item, .item');
        if (listingElement) {
          const listingData = this.extractListingData(listingElement);
          if (listingData) {
            extractedData.push(listingData);
          }
        }
      }
  
      // Save extracted data
      await this.saveExtractedData(extractedData);
  
      if (status) {
        status.textContent = `✅ Extracted ${extractedData.length} listings`;
      }
  
      this.isExtracting = false;
    }
  
    private extractListingData(listingElement: Element): ExtractedEbayData | null {
      try {
        // Extract title with multiple selectors
        const titleSelectors = [
          '.s-item__title',
          '.item-title',
          '[data-testid="item-title"]',
          '.listing-title',
          'h3',
          'h4',
          '.title'
        ];
        const title = this.extractText(listingElement, titleSelectors);

        // Extract price with multiple selectors
        const priceSelectors = [
          '.s-item__price',
          '.item-price',
          '[data-testid="item-price"]',
          '.price',
          '.current-price',
          '.bid-price'
        ];
        const price = this.extractText(listingElement, priceSelectors);

        // Extract condition
        const conditionSelectors = [
          '.s-item__condition',
          '.item-condition',
          '.condition',
          '.item-condition-text'
        ];
        const condition = this.extractText(listingElement, conditionSelectors);

        // Extract image with multiple selectors
        const imgSelectors = [
          'img[data-testid="item-image"]',
          '.s-item__image img',
          '.item-image img',
          'img'
        ];
        const imageUrl = this.extractImageUrl(listingElement, imgSelectors);

        // Extract link
        const linkSelectors = [
          'a[data-testid="item-link"]',
          '.s-item__link',
          '.item-link',
          'a'
        ];
        const listingUrl = this.extractLink(listingElement, linkSelectors);

        // Extract item ID from URL
        const itemId = this.extractItemId(listingUrl);

        // Extract seller ID if available
        const sellerSelectors = [
          '.s-item__seller',
          '.seller-info',
          '.seller-name'
        ];
        const sellerId = this.extractText(listingElement, sellerSelectors);

        return {
          title,
          price,
          condition,
          imageUrl,
          listingUrl,
          itemId,
          sellerId,
          extractedAt: new Date().toISOString(),
          source: 'ebay'
        };
      } catch (error) {
        console.error('Error extracting listing data:', error);
        return null;
      }
    }

    private extractText(element: Element, selectors: string[]): string {
      for (const selector of selectors) {
        const found = element.querySelector(selector);
        if (found) {
          const text = found.textContent?.trim();
          if (text) return text;
        }
      }
      return '';
    }

    private extractImageUrl(element: Element, selectors: string[]): string {
      for (const selector of selectors) {
        const img = element.querySelector(selector) as HTMLImageElement;
        if (img && img.src) {
          // Prefer higher resolution images
          if (img.src.includes('_1.JPG') || img.src.includes('_1.jpg')) {
            return img.src;
          }
          return img.src;
        }
      }
      return '';
    }

    private extractLink(element: Element, selectors: string[]): string {
      for (const selector of selectors) {
        const link = element.querySelector(selector) as HTMLAnchorElement;
        if (link && link.href) {
          return link.href;
        }
      }
      return '';
    }

    private extractItemId(url: string): string {
      const match = url.match(/\/itm\/([^\/\?]+)/);
      return match ? match[1] : '';
    }
  
    private async saveExtractedData(data: ExtractedEbayData[]) {
      if (data.length === 0) return;

      try {
        // Save to local storage for extension access
        const existingData = await chrome.storage.local.get(['extractedListings']);
        const allData = existingData.extractedListings || [];
        allData.push(...data);
        await chrome.storage.local.set({ extractedListings: allData });

        // Save to file system if folder is selected
        if (this.dataFolder) {
          await this.saveToFileSystem(data);
        } else {
          // Fallback: download as JSON file
          await this.downloadAsJson(data);
        }

        // Update status
        const status = document.getElementById('extractionStatus');
        if (status) {
          status.textContent = `✅ Extracted ${data.length} listings`;
          status.style.color = '#28a745';
        }

      } catch (error) {
        console.error('Error saving extracted data:', error);
        const status = document.getElementById('extractionStatus');
        if (status) {
          status.textContent = '❌ Error saving data';
          status.style.color = '#dc3545';
        }
      }
    }

    private async saveToFileSystem(data: ExtractedEbayData[]) {
      if (!this.dataFolder) return;

      try {
        // Create a folder for today's extractions
        const today = new Date().toISOString().split('T')[0];
        const folderName = `ebay-extractions-${today}`;
        
        let extractionFolder: FileSystemDirectoryHandle;
        try {
          extractionFolder = await this.dataFolder.getDirectoryHandle(folderName, { create: true });
        } catch (error) {
          console.error('Error creating extraction folder:', error);
          return;
        }

        // Save each listing as individual JSON file
        for (let i = 0; i < data.length; i++) {
          const listing = data[i];
          const fileName = `${listing.itemId || `listing-${i}`}.json`;
          
          try {
            const fileHandle = await extractionFolder.getFileHandle(fileName, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(JSON.stringify(listing, null, 2));
            await writable.close();
          } catch (error) {
            console.error(`Error saving file ${fileName}:`, error);
          }
        }

        // Also save a summary file
        const summaryFileName = `extraction-summary-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        try {
          const summaryHandle = await extractionFolder.getFileHandle(summaryFileName, { create: true });
          const writable = await summaryHandle.createWritable();
          await writable.write(JSON.stringify({
            extractedAt: new Date().toISOString(),
            totalListings: data.length,
            listings: data
          }, null, 2));
          await writable.close();
        } catch (error) {
          console.error('Error saving summary file:', error);
        }

      } catch (error) {
        console.error('Error saving to file system:', error);
        // Fallback to download
        await this.downloadAsJson(data);
      }
    }

    private async downloadAsJson(data: ExtractedEbayData[]) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `closet-hopper-listings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }
  
  // Initialize the extractor
  new EbayDataExtractor();
  
  