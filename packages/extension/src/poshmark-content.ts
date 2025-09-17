import { ListingData, PoshmarkFormData, POSHMARK_COLORS, POSHMARK_CATEGORIES } from './types';

// Poshmark content script for form filling
class PoshmarkFormFiller {
    private isFilling = false;
    private currentListing: ListingData | null = null;

    constructor() {
        this.init();
    }

    private init() {
        // Listen for messages from popup
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'fillPoshmarkForm') {
                this.fillForm(request.listing);
                sendResponse({ success: true });
            }
        });

        // Add form filling UI to Poshmark create listing page
        this.addFormFillingUI();
    }

    private addFormFillingUI() {
        // Only add UI to Poshmark create listing page
        if (!window.location.href.includes('poshmark.com/create-listing')) {
            return;
        }

        const ui = document.createElement('div');
        ui.id = 'closet-hopper-poshmark-ui';
        ui.innerHTML = `
            <div style="position: fixed; top: 20px; right: 20px; background: white; border: 2px solid #e6007e; border-radius: 10px; padding: 15px; z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.15); min-width: 280px;">
                <h3 style="margin: 0 0 10px 0; color: #e6007e; font-size: 16px; font-weight: bold;">🦘 Closet Hopper</h3>
                <div style="margin-bottom: 10px;">
                    <button id="loadListingData" style="width: 100%; padding: 8px; margin: 2px 0; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">📋 Load Listing Data</button>
                    <div id="listingStatus" style="font-size: 10px; color: #666; margin-top: 2px;"></div>
                </div>
                <div id="listingSelector" style="display: none;">
                    <select id="listingSelect" style="width: 100%; padding: 6px; margin: 5px 0; border: 1px solid #ccc; border-radius: 4px; font-size: 12px;">
                        <option value="">Select a listing...</option>
                    </select>
                    <button id="fillForm" style="width: 100%; padding: 8px; margin: 5px 0; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Fill Form</button>
                </div>
                <div id="fillingStatus" style="font-size: 12px; color: #666; margin-top: 10px;"></div>
            </div>
        `;

        document.body.appendChild(ui);

        // Add event listeners
        document.getElementById('loadListingData')?.addEventListener('click', () => {
            this.loadListingData();
        });

        document.getElementById('fillForm')?.addEventListener('click', () => {
            this.fillSelectedListing();
        });
    }

    private async loadListingData() {
        try {
            const status = document.getElementById('listingStatus');
            if (status) status.textContent = 'Loading listings...';

            // Get extracted listings from storage
            const result = await chrome.storage.local.get(['extractedListings']);
            const listings = result.extractedListings || [];

            if (listings.length === 0) {
                if (status) {
                    status.textContent = 'No listings found. Extract from eBay first.';
                    status.style.color = '#dc3545';
                }
                return;
            }

            // Populate selector
            const selector = document.getElementById('listingSelect') as HTMLSelectElement;
            const selectorContainer = document.getElementById('listingSelector');
            
            if (selector && selectorContainer) {
                selector.innerHTML = '<option value="">Select a listing...</option>';
                
                listings.forEach((listing: any, index: number) => {
                    const option = document.createElement('option');
                    option.value = index.toString();
                    option.textContent = listing.title || `Listing ${index + 1}`;
                    selector.appendChild(option);
                });

                selectorContainer.style.display = 'block';
            }

            if (status) {
                status.textContent = `Found ${listings.length} listings`;
                status.style.color = '#28a745';
            }

        } catch (error) {
            console.error('Error loading listing data:', error);
            const status = document.getElementById('listingStatus');
            if (status) {
                status.textContent = 'Error loading listings';
                status.style.color = '#dc3545';
            }
        }
    }

    private async fillSelectedListing() {
        const selector = document.getElementById('listingSelect') as HTMLSelectElement;
        if (!selector || !selector.value) {
            alert('Please select a listing first');
            return;
        }

        try {
            const result = await chrome.storage.local.get(['extractedListings']);
            const listings = result.extractedListings || [];
            const selectedIndex = parseInt(selector.value);
            const selectedListing = listings[selectedIndex];

            if (!selectedListing) {
                alert('Selected listing not found');
                return;
            }

            await this.fillForm(selectedListing);

        } catch (error) {
            console.error('Error filling form:', error);
            const status = document.getElementById('fillingStatus');
            if (status) {
                status.textContent = 'Error filling form';
                status.style.color = '#dc3545';
            }
        }
    }

    private async fillForm(ebayData: any) {
        if (this.isFilling) return;
        
        this.isFilling = true;
        const status = document.getElementById('fillingStatus');
        if (status) status.textContent = 'Filling form...';

        try {
            // Convert eBay data to Poshmark format
            const poshmarkData = this.convertToPoshmarkFormat(ebayData);

            // Fill form fields
            await this.fillFormFields(poshmarkData);

            if (status) {
                status.textContent = '✅ Form filled! Review and submit manually.';
                status.style.color = '#28a745';
            }

        } catch (error) {
            console.error('Error filling form:', error);
            if (status) {
                status.textContent = '❌ Error filling form';
                status.style.color = '#dc3545';
            }
        } finally {
            this.isFilling = false;
        }
    }

    private convertToPoshmarkFormat(ebayData: any): PoshmarkFormData {
        // Extract price and convert to cents
        const priceText = ebayData.price || '';
        const priceMatch = priceText.match(/[\d,]+\.?\d*/);
        const priceInCents = priceMatch ? Math.round(parseFloat(priceMatch[0].replace(',', '')) * 100) : 0;

        // Map eBay condition to Poshmark condition
        const condition = this.mapCondition(ebayData.condition || '');

        // Extract brand from title (basic implementation)
        const brand = this.extractBrand(ebayData.title || '');

        // Extract size from title (basic implementation)
        const size = this.extractSize(ebayData.title || '');

        return {
            title: ebayData.title || '',
            description: this.generateDescription(ebayData),
            brand: brand,
            price: priceInCents,
            size: size,
            category: 'Women', // Default category
            subcategory: 'Tops', // Default subcategory
            condition: condition,
            newWithTags: condition === 'new',
            colors: [], // Will be filled by user
            styleTags: [], // Will be filled by user
            photos: ebayData.imageUrl ? [ebayData.imageUrl] : []
        };
    }

    private mapCondition(ebayCondition: string): 'new' | 'like_new' | 'good' | 'fair' {
        const condition = ebayCondition.toLowerCase();
        
        if (condition.includes('new') || condition.includes('brand new')) {
            return 'new';
        } else if (condition.includes('excellent') || condition.includes('like new')) {
            return 'like_new';
        } else if (condition.includes('good') || condition.includes('very good')) {
            return 'good';
        } else {
            return 'fair';
        }
    }

    private extractBrand(title: string): string {
        // Basic brand extraction - this could be enhanced with a brand database
        const commonBrands = [
            'Nike', 'Adidas', 'Puma', 'Under Armour', 'Lululemon', 'Zara', 'H&M', 'Forever 21',
            'Gap', 'Old Navy', 'Banana Republic', 'J.Crew', 'Madewell', 'Anthropologie',
            'Free People', 'Urban Outfitters', 'American Eagle', 'Hollister', 'Abercrombie'
        ];

        for (const brand of commonBrands) {
            if (title.toLowerCase().includes(brand.toLowerCase())) {
                return brand;
            }
        }

        return '';
    }

    private extractSize(title: string): string {
        // Basic size extraction
        const sizeMatch = title.match(/\b(XS|S|M|L|XL|XXL|XXXL|\d+)\b/i);
        return sizeMatch ? sizeMatch[1] : '';
    }

    private generateDescription(ebayData: any): string {
        let description = ebayData.title || '';
        
        if (ebayData.condition) {
            description += `\n\nCondition: ${ebayData.condition}`;
        }

        description += `\n\nOriginally listed on eBay.`;
        
        return description;
    }

    private async fillFormFields(data: PoshmarkFormData) {
        // Fill title
        await this.fillField('input[name="title"], #title, [data-testid="title-input"]', data.title);

        // Fill description
        await this.fillField('textarea[name="description"], #description, [data-testid="description-input"]', data.description);

        // Fill brand
        await this.fillField('input[name="brand"], #brand, [data-testid="brand-input"]', data.brand);

        // Fill price
        await this.fillField('input[name="price"], #price, [data-testid="price-input"]', (data.price / 100).toFixed(2));

        // Fill size
        await this.fillField('input[name="size"], #size, [data-testid="size-input"]', data.size);

        // Select category (this might need to be enhanced based on actual Poshmark form structure)
        await this.selectDropdown('select[name="category"], #category, [data-testid="category-select"]', data.category);

        // Select condition
        await this.selectDropdown('select[name="condition"], #condition, [data-testid="condition-select"]', data.condition);

        // Check new with tags if applicable
        if (data.newWithTags) {
            await this.checkCheckbox('input[name="new_with_tags"], #new_with_tags, [data-testid="new-with-tags"]');
        }

        // Note: Photo upload and color/style tag selection would need to be implemented
        // based on the actual Poshmark form structure
    }

    private async fillField(selector: string, value: string) {
        if (!value) return;

        const field = document.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement;
        if (field) {
            field.value = value;
            field.dispatchEvent(new Event('input', { bubbles: true }));
            field.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }

    private async selectDropdown(selector: string, value: string) {
        if (!value) return;

        const dropdown = document.querySelector(selector) as HTMLSelectElement;
        if (dropdown) {
            // Try to find option by value or text
            const option = Array.from(dropdown.options).find(opt => 
                opt.value.toLowerCase() === value.toLowerCase() || 
                opt.text.toLowerCase() === value.toLowerCase()
            );
            
            if (option) {
                dropdown.value = option.value;
                dropdown.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
    }

    private async checkCheckbox(selector: string) {
        const checkbox = document.querySelector(selector) as HTMLInputElement;
        if (checkbox && checkbox.type === 'checkbox') {
            checkbox.checked = true;
            checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }
}

// Initialize the form filler
new PoshmarkFormFiller();
