import { ListingSchema, listingToPoshmark } from '@closet-hopper/shared';
import { isLicensed } from './license';

// Content script for Poshmark create listing page
class PoshmarkAssistant {
  private isActive = false;
  private dropzone: HTMLElement | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    // Check if we're on the create listing page
    if (!this.isCreateListingPage()) {
      return;
    }

    // Check license
    const licensed = await isLicensed();
    if (!licensed) {
      console.log('Closet Hopper: License required');
      return;
    }

    // Wait for page to load
    this.waitForPageLoad();
  }

  private isCreateListingPage(): boolean {
    return window.location.pathname.includes('/create-listing') || 
           window.location.pathname.includes('/sell');
  }

  private waitForPageLoad() {
    // Wait for the form to be available
    const checkForm = () => {
      const titleInput = document.querySelector('input[placeholder*="title"], input[name*="title"]') as HTMLInputElement;
      if (titleInput) {
        this.setupDropzone();
      } else {
        setTimeout(checkForm, 1000);
      }
    };
    checkForm();
  }

  private setupDropzone() {
    if (this.isActive) return;
    
    this.isActive = true;
    
    // Create dropzone overlay
    this.dropzone = document.createElement('div');
    this.dropzone.id = 'closet-hopper-dropzone';
    this.dropzone.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 107, 107, 0.9);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <div style="
          background: white;
          padding: 40px;
          border-radius: 10px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        ">
          <div style="font-size: 48px; margin-bottom: 20px;">🦘</div>
          <h2 style="margin: 0 0 10px 0; color: #333;">Drop your eBay listing folder here</h2>
          <p style="margin: 0; color: #666;">Closet Hopper will fill in the details</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.dropzone);
    
    // Add drag and drop event listeners
    document.addEventListener('dragenter', this.handleDragEnter.bind(this));
    document.addEventListener('dragover', this.handleDragOver.bind(this));
    document.addEventListener('dragleave', this.handleDragLeave.bind(this));
    document.addEventListener('drop', this.handleDrop.bind(this));
    
    console.log('Closet Hopper: Ready to receive listings');
  }

  private handleDragEnter(e: DragEvent) {
    e.preventDefault();
    if (this.dropzone) {
      this.dropzone.style.display = 'flex';
    }
  }

  private handleDragOver(e: DragEvent) {
    e.preventDefault();
  }

  private handleDragLeave(e: DragEvent) {
    e.preventDefault();
    // Only hide if we're leaving the document entirely
    if (e.target === document) {
      if (this.dropzone) {
        this.dropzone.style.display = 'none';
      }
    }
  }

  private async handleDrop(e: DragEvent) {
    e.preventDefault();
    
    if (this.dropzone) {
      this.dropzone.style.display = 'none';
    }

    const items = e.dataTransfer?.items;
    if (!items) return;

    // Look for folder drops
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file') {
        const entry = item.webkitGetAsEntry();
        if (entry?.isDirectory) {
          await this.processFolder(entry);
        }
      }
    }
  }

  private async processFolder(folderEntry: FileSystemDirectoryEntry) {
    try {
      // Look for listing.json in the folder
      const listingFile = await this.findFileInFolder(folderEntry, 'listing.json');
      if (!listingFile) {
        alert('No listing.json found in the dropped folder');
        return;
      }

      // Read and parse the listing
      const listingText = await this.readFile(listingFile);
      const listingData = JSON.parse(listingText);
      
      // Validate against schema
      const listing = ListingSchema.parse(listingData);
      
      // Convert to Poshmark form data
      const poshmarkData = listingToPoshmark(listing);
      
      // Fill the form
      await this.fillPoshmarkForm(poshmarkData);
      
      // Forward images to Poshmark's uploader
      await this.forwardImages(folderEntry, listing.images);
      
      console.log('Closet Hopper: Listing processed successfully');
      
    } catch (error) {
      console.error('Closet Hopper: Error processing folder:', error);
      alert('Error processing listing. Please check the folder contains a valid listing.json file.');
    }
  }

  private async findFileInFolder(folder: FileSystemDirectoryEntry, fileName: string): Promise<FileSystemFileEntry | null> {
    return new Promise((resolve) => {
      folder.createReader().readEntries((entries) => {
        for (const entry of entries) {
          if (entry.name === fileName) {
            resolve(entry as FileSystemFileEntry);
            return;
          }
        }
        resolve(null);
      });
    });
  }

  private async readFile(fileEntry: FileSystemFileEntry): Promise<string> {
    return new Promise((resolve, reject) => {
      fileEntry.file((file) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
      });
    });
  }

  private async fillPoshmarkForm(data: any) {
    // Fill title
    const titleInput = document.querySelector('input[placeholder*="title"], input[name*="title"]') as HTMLInputElement;
    if (titleInput && data.title) {
      titleInput.value = data.title;
      titleInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // Fill description
    const descInput = document.querySelector('textarea[placeholder*="description"], textarea[name*="description"]') as HTMLTextAreaElement;
    if (descInput && data.description) {
      descInput.value = data.description;
      descInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // Fill price
    const priceInput = document.querySelector('input[placeholder*="price"], input[name*="price"]') as HTMLInputElement;
    if (priceInput && data.price) {
      priceInput.value = data.price.toString();
      priceInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // Fill brand (if dropdown)
    if (data.brand) {
      const brandSelect = document.querySelector('select[name*="brand"], select[data-test*="brand"]') as HTMLSelectElement;
      if (brandSelect) {
        const option = Array.from(brandSelect.options).find(opt => 
          opt.text.toLowerCase().includes(data.brand.toLowerCase())
        );
        if (option) {
          brandSelect.value = option.value;
          brandSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    }

    // Fill size
    if (data.size) {
      const sizeSelect = document.querySelector('select[name*="size"], select[data-test*="size"]') as HTMLSelectElement;
      if (sizeSelect) {
        const option = Array.from(sizeSelect.options).find(opt => 
          opt.text.toLowerCase().includes(data.size.toLowerCase())
        );
        if (option) {
          sizeSelect.value = option.value;
          sizeSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    }

    // Fill condition
    if (data.condition) {
      const conditionSelect = document.querySelector('select[name*="condition"], select[data-test*="condition"]') as HTMLSelectElement;
      if (conditionSelect) {
        const option = Array.from(conditionSelect.options).find(opt => 
          opt.text.toLowerCase().includes(data.condition.toLowerCase())
        );
        if (option) {
          conditionSelect.value = option.value;
          conditionSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    }
  }

  private async forwardImages(folderEntry: FileSystemDirectoryEntry, imageNames: string[]) {
    // Find Poshmark's image upload area
    const uploadArea = document.querySelector('[data-test*="upload"], .upload-area, input[type="file"][accept*="image"]') as HTMLElement;
    if (!uploadArea) {
      console.log('Closet Hopper: Could not find image upload area');
      return;
    }

    // Collect image files from the folder
    const imageFiles: File[] = [];
    
    for (const imageName of imageNames) {
      const imageFile = await this.findFileInFolder(folderEntry, imageName);
      if (imageFile) {
        const file = await new Promise<File>((resolve, reject) => {
          imageFile.file(resolve, reject);
        });
        imageFiles.push(file);
      }
    }

    if (imageFiles.length === 0) {
      console.log('Closet Hopper: No images found');
      return;
    }

    // Create a new drag event with the image files
    const dataTransfer = new DataTransfer();
    imageFiles.forEach(file => dataTransfer.items.add(file));

    // Dispatch the drag event to Poshmark's upload area
    const dragEvent = new DragEvent('drop', {
      bubbles: true,
      cancelable: true,
      dataTransfer
    });

    uploadArea.dispatchEvent(dragEvent);
    
    console.log(`Closet Hopper: Forwarded ${imageFiles.length} images to Poshmark`);
  }
}

// Initialize when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new PoshmarkAssistant());
} else {
  new PoshmarkAssistant();
}
