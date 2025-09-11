(function (window, document) {
    "use strict";

    if (window.ProductBundleWidget) return;

    class ProductBundleWidget {
        constructor(containerElement = null) {
            this.container = containerElement;
            this.shop = this.getShopDomain();
            this.productId = this.getProductId();
            this.bundles = [];
            this.settings = this.getSettings();
            this.cache = new Map();
            this.isLoading = false;

            if (this.shop && this.productId) {
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
            var jsonLd = document.querySelector(
                'script[type="application/ld+json"]',
            );
            if (jsonLd) {
                try {
                    var data = JSON.parse(jsonLd.textContent);
                    if (data.productID)
                        return "gid://shopify/Product/" + data.productID;
                } catch (e) {}
            }
            return null;
        }

        getSettings() {
            var defaults = {
                appUrl: this.container?.dataset.appUrl || "",
                layout: "grid",
                theme: "auto",
                showSavings: true,
                showImages: true,
            };

            if (this.container) {
                var keys = Object.keys(defaults);
                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i];
                    var dataKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
                    var value = this.container.dataset[dataKey];
                    if (value !== undefined) {
                        defaults[key] =
                            value === "true"
                                ? true
                                : value === "false"
                                  ? false
                                  : value;
                    }
                }
            }

            return defaults;
        }

        async loadBundles() {
            if (this.isLoading || !this.settings.appUrl) return;

            this.isLoading = true;
            this.showLoading();

            var cacheKey = this.shop + "-" + this.productId;

            if (this.cache.has(cacheKey)) {
                this.bundles = this.cache.get(cacheKey);
                this.renderBundles();
                this.isLoading = false;
                return;
            }

            try {
                var url =
                    this.settings.appUrl +
                    "/api/bundles/product/" +
                    encodeURIComponent(this.productId) +
                    "?shop=" +
                    encodeURIComponent(this.shop);

                var response = await fetch(url);
                if (!response.ok) throw new Error("HTTP " + response.status);

                var data = await response.json();

                if (data.success && data.bundles && data.bundles.length > 0) {
                    this.bundles = data.bundles;
                    this.cache.set(cacheKey, this.bundles);
                    var self = this;
                    setTimeout(
                        function () {
                            self.cache.delete(cacheKey);
                        },
                        5 * 60 * 1000,
                    );
                    this.renderBundles();
                } else {
                    this.hideWidget();
                }
            } catch (error) {
                console.error("Failed to load bundles:", error);
                this.hideWidget();
            } finally {
                this.isLoading = false;
                this.hideLoading();
            }
        }

        showLoading() {
            if (this.container) {
                var loading = this.container.querySelector(
                    ".bundle-widget-loading",
                );
                if (loading) loading.style.display = "flex";
            }
        }

        hideLoading() {
            if (this.container) {
                var loading = this.container.querySelector(
                    ".bundle-widget-loading",
                );
                if (loading) loading.style.display = "none";
            }
        }

        renderBundles() {
            if (!this.bundles.length || !this.container) {
                this.hideWidget();
                return;
            }

            var bundle = this.bundles[0];

            this.container.innerHTML = this.generateBundleHTML(bundle);
            this.container.className =
                "bundle-widget bundle-widget--" +
                this.settings.layout +
                " bundle-widget--" +
                this.settings.theme;

            this.bindEvents();
            this.loadProductData(bundle);
        }

        generateBundleHTML(bundle) {
            return (
                '<div class="bundle-container" data-bundle-id="' +
                bundle.id +
                '">' +
                '<div class="bundle-header">' +
                '<h3 class="bundle-title">' +
                this.escapeHtml(bundle.name) +
                "</h3>" +
                (this.settings.showSavings
                    ? this.generateSavingsHTML(bundle)
                    : "") +
                "</div>" +
                '<div class="bundle-products bundle-products--' +
                this.settings.layout +
                '">' +
                this.generateProductsHTML(bundle) +
                "</div>" +
                '<div class="bundle-actions">' +
                '<button class="bundle-add-to-cart" data-bundle-id="' +
                bundle.id +
                '" type="button">' +
                '<span class="bundle-btn-text">Add Bundle to Cart</span>' +
                '<span class="bundle-btn-spinner" style="display: none;">Adding...</span>' +
                "</button>" +
                "</div>" +
                '<div class="bundle-messages" role="alert" aria-live="polite"></div>' +
                "</div>"
            );
        }

        generateSavingsHTML(bundle) {
            if (bundle.discountType === "PERCENTAGE") {
                return (
                    '<span class="bundle-savings">Save ' +
                    bundle.discountValue +
                    "%</span>"
                );
            } else if (bundle.discountType === "FIXED_AMOUNT") {
                return (
                    '<span class="bundle-savings">Save $' +
                    bundle.discountValue +
                    "</span>"
                );
            }
            return "";
        }

        generateProductsHTML(bundle) {
            var currentProductId = this.productId;
            var html = "";

            for (var i = 0; i < bundle.products.length; i++) {
                var product = bundle.products[i];
                if (product.id !== currentProductId) {
                    html +=
                        '<div class="bundle-product ' +
                        (product.isRequired ? "required" : "optional") +
                        '" ' +
                        'data-product-id="' +
                        product.id +
                        '" ' +
                        'data-variant-id="' +
                        product.variantId +
                        '" ' +
                        'data-quantity="' +
                        product.quantity +
                        '">' +
                        (this.settings.showImages
                            ? this.generateImagePlaceholder()
                            : "") +
                        '<div class="bundle-product-info">' +
                        '<div class="bundle-product-title">Loading...</div>' +
                        '<div class="bundle-product-quantity">Qty: ' +
                        product.quantity +
                        "</div>" +
                        '<div class="bundle-product-badge">' +
                        (product.isRequired ? "Required" : "Optional") +
                        "</div>" +
                        "</div>" +
                        (!product.isRequired
                            ? '<input type="checkbox" class="bundle-product-checkbox" checked>'
                            : "") +
                        "</div>";
                }
            }

            return html;
        }

        generateImagePlaceholder() {
            return '<div class="bundle-product-image"><div class="placeholder">📦</div></div>';
        }

        bindEvents() {
            if (!this.container) return;

            var addToCartBtn = this.container.querySelector(
                ".bundle-add-to-cart",
            );
            if (addToCartBtn) {
                var self = this;
                addToCartBtn.addEventListener("click", function (e) {
                    self.handleAddToCart(e);
                });
            }
        }

        handleAddToCart(event) {
            event.preventDefault();
            console.log("Bundle add to cart clicked");
            this.showMessage("Bundle functionality coming soon!", "info");
        }

        showMessage(message, type) {
            var messagesContainer =
                this.container &&
                this.container.querySelector(".bundle-messages");
            if (!messagesContainer) return;

            var messageEl = document.createElement("div");
            messageEl.className = "bundle-message bundle-message--" + type;
            messageEl.textContent = message;

            messagesContainer.appendChild(messageEl);

            setTimeout(function () {
                if (messageEl.parentNode) {
                    messageEl.remove();
                }
            }, 5000);
        }

        hideWidget() {
            if (this.container) {
                this.container.style.display = "none";
            }
        }

        escapeHtml(text) {
            var div = document.createElement("div");
            div.textContent = text;
            return div.innerHTML;
        }

        loadProductData(bundle) {
            // Placeholder for product data loading
            console.log("Loading product data for bundle:", bundle.id);
        }
    }

    window.ProductBundleWidget = ProductBundleWidget;
})(window, document);
