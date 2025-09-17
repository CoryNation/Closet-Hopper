
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
        } else if (request.action === 'toggleTopBar') {
          this.toggleTopBar();
          sendResponse({ success: true });
        }
      });

      // Add keyboard shortcut listener
      document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Shift + H to toggle top bar
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'H') {
          e.preventDefault();
          this.toggleTopBar();
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

      // Create top bar that sits above browser content
      this.createTopBar();
    }

    private createTopBar() {
      // Create the top bar container
      const topBar = document.createElement('div');
      topBar.id = 'closet-hopper-topbar';
      topBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 48px;
        background: linear-gradient(135deg, #e6007e 0%, #ff6b9d 100%);
        border-bottom: 2px solid #d4006b;
        z-index: 2147483647;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 16px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;

      // Create left side with logo and title
      const leftSection = document.createElement('div');
      leftSection.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
      `;
      leftSection.innerHTML = `
        <div style="font-size: 20px;">🦘</div>
        <div style="color: white; font-weight: bold; font-size: 16px;">Closet Hopper</div>
      `;

      // Create center section with action buttons
      const centerSection = document.createElement('div');
      centerSection.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
      `;
      centerSection.innerHTML = `
        <button id="selectDataFolder" style="
          background: rgba(255,255,255,0.2);
          color: white;
          border: 1px solid rgba(255,255,255,0.3);
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.2s ease;
        " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
          📁 Select Folder
        </button>
        <button id="selectAllListings" style="
          background: rgba(255,255,255,0.2);
          color: white;
          border: 1px solid rgba(255,255,255,0.3);
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.2s ease;
        " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
          Select All
        </button>
        <button id="extractSelected" style="
          background: #28a745;
          color: white;
          border: 1px solid #1e7e34;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.2s ease;
        " onmouseover="this.style.background='#218838'" onmouseout="this.style.background='#28a745'">
          Extract (0)
        </button>
      `;

      // Create right section with status and close button
      const rightSection = document.createElement('div');
      rightSection.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
      `;
      rightSection.innerHTML = `
        <div id="extractionStatus" style="
          color: white;
          font-size: 12px;
          font-weight: 500;
          min-width: 120px;
          text-align: right;
        ">Ready to extract</div>
        <button id="closeTopBar" style="
          background: rgba(255,255,255,0.2);
          color: white;
          border: 1px solid rgba(255,255,255,0.3);
          padding: 6px 10px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: bold;
          transition: all 0.2s ease;
        " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
          ✕
        </button>
      `;

      // Assemble the top bar
      topBar.appendChild(leftSection);
      topBar.appendChild(centerSection);
      topBar.appendChild(rightSection);

      // Add to document
      document.documentElement.appendChild(topBar);

      // Add folder status indicator (hidden by default)
      const folderStatus = document.createElement('div');
      folderStatus.id = 'folderStatus';
      folderStatus.style.cssText = `
        position: fixed;
        top: 50px;
        left: 16px;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        z-index: 2147483646;
        display: none;
      `;
      document.documentElement.appendChild(folderStatus);

      // Adjust body margin to account for top bar
      document.body.style.marginTop = '48px';

      // Add event listeners
      this.addTopBarEventListeners();
    }

    private addTopBarEventListeners() {
      document.getElementById('selectDataFolder')?.addEventListener('click', () => {
        this.selectDataFolder();
      });

      document.getElementById('selectAllListings')?.addEventListener('click', () => {
        this.selectAllListings();
      });

      document.getElementById('extractSelected')?.addEventListener('click', () => {
        this.extractSelectedListings();
      });

      document.getElementById('closeTopBar')?.addEventListener('click', () => {
        this.closeTopBar();
      });
    }

    private toggleTopBar() {
      const topBar = document.getElementById('closet-hopper-topbar');
      if (topBar) {
        this.closeTopBar();
      } else {
        this.createTopBar();
      }
    }

    private closeTopBar() {
      const topBar = document.getElementById('closet-hopper-topbar');
      const folderStatus = document.getElementById('folderStatus');
      
      if (topBar) {
        topBar.remove();
      }
      if (folderStatus) {
        folderStatus.remove();
      }
      
      // Reset body margin
      document.body.style.marginTop = '';
      
      // Remove any checkboxes that were added
      document.querySelectorAll('.closet-hopper-select').forEach(checkbox => {
        checkbox.remove();
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
          status.style.display = 'block';
          // Hide after 3 seconds
          setTimeout(() => {
            status.style.display = 'none';
          }, 3000);
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
          status.style.display = 'block';
          // Hide after 3 seconds
          setTimeout(() => {
            status.style.display = 'none';
          }, 3000);
        }
      }
    }

    private selectAllListings() {
      // Find all listing items on the page with more specific selectors
      // These selectors target actual listing items, not summary bars or other UI elements
      const selectors = [
        // Most specific selectors for eBay's current structure
        '.s-item[data-view="item"]:not(.s-item--watch-at-angle)',
        '.s-item:not(.s-item--watch-at-angle):not(.grid-summary-bar):not(.app-summary-bar)',
        // Look for items that contain listing-specific elements
        '.s-item:has(.s-item__title):not(.grid-summary-bar):not(.app-summary-bar)',
        '.s-item:has(.s-item__price):not(.grid-summary-bar):not(.app-summary-bar)',
        '.s-item:has(.s-item__image):not(.grid-summary-bar):not(.app-summary-bar)',
        // Alternative selectors
        '[data-testid="item-card"]',
        '.item-card',
        '.listing-item',
        // More general selectors but with exclusions
        '.s-item:not(.grid-summary-bar):not(.app-summary-bar):not(.navigation):not(.header)',
        '.item:not(.grid-summary-bar):not(.app-summary-bar):not(.navigation):not(.header)'
      ];
      
      let listings: NodeListOf<Element> | null = null;
      let usedSelector = '';
      
      for (const selector of selectors) {
        const found = document.querySelectorAll(selector);
        console.log(`Trying selector "${selector}": found ${found.length} elements`);
        
        // Filter out summary bars and other non-listing elements
        const filtered = Array.from(found).filter(item => {
          const element = item as HTMLElement;
          // Exclude elements that are clearly not listings
          const isNotSummaryBar = !element.classList.contains('grid-summary-bar') &&
                                 !element.classList.contains('app-summary-bar') &&
                                 !element.classList.contains('navigation') &&
                                 !element.classList.contains('header') &&
                                 !element.closest('.grid-summary-bar') &&
                                 !element.closest('.app-summary-bar');
          
          // Must have some indication it's a listing (title, price, or image)
          const hasListingContent = element.querySelector('.s-item__title, .item-title, [data-testid="item-title"], .listing-title, h3, h4, .s-item__price, .item-price, [data-testid="item-price"], .price, img') !== null;
          
          return isNotSummaryBar && hasListingContent;
        });
        
        console.log(`After filtering: ${filtered.length} valid listings`);
        
        if (filtered.length > 0) {
          listings = filtered as NodeListOf<Element>;
          usedSelector = selector;
          break;
        }
      }
      
      console.log(`Using selector: "${usedSelector}" with ${listings?.length || 0} listings`);

      // If no listings found with selectors, try a different approach
      if (!listings || listings.length === 0) {
        console.log('No listings found with selectors, trying alternative approach...');
        
        // Look for the main listing grid container
        const gridContainer = document.querySelector('.srp-results, .listings-container, .items-grid, .listings-grid, [data-testid="srp-results"]');
        if (gridContainer) {
          console.log('Found grid container, looking for items within it...');
          const itemsInGrid = gridContainer.querySelectorAll('.s-item, .item, [data-testid="item-card"]');
          const filteredItems = Array.from(itemsInGrid).filter(item => {
            const element = item as HTMLElement;
            return !element.classList.contains('grid-summary-bar') &&
                   !element.classList.contains('app-summary-bar') &&
                   !element.closest('.grid-summary-bar') &&
                   !element.closest('.app-summary-bar') &&
                   (element.querySelector('.s-item__title, .item-title, [data-testid="item-title"], .listing-title, h3, h4, .s-item__price, .item-price, [data-testid="item-price"], .price, img') !== null);
          });
          
          if (filteredItems.length > 0) {
            listings = filteredItems as NodeListOf<Element>;
            console.log(`Found ${listings.length} listings in grid container`);
          }
        }
      }

      if (!listings || listings.length === 0) {
        const status = document.getElementById('extractionStatus');
        if (status) status.textContent = 'No listings found';
        return;
      }

      // Update status to show how many listings were found
      const status = document.getElementById('extractionStatus');
      if (status) status.textContent = `Found ${listings.length} listings`;
      
      listings.forEach((listing, index) => {
        // Check if checkbox already exists
        if (listing.querySelector('.closet-hopper-select')) return;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'closet-hopper-select';
        checkbox.dataset.index = index.toString();
        checkbox.style.cssText = `
          margin-right: 8px;
          transform: scale(1.3);
          accent-color: #e6007e;
          cursor: pointer;
          position: relative;
          z-index: 1000;
        `;
        
        // Add checkbox to listing with better positioning
        // Try to find the best place to add the checkbox
        const titleElement = listing.querySelector('.s-item__title, .item-title, [data-testid="item-title"], .listing-title, h3, h4');
        const imageElement = listing.querySelector('.s-item__image, .item-image, img');
        const priceElement = listing.querySelector('.s-item__price, .item-price, [data-testid="item-price"], .price');
        
        if (titleElement) {
          // Add checkbox before the title
          (titleElement as HTMLElement).style.position = 'relative';
          (titleElement as HTMLElement).style.display = 'flex';
          (titleElement as HTMLElement).style.alignItems = 'center';
          titleElement.insertBefore(checkbox, titleElement.firstChild);
        } else if (imageElement) {
          // Add checkbox to the image container
          (imageElement as HTMLElement).style.position = 'relative';
          imageElement.insertBefore(checkbox, imageElement.firstChild);
        } else if (priceElement) {
          // Add checkbox before the price
          (priceElement as HTMLElement).style.position = 'relative';
          (priceElement as HTMLElement).style.display = 'flex';
          (priceElement as HTMLElement).style.alignItems = 'center';
          priceElement.insertBefore(checkbox, priceElement.firstChild);
        } else {
          // Fallback: add to the listing element itself, but only if it's not a summary bar
          if (!listing.classList.contains('grid-summary-bar') && !listing.classList.contains('app-summary-bar')) {
            (listing as HTMLElement).style.position = 'relative';
            (listing as HTMLElement).style.paddingLeft = '25px';
            listing.insertBefore(checkbox, listing.firstChild);
          }
        }
      });

      this.updateExtractButton();
    }
  
    private updateExtractButton() {
      const selected = document.querySelectorAll('.closet-hopper-select:checked').length;
      const button = document.getElementById('extractSelected');
      if (button) {
        button.textContent = `Extract (${selected})`;
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
          status.textContent = `✅ Extracted ${data.length}`;
        }

      } catch (error) {
        console.error('Error saving extracted data:', error);
        const status = document.getElementById('extractionStatus');
        if (status) {
          status.textContent = '❌ Error saving';
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
  
  