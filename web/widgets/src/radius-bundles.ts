/**
 * Radius Bundles - Storefront Script
 * Handles analytics tracking and cart management
 *
 * Usage: Loaded automatically via app embed
 */

(function() {
    'use strict';

    // Get configuration from Liquid
    const config = window.RadiusBundles?.config || {};
    const ANALYTICS_ENDPOINT = '/apps/bundles/analytics';
    const PRODUCTS_ENDPOINT = '/apps/bundles/products';

    // ============================================
    // ANALYTICS MODULE
    // ============================================

    const Analytics = {
        /**
         * Sends tracking event to proxy API
         */
        async track(eventType, data = {}) {
            if (!config.enableAnalytics) {
                console.log('[RadiusBundles] Analytics disabled');
                return;
            }

            if (!config.shop) {
                console.error('[RadiusBundles] Missing shop configuration');
                return;
            }

            const payload = {
                type: eventType,
                customerId: config.customerId || null,
                timestamp: new Date().toISOString(),
                ...data
            };

            try {
                const url = `${ANALYTICS_ENDPOINT}?shop=${encodeURIComponent(config.shop)}`;

                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const error = await response.json();
                    console.error('[RadiusBundles] Tracking failed:', error);
                    return;
                }

                const result = await response.json();
                console.log('[RadiusBundles] Tracked:', eventType, result);

            } catch (error) {
                console.error('[RadiusBundles] Tracking error:', error);
            }
        },

        /**
         * Track bundle view
         * Called when a bundle widget is displayed on product page
         */
        trackBundleView(bundleId, productId = null) {
            this.track('bundle_view', {
                bundleId: bundleId,
                productId: productId,
                pageType: config.pageType,
                url: window.location.href
            });
        },

        /**
         * Track add to cart
         * Called when user adds bundle to cart
         */
        trackAddToCart(bundleId, bundleData = {}) {
            this.track('bundle_add_to_cart', {
                bundleId: bundleId,
                productIds: bundleData.productIds || [],
                totalValue: bundleData.totalValue || 0,
                discountValue: bundleData.discountValue || 0
            });
        },

        /**
         * Track page view (optional)
         * Can be used for general analytics
         */
        trackPageView() {
            this.track('page_view', {
                pageType: config.pageType,
                template: config.template,
                url: window.location.href
            });
        }
    };

    // ============================================
    // CART CLEANUP MODULE
    // ============================================

    const CartCleanup = {
        isRunning: false,
        debounceTimer: null,

        /**
         * Fetch current cart from Shopify
         */
        async fetchCart() {
            const response = await fetch('/cart.js');
            return response.json();
        },

        /**
         * Update cart attributes
         */
        async updateAttributes(attributes) {
            await fetch('/cart/update.js', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ attributes })
            });
        },

        /**
         * Check if bundle is active using metafield data
         */
        isBundleActive(bundleId) {
            const activeBundles = config.activeBundles;
            if (!activeBundles) return true;

            const bundle = activeBundles[bundleId];
            return bundle && bundle.status === 'ACTIVE';
        },

        /**
         * Get bundle settings from metafield
         */
        getBundleSettings(bundleId) {
            const activeBundles = config.activeBundles;
            if (!activeBundles) return null;

            return activeBundles[bundleId] || null;
        },

        /**
         * Main cleanup and sync function
         * 1. Removes bundles missing items in cart
         * 2. Removes inactive bundles
         * 3. Syncs settings from metafield
         */
        async cleanup() {
            if (this.isRunning) return;
            this.isRunning = true;

            try {
                const cart = await this.fetchCart();

                if (!cart.attributes?._radiusDiscounts) {
                    this.isRunning = false;
                    return;
                }

                let bundles;
                try {
                    bundles = JSON.parse(cart.attributes._radiusDiscounts);
                } catch {
                    await this.updateAttributes({ _radiusDiscounts: '' });
                    console.log('[RadiusBundles] Cleared invalid bundle data');
                    this.isRunning = false;
                    return;
                }

                if (!Array.isArray(bundles) || bundles.length === 0) {
                    this.isRunning = false;
                    return;
                }

                // Count items per bundle in cart
                const bundleItemCounts = {};
                cart.items.forEach(item => {
                    const bundleId = item.properties?._bundle_id;
                    if (bundleId) {
                        bundleItemCounts[bundleId] = (bundleItemCounts[bundleId] || 0) + 1;
                    }
                });

                let hasChanges = false;
                const validBundles = [];

                for (const bundle of bundles) {
                    const itemCount = bundleItemCounts[bundle.bundleId] || 0;
                    const required = bundle.requiredLineCount || 1;
                    const hasItems = itemCount >= required;
                    const isActive = this.isBundleActive(bundle.bundleId);

                    // Skip if incomplete or inactive
                    if (!hasItems || !isActive) {
                        hasChanges = true;
                        if (!isActive) {
                            console.log('[RadiusBundles] Removed inactive bundle:', bundle.bundleId);
                        }
                        continue;
                    }

                    // Get latest settings from metafield
                    const latestSettings = this.getBundleSettings(bundle.bundleId);

                    if (latestSettings) {
                        // Check if settings changed
                        const settingsChanged =
                            bundle.discountType !== latestSettings.discountType ||
                            bundle.discountValue !== latestSettings.discountValue ||
                            bundle.freeShipping !== latestSettings.freeShipping ||
                            bundle.minOrderValue !== latestSettings.minOrderValue ||
                            bundle.maxDiscountAmount !== latestSettings.maxDiscountAmount;

                        if (settingsChanged) {
                            hasChanges = true;
                            console.log('[RadiusBundles] Synced settings for bundle:', bundle.bundleId);
                        }

                        // Merge with metafield values (source of truth)
                        validBundles.push({
                            ...bundle,
                            discountType: latestSettings.discountType,
                            discountValue: latestSettings.discountValue,
                            freeShipping: latestSettings.freeShipping,
                            minOrderValue: latestSettings.minOrderValue,
                            maxDiscountAmount: latestSettings.maxDiscountAmount,
                            discountApplication: latestSettings.discountApplication,
                            discountedProductIds: latestSettings.discountedProductIds,
                        });
                    } else {
                        // Keep original if no metafield data
                        validBundles.push(bundle);
                    }
                }

                // Update if changed
                if (hasChanges || validBundles.length !== bundles.length) {
                    const value = validBundles.length > 0
                        ? JSON.stringify(validBundles)
                        : '';

                    await this.updateAttributes({ _radiusDiscounts: value });

                    const removed = bundles.length - validBundles.length;
                    if (removed > 0) {
                        console.log('[RadiusBundles] Removed', removed, 'bundle(s)');
                    }

                    // Dispatch event
                    document.dispatchEvent(new CustomEvent('radiusBundles:cleanup', {
                        detail: {
                            removed: removed,
                            remaining: validBundles.length,
                            synced: hasChanges
                        }
                    }));
                }

            } catch (error) {
                console.error('[RadiusBundles] Cleanup error:', error);
            } finally {
                this.isRunning = false;
            }
        },

        /**
         * Debounced cleanup to avoid rapid calls
         */
        trigger() {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => this.cleanup(), 500);
        },

        /**
         * Initialize cleanup system
         */
        init() {
            // Intercept fetch for cart modifications
            const originalFetch = window.fetch;
            window.fetch = function(input, init) {
                const result = originalFetch.apply(this, arguments);
                const url = typeof input === 'string' ? input : input.url;
                const method = init?.method || 'GET';

                // Trigger cleanup on cart modifications
                if (method === 'POST' &&
                    (url.includes('/cart/change') ||
                        url.includes('/cart/update') ||
                        url.includes('/cart/clear'))) {
                    result.then(() => CartCleanup.trigger()).catch(() => {});
                }

                return result;
            };

            // Event listeners
            document.addEventListener('cart:refresh', () => this.trigger());
            document.addEventListener('cart:updated', () => this.trigger());

            // Initial cleanup on load
            setTimeout(() => this.cleanup(), 500);
        }
    };

    // ============================================
    // SAVINGS BANNER MODULE
    // ============================================

    const SavingsBanner = {
        /**
         * Update savings banner display
         */
        async update() {
            if (config.pageType !== 'cart' || !config.showSavingsBanner) {
                return;
            }

            const container = document.getElementById('radius-bundle-savings');
            if (!container) return;

            try {
                const cart = await CartCleanup.fetchCart();
                const bundlesRaw = cart.attributes?._radiusDiscounts;

                if (!bundlesRaw) {
                    container.style.display = 'none';
                    return;
                }

                let bundles;
                try {
                    bundles = JSON.parse(bundlesRaw);
                } catch {
                    container.style.display = 'none';
                    return;
                }

                if (!bundles || bundles.length === 0) {
                    container.style.display = 'none';
                    return;
                }

                // Count items per bundle
                const bundleItemCounts = {};
                cart.items.forEach(item => {
                    const bundleId = item.properties?._bundle_id;
                    if (bundleId) {
                        bundleItemCounts[bundleId] = (bundleItemCounts[bundleId] || 0) + 1;
                    }
                });

                // Build messages for complete AND active bundles
                const messages = [];
                let hasFreeShipping = false;

                bundles.forEach(bundle => {
                    const itemCount = bundleItemCounts[bundle.bundleId] || 0;
                    const required = bundle.requiredLineCount || 0;

                    if (itemCount >= required && required > 0 &&
                        CartCleanup.isBundleActive(bundle.bundleId)) {

                        const name = bundle.bundleName || 'this bundle';

                        if (bundle.freeShipping) {
                            hasFreeShipping = true;
                        }

                        switch (bundle.discountType) {
                            case 'PERCENTAGE':
                                messages.push(`You're saving ${bundle.discountValue}% with ${name}`);
                                break;
                            case 'FIXED_AMOUNT':
                                messages.push(`You're saving $${bundle.discountValue.toFixed(2)} with ${name}`);
                                break;
                            case 'CUSTOM_PRICE':
                                messages.push(`Special price: $${bundle.discountValue.toFixed(2)} for ${name}`);
                                break;
                            case 'NO_DISCOUNT':
                                if (bundle.freeShipping) {
                                    messages.push(`${name} qualifies for free shipping!`);
                                }
                                break;
                        }
                    }
                });

                if (messages.length > 0) {
                    const contentEl = container.querySelector('.radius-savings-banner__content');

                    let html = messages.length === 1
                        ? messages[0]
                        : `<ul class="radius-savings-banner__list">${messages.map(m => `<li>${m}</li>`).join('')}</ul>`;

                    if (hasFreeShipping && !messages.some(m => m.includes('free shipping'))) {
                        html += '<div class="radius-savings-banner--free-shipping">🚚 Free shipping included!</div>';
                    }

                    contentEl.innerHTML = html;
                    container.style.display = 'block';

                    // Move to top of cart form
                    const form = document.querySelector('form#cart') ||
                        document.querySelector('.cart__contents') ||
                        document.querySelector('#MainContent form[action="/cart"]');

                    if (form && container.parentNode !== form) {
                        form.insertBefore(container, form.firstChild);
                    }
                } else {
                    container.style.display = 'none';
                }

            } catch (error) {
                console.error('[RadiusBundles] Banner error:', error);
            }
        },

        /**
         * Initialize banner updates
         */
        init() {
            if (config.pageType !== 'cart') return;

            // Update on load
            setTimeout(() => this.update(), 100);

            // Listen for events
            document.addEventListener('cart:updated', () => this.update());
            document.addEventListener('radiusBundles:cleanup', () => this.update());

            // Poll for cart changes
            let lastToken = null;
            let lastCount = null;
            setInterval(async () => {
                try {
                    const cart = await CartCleanup.fetchCart();
                    if (cart.token !== lastToken || cart.item_count !== lastCount) {
                        lastToken = cart.token;
                        lastCount = cart.item_count;
                        this.update();
                    }
                } catch {}
            }, 1500);
        }
    };

    // ============================================
    // INITIALIZATION
    // ============================================

    function init() {
        console.log('[RadiusBundles] Initializing...', {
            shop: config.shop,
            pageType: config.pageType,
            analyticsEnabled: config.enableAnalytics
        });

        // Track page view
        if (config.enableAnalytics) {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    Analytics.trackPageView();
                });
            } else {
                Analytics.trackPageView();
            }
        }

        // Initialize cart cleanup
        CartCleanup.init();

        // Initialize savings banner
        SavingsBanner.init();

        // Listen for bundle events from widgets
        document.addEventListener('bundle:viewed', (e) => {
            Analytics.trackBundleView(e.detail.bundleId, e.detail.productId);
        });

        document.addEventListener('bundle:addedToCart', (e) => {
            Analytics.trackAddToCart(e.detail.bundleId, e.detail);
        });

        console.log('[RadiusBundles] Initialized successfully');
    }

    // ============================================
    // PUBLIC API
    // ============================================

    window.RadiusBundles = window.RadiusBundles || {};

    // Export methods
    window.RadiusBundles.track = Analytics.track.bind(Analytics);
    window.RadiusBundles.trackBundleView = Analytics.trackBundleView.bind(Analytics);
    window.RadiusBundles.trackAddToCart = Analytics.trackAddToCart.bind(Analytics);
    window.RadiusBundles.cleanupCart = CartCleanup.cleanup.bind(CartCleanup);
    window.RadiusBundles.triggerCleanup = CartCleanup.trigger.bind(CartCleanup);
    window.RadiusBundles.isBundleActive = CartCleanup.isBundleActive.bind(CartCleanup);
    window.RadiusBundles.getBundleSettings = CartCleanup.getBundleSettings.bind(CartCleanup);

    // Initialize when ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();