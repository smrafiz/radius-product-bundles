(function (window, document) {
    "use strict";

    if (window.ProductBundleWidget) return;

    class ProductBundleWidget {
        constructor(containerElement = null) {
            this.container = containerElement;
            this.shop = this.getShopDomain();
            this.productId = this.getProductId();
            this.bundles = [];
            this.selectedBundle = null;
            this.settings = this.getSettings();
            this.cache = new Map();
            this.isLoading = false;
            this.quantity = 1;
            this.selectedProducts = new Set();

            console.log('ProductBundleWidget initialized:', {
                shop: this.shop,
                productId: this.productId,
                settings: this.settings
            });

            if (this.shop && this.productId && this.settings.appUrl) {
                this.init();
            }
        }

        init() {
            if (this.isLoading) return;
            this.loadBundles();
        }

        getShopDomain() {
            return (
                this.container?.dataset.shop ||
                window.Shopify?.shop ||
                window.location.hostname.replace(".myshopify.com", "")
            );
        }

        getProductId() {
            return (
                this.container?.dataset.productId ||
                window.ShopifyAnalytics?.meta?.product?.id ||
                this.extractProductIdFromPage()
            );
        }

        extractProductIdFromPage() {
            // Try JSON-LD first
            const jsonLd = document.querySelector('script[type="application/ld+json"]');
            if (jsonLd) {
                try {
                    const data = JSON.parse(jsonLd.textContent);
                    if (data.productID) {
                        return "gid://shopify/Product/" + data.productID;
                    }
                } catch (e) {}
            }

            // Try meta tag
            const productMeta = document.querySelector('meta[property="product:retailer_item_id"]');
            if (productMeta) {
                return "gid://shopify/Product/" + productMeta.content;
            }

            return null;
        }

        getSettings() {
            const defaults = {
                appUrl: this.container?.dataset.appUrl || "",
                layout: "grid",
                theme: "auto",
                showSavings: true,
                showImages: true,
                currency: "USD",
                moneyFormat: "${{amount}}"
            };

            if (this.container) {
                Object.keys(defaults).forEach(key => {
                    const dataKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
                    const value = this.container.dataset[dataKey];
                    if (value !== undefined) {
                        defaults[key] = value === "true" ? true : value === "false" ? false : value;
                    }
                });
            }

            return defaults;
        }

        async loadBundles() {
            if (this.isLoading || !this.settings.appUrl) {
                console.log('Bundle Widget: Skipping load - already loading or no app URL');
                return;
            }

            this.isLoading = true;
            this.showLoading();

            const cacheKey = `${this.shop}-${this.productId}`;

            if (this.cache.has(cacheKey)) {
                console.log('Bundle Widget: Using cached data');
                this.bundles = this.cache.get(cacheKey);
                this.renderBundles();
                this.isLoading = false;
                return;
            }

            try {
                const url = `${this.settings.appUrl}/api/bundles/product/${encodeURIComponent(this.productId)}?shop=${encodeURIComponent(this.shop)}`;
                console.log('Bundle Widget: Fetching bundles from:', url);

                const response = await fetch(url, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    signal: AbortSignal.timeout(15000)
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                console.log('Bundle Widget: API response:', data);

                if (data.success && data.bundles && data.bundles.length > 0) {
                    this.bundles = data.bundles;
                    this.cache.set(cacheKey, this.bundles);

                    // Cache for 5 minutes
                    setTimeout(() => this.cache.delete(cacheKey), 5 * 60 * 1000);

                    this.renderBundles();
                } else {
                    console.log('Bundle Widget: No bundles found for this product');
                    this.hideWidget();
                }
            } catch (error) {
                console.error('Bundle Widget: Failed to load bundles:', error);
                this.showError('Unable to load bundle information. Please try again later.');
            } finally {
                this.isLoading = false;
                this.hideLoading();
            }
        }

        renderBundles() {
            if (!this.bundles.length || !this.container) {
                this.hideWidget();
                return;
            }

            // Use the first bundle for now (you can enhance this for multiple bundles)
            this.selectedBundle = this.bundles[0];
            this.initializeSelectedProducts();

            const html = this.generateBundleHTML(this.selectedBundle);
            this.container.innerHTML = html;
            this.container.className = `bundle-widget bundle-widget--${this.settings.layout} bundle-widget--${this.settings.theme}`;

            this.bindEvents();
            this.updatePricing();
        }

        initializeSelectedProducts() {
            this.selectedProducts.clear();
            if (this.selectedBundle) {
                this.selectedBundle.products.forEach(product => {
                    if (product.isRequired) {
                        this.selectedProducts.add(product.id);
                    }
                });
            }
        }

        generateBundleHTML(bundle) {
            const savingsHTML = this.settings.showSavings ? this.generateSavingsHTML(bundle) : '';

            return `
                <div class="bundle-container" data-bundle-id="${bundle.id}">
                    <div class="bundle-header">
                        <h3 class="bundle-title">${this.escapeHtml(bundle.name)}</h3>
                        ${savingsHTML}
                    </div>
                    
                    <div class="bundle-products bundle-products--${this.settings.layout}">
                        ${this.generateProductsHTML(bundle)}
                    </div>
                    
                    <div class="bundle-pricing">
                        ${this.generatePricingHTML(bundle)}
                    </div>
                    
                    <div class="bundle-actions">
                        <div class="bundle-quantity-selector">
                            <button type="button" class="bundle-quantity-btn" data-action="decrease">-</button>
                            <input type="number" class="bundle-quantity-input" value="1" min="1" max="10">
                            <button type="button" class="bundle-quantity-btn" data-action="increase">+</button>
                        </div>
                        
                        <button class="bundle-add-to-cart" data-bundle-id="${bundle.id}" type="button">
                            <span class="bundle-btn-text">Add Bundle to Cart</span>
                            <span class="bundle-btn-spinner" style="display: none;"></span>
                        </button>
                    </div>
                    
                    <div class="bundle-messages" role="alert" aria-live="polite"></div>
                </div>
            `;
        }

        generateSavingsHTML(bundle) {
            if (bundle.discountType === "PERCENTAGE") {
                return `<span class="bundle-savings">Save ${bundle.discountValue}%</span>`;
            } else if (bundle.discountType === "FIXED_AMOUNT") {
                return `<span class="bundle-savings">Save ${this.formatMoney(bundle.discountValue)}</span>`;
            }
            return '';
        }

        generateProductsHTML(bundle) {
            const currentProductId = this.productId;

            return bundle.products.map(product => {
                const isCurrent = product.id === currentProductId;
                const isSelected = this.selectedProducts.has(product.id);
                const canToggle = !product.isRequired && !isCurrent;

                let badgeClass = 'required';
                let badgeText = 'Required';

                if (isCurrent) {
                    badgeClass = 'current';
                    badgeText = 'Current Item';
                } else if (!product.isRequired) {
                    badgeClass = 'optional';
                    badgeText = 'Optional';
                }

                const imageHTML = this.settings.showImages && product.image
                    ? `<img src="${product.image}" alt="${this.escapeHtml(product.title)}" loading="lazy">`
                    : '<div class="placeholder">📦</div>';

                const checkboxHTML = canToggle
                    ? `<input type="checkbox" class="bundle-product-checkbox" ${isSelected ? 'checked' : ''} data-product-id="${product.id}">`
                    : '';

                return `
                    <div class="bundle-product ${product.isRequired || isCurrent ? 'required' : 'optional'} ${isCurrent ? 'current' : ''}" 
                         data-product-id="${product.id}" 
                         data-variant-id="${product.variantId}" 
                         data-quantity="${product.quantity}">
                        
                        <div class="bundle-product-image">
                            ${imageHTML}
                        </div>
                        
                        <div class="bundle-product-info">
                            <div class="bundle-product-title">${this.escapeHtml(product.title)}</div>
                            
                            <div class="bundle-product-price">
                                ${product.compareAtPrice && product.compareAtPrice > product.price
                    ? `<span class="original-price">${this.formatMoney(product.compareAtPrice)}</span>`
                    : ''
                }
                                <span class="sale-price">${this.formatMoney(product.price)}</span>
                            </div>
                            
                            <div class="bundle-product-quantity">Qty: ${product.quantity}</div>
                            
                            <div class="bundle-product-badge ${badgeClass}">${badgeText}</div>
                        </div>
                        
                        ${checkboxHTML}
                    </div>
                `;
            }).join('');
        }

        generatePricingHTML(bundle) {
            const pricing = this.calculatePricing();

            return `
                <div class="bundle-pricing-row">
                    <span class="bundle-pricing-label">Subtotal:</span>
                    <span class="bundle-pricing-value">${this.formatMoney(pricing.subtotal)}</span>
                </div>
                
                ${pricing.discount > 0 ? `
                    <div class="bundle-pricing-row">
                        <span class="bundle-pricing-label">Bundle Discount:</span>
                        <span class="bundle-pricing-value bundle-pricing-savings">-${this.formatMoney(pricing.discount)}</span>
                    </div>
                ` : ''}
                
                <div class="bundle-pricing-row">
                    <span class="bundle-pricing-label">Bundle Total:</span>
                    <span class="bundle-pricing-value">${this.formatMoney(pricing.total)}</span>
                </div>
            `;
        }

        calculatePricing() {
            if (!this.selectedBundle) return { subtotal: 0, discount: 0, total: 0 };

            let subtotal = 0;

            this.selectedBundle.products.forEach(product => {
                if (this.selectedProducts.has(product.id)) {
                    subtotal += product.price * product.quantity * this.quantity;
                }
            });

            let discount = 0;
            if (this.selectedBundle.discountType === 'PERCENTAGE') {
                discount = (subtotal * this.selectedBundle.discountValue) / 100;
            } else if (this.selectedBundle.discountType === 'FIXED_AMOUNT') {
                discount = this.selectedBundle.discountValue * this.quantity;
            }

            const total = Math.max(0, subtotal - discount);

            return { subtotal, discount, total };
        }

        updatePricing() {
            const pricingContainer = this.container?.querySelector('.bundle-pricing');
            if (pricingContainer) {
                pricingContainer.innerHTML = this.generatePricingHTML(this.selectedBundle);
            }
        }

        bindEvents() {
            if (!this.container) return;

            // Add to cart button
            const addToCartBtn = this.container.querySelector('.bundle-add-to-cart');
            if (addToCartBtn) {
                addToCartBtn.addEventListener('click', (e) => this.handleAddToCart(e));
            }

            // Quantity controls
            const quantityInput = this.container.querySelector('.bundle-quantity-input');
            const decreaseBtn = this.container.querySelector('[data-action="decrease"]');
            const increaseBtn = this.container.querySelector('[data-action="increase"]');

            if (quantityInput) {
                quantityInput.addEventListener('change', (e) => this.handleQuantityChange(e));
                quantityInput.addEventListener('input', (e) => this.handleQuantityChange(e));
            }

            if (decreaseBtn) {
                decreaseBtn.addEventListener('click', () => this.changeQuantity(-1));
            }

            if (increaseBtn) {
                increaseBtn.addEventListener('click', () => this.changeQuantity(1));
            }

            // Product selection checkboxes
            const checkboxes = this.container.querySelectorAll('.bundle-product-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', (e) => this.handleProductToggle(e));
            });
        }

        handleQuantityChange(event) {
            const value = parseInt(event.target.value) || 1;
            this.quantity = Math.max(1, Math.min(10, value));
            event.target.value = this.quantity;
            this.updatePricing();
        }

        changeQuantity(delta) {
            const newQuantity = Math.max(1, Math.min(10, this.quantity + delta));
            this.quantity = newQuantity;

            const input = this.container?.querySelector('.bundle-quantity-input');
            if (input) {
                input.value = newQuantity;
            }

            this.updatePricing();
        }

        handleProductToggle(event) {
            const productId = event.target.dataset.productId;

            if (event.target.checked) {
                this.selectedProducts.add(productId);
            } else {
                this.selectedProducts.delete(productId);
            }

            this.updatePricing();
        }

        async handleAddToCart(event) {
            event.preventDefault();

            if (this.selectedProducts.size === 0) {
                this.showMessage('Please select at least one product to add to cart.', 'error');
                return;
            }

            const button = event.target.closest('.bundle-add-to-cart');
            const textSpan = button.querySelector('.bundle-btn-text');
            const spinner = button.querySelector('.bundle-btn-spinner');

            button.disabled = true;
            button.classList.add('loading');
            textSpan.style.display = 'none';
            spinner.style.display = 'inline-block';

            try {
                const items = this.buildCartItems();
                console.log('Bundle Widget: Adding items to cart:', items);

                const result = await this.addToCart(items);

                if (result.success) {
                    this.showMessage('Bundle added to cart successfully!', 'success');
                    this.triggerCartUpdate();
                } else {
                    throw new Error(result.error || 'Failed to add bundle to cart');
                }

            } catch (error) {
                console.error('Bundle Widget: Add to cart error:', error);
                this.showMessage('Failed to add bundle to cart. Please try again.', 'error');
            } finally {
                button.disabled = false;
                button.classList.remove('loading');
                textSpan.style.display = 'inline';
                spinner.style.display = 'none';
            }
        }

        buildCartItems() {
            const items = [];

            this.selectedBundle.products.forEach(product => {
                if (this.selectedProducts.has(product.id)) {
                    // Extract numeric ID from Shopify GID
                    const variantId = product.variantId.replace('gid://shopify/ProductVariant/', '');

                    items.push({
                        id: variantId,
                        quantity: product.quantity * this.quantity,
                        properties: {
                            '_bundle_id': this.selectedBundle.id,
                            '_bundle_name': this.selectedBundle.name,
                            '_bundle_discount': this.selectedBundle.discountValue,
                            '_bundle_discount_type': this.selectedBundle.discountType
                        }
                    });
                }
            });

            return items;
        }

        async addToCart(items) {
            try {
                const response = await fetch('/cart/add.js', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ items })
                });

                const data = await response.json();

                if (response.ok) {
                    return { success: true, data };
                } else {
                    return { success: false, error: data.message || data.description };
                }
            } catch (error) {
                return { success: false, error: error.message };
            }
        }

        triggerCartUpdate() {
            // Trigger Shopify theme cart update events
            document.dispatchEvent(new CustomEvent('cart:updated'));

            // For themes that use jQuery
            if (window.jQuery) {
                window.jQuery(document).trigger('cart.requestComplete');
            }

            // For some themes
            if (window.theme && window.theme.cartUpdate) {
                window.theme.cartUpdate();
            }
        }

        showMessage(message, type = 'info') {
            const messagesContainer = this.container?.querySelector('.bundle-messages');
            if (!messagesContainer) return;

            const messageEl = document.createElement('div');
            messageEl.className = `bundle-message bundle-message--${type}`;
            messageEl.textContent = message;

            messagesContainer.appendChild(messageEl);

            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.remove();
                }
            }, 5000);
        }

        showLoading() {
            if (this.container) {
                const loading = this.container.querySelector('.bundle-widget-loading');
                if (loading) {
                    loading.style.display = 'flex';
                }
            }
        }

        hideLoading() {
            if (this.container) {
                const loading = this.container.querySelector('.bundle-widget-loading');
                if (loading) {
                    loading.style.display = 'none';
                }
            }
        }

        showError(message) {
            if (this.container) {
                this.container.innerHTML = `<div class="bundle-widget-error">${this.escapeHtml(message)}</div>`;
            }
        }

        hideWidget() {
            if (this.container) {
                this.container.classList.add('bundle-widget-hidden');
            }
        }

        formatMoney(amount) {
            const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
            if (isNaN(numAmount)) return '$0.00';

            // Basic money formatting - you can enhance this based on your needs
            return this.settings.moneyFormat.replace('{{amount}}', (numAmount / 100).toFixed(2));
        }

        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text || '';
            return div.innerHTML;
        }
    }

    window.ProductBundleWidget = ProductBundleWidget;

})(window, document);