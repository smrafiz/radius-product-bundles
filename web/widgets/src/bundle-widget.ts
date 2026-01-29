import "./scss/index.scss";

/**
 * Radius Bundle Widget - Product Page
 */

declare global {
    interface Window {
        Shopify?: {
            formatMoney?: (cents: number) => string;
        };
    }
}

(function () {
    "use strict";

    /**
     * Bundle Product Interface
     */
    interface BundleProduct {
        id: string;
        variantId: string;
        quantity: number;
        role: "INCLUDED" | "OPTIONAL";
        displayOrder: number;
        isRequired: boolean;
        title: string;
        price: number;
        compareAtPrice: number;
        featuredImage: string | null;
        handle: string;
    }

    /**
     * Bundle Structure Interface
     */
    interface BundleStructure {
        id: string;
        status: string;
        name: string;
        discountType:
            | "PERCENTAGE"
            | "FIXED_AMOUNT"
            | "CUSTOM_PRICE"
            | "NO_DISCOUNT";
        discountValue: number;
        freeShipping: boolean;
        minOrderValue: number;
        maxDiscountAmount: number;
        discountApplication: "bundle" | "products";
        discountedProductIds: string[];
        productCount: number;
        productIds: string[];
        layout: string;
        labels: {
            buttonText: string;
            regularPriceLabel: string;
            bundlePriceLabel: string;
            youSaveLabel: string;
            freeShippingLabel: string;
            quantityLabel: string;
            savingsBadgeText: string;
        };
    }

    /*
     * Bundle Interface
     */
    interface Bundle extends BundleStructure {
        products: BundleProduct[];
    }

    /*
     * Bundle Response Interface
     */
    interface BundleResponse {
        success: boolean;
        bundles: Bundle[];
        count: number;
    }

    /*
     * Product Details Response Interface
     */
    interface ProductDetailsResponse {
        success: boolean;
        products: Array<{
            id: string;
            title: string;
            price: number;
            compareAtPrice: number;
            image: string | null;
            handle: string;
            variantId: string;
            available: boolean;
        }>;
    }

    /*
     * Cart Add Item Interface
     */
    interface CartAddItem {
        id: string;
        quantity: number;
        properties?: Record<string, string>;
    }

    /*
     * Discount Config Interface
     */
    interface DiscountConfig {
        bundleId: string;
        bundleName: string;
        discountType: string;
        discountValue: number;
        requiredLineCount: number;
        minOrderValue: number;
        maxDiscountAmount: number;
        discountApplication: string;
        discountedProductIds: string[];
        freeShipping: boolean;
    }

    /**
     * Radius Bundle Widget Class
     */
    class RadiusBundleWidget {
        private container: HTMLElement;
        private readonly bundleId: string;
        private readonly productId: string;
        private readonly shop: string;
        private readonly bundleStructure: BundleStructure | null = null;
        private bundle: Bundle | null = null;
        private readonly showImages: boolean = true;
        private readonly showSavingsBadge: boolean = true;
        private readonly showPrices: boolean = true;
        private readonly showComparePrices: boolean = true;
        private readonly showQuantity: boolean = true;
        private readonly enableHyperLink: boolean = false;

        /*
         * Constructor
         */
        constructor(container: HTMLElement) {
            this.container = container;
            this.bundleId = container.dataset.bundleId || "";
            this.productId =
                container
                    .closest("[data-product-id]")
                    ?.getAttribute("data-product-id") || "";
            this.shop =
                container.closest("[data-shop]")?.getAttribute("data-shop") ||
                "";

            this.showImages = container.dataset.showImages !== "false";
            this.showSavingsBadge =
                container.dataset.showSavingsBadge !== "false";
            this.showPrices = container.dataset.showPrices !== "false";
            this.showComparePrices =
                container.dataset.showComparePrices !== "false";
            this.showQuantity = container.dataset.showQuantity !== "false";
            this.enableHyperLink =
                container.dataset.enableHyperlink !== "false";

            // Parse structure from Liquid
            const structureJson = container.dataset.bundleStructure;
            if (structureJson) {
                try {
                    this.bundleStructure = JSON.parse(structureJson);
                } catch (e) {
                    console.warn(
                        "[RadiusBundle] Failed to parse bundle structure:",
                        e,
                    );
                }
            }

            void this.init();
        }

        /*
         * Initialize widget
         */
        private async init(): Promise<void> {
            if (!this.bundleId || !this.productId || !this.shop) {
                console.warn("[RadiusBundle] Missing required data attributes");
                return;
            }

            // Show the badge immediately
            if (this.bundleStructure) {
                this.updateBadgeFromStructure(this.bundleStructure);
            }

            // Track bundle view
            this.trackBundleView();

            // Fetch product details only
            await this.loadProductDetails();
            this.bindEvents();
        }

        /**
         * Shows badge from structure.
         */
        private updateBadgeFromStructure(structure: BundleStructure): void {
            const badgeEl = this.container.querySelector("[data-bundle-badge]");

            if (!badgeEl) {
                return;
            }

            let badgeText = "";

            if (structure.discountValue && structure.discountValue > 0) {
                switch (structure.discountType) {
                    case "PERCENTAGE":
                        badgeText = this.formatLabel(
                            structure.labels?.savingsBadgeText ?? "Save {percent}%",
                            { percent: structure.discountValue }
                        );
                        break;

                    case "FIXED_AMOUNT":
                        badgeText = this.formatLabel(
                            structure.labels?.savingsBadgeText ?? "Save {amount}",
                            { amount: this.formatMoney(structure.discountValue) }
                        );
                        break;

                    case "CUSTOM_PRICE":
                        badgeText = "Special Price";
                        break;
                }
            }

            if (badgeText && this.showSavingsBadge) {
                badgeEl.textContent = badgeText;
                badgeEl.classList.add("radius-bundle__badge--visible");
            } else {
                (badgeEl as HTMLElement).style.display = "none";
            }
        }

        /**
         * Track bundle view event
         */
        private trackBundleView(): void {
            let viewTimeout: number;

            try {
                const observer = new IntersectionObserver(
                    (entries) => {
                        entries.forEach((entry) => {
                            if (entry.isIntersecting) {
                                viewTimeout = window.setTimeout(() => {
                                    if (entry.isIntersecting) {
                                        document.dispatchEvent(
                                            new CustomEvent("bundle:viewed", {
                                                detail: {
                                                    bundleId: this.bundleId,
                                                    productId:
                                                        this.extractNumericId(
                                                            this.productId,
                                                        ),
                                                },
                                                bubbles: true,
                                            }),
                                        );

                                        console.log(
                                            "[RadiusBundle] Bundle view triggered:",
                                            {
                                                bundleId: this.bundleId,
                                                productId: this.productId,
                                            },
                                        );

                                        // Stop observing after tracking once
                                        observer.unobserve(this.container);
                                    }
                                }, 1000);
                            } else {
                                clearTimeout(viewTimeout);
                            }
                        });
                    },
                    { threshold: 0.5 }, // Trigger when 50% visible
                );

                observer.observe(this.container);
            } catch (error) {
                console.error(
                    "[RadiusBundle] Failed to track bundle view:",
                    error,
                );
            }
        }

        /**
         * Fetches ONLY product details.
         */
        private async loadProductDetails(): Promise<void> {
            try {
                if (!this.bundleStructure?.productIds?.length) {
                    console.warn(
                        "[RadiusBundle] No product IDs, using legacy fetch",
                    );
                    await this.loadBundleLegacy();
                    return;
                }

                console.log(
                    `[RadiusBundle] Fetching ${this.bundleStructure.productIds.length} products`,
                );

                // Fetch products by IDs only
                const productIds = this.bundleStructure.productIds.join(",");
                const url = `/apps/bundles/products?shop=${encodeURIComponent(this.shop)}&ids=${encodeURIComponent(productIds)}`;

                const response = await fetch(url);

                if (!response.ok) {
                    this.showToast(`API error: ${response.status}`, "error");
                }

                const data: ProductDetailsResponse = await response.json();

                if (!data.success || !data.products) {
                    this.showToast("No products returned", "error");
                }

                // Build bundle from structure + product details
                this.bundle = {
                    ...this.bundleStructure,
                    products: this.matchProductsToStructure(data.products),
                } as Bundle;

                if (!this.bundle) {
                    this.showError("Bundle not available");
                    return;
                }

                this.renderProducts(this.bundle);
                this.updatePricing(this.bundle);
            } catch (error) {
                console.error("[RadiusBundle] Load error:", error);
                this.showError("Failed to load bundle");
            }
        }

        /**
         * Matches fetched products to structure.
         */
        private matchProductsToStructure(
            products: ProductDetailsResponse["products"],
        ): BundleProduct[] {
            if (!this.bundleStructure?.productIds) {
                return [];
            }

            const productMap = new Map(products.map((p) => [p.id, p]));

            return this.bundleStructure.productIds.map((productId, index) => {
                const product = productMap.get(productId);

                return {
                    id: productId,
                    variantId: product?.variantId || "",
                    quantity: 1,
                    role: "INCLUDED" as const,
                    displayOrder: index,
                    isRequired: true,
                    title: product?.title || "Loading...",
                    price: product?.price || 0,
                    compareAtPrice: product?.compareAtPrice || 0,
                    featuredImage: product?.image || null,
                    handle: product?.handle || "",
                };
            });
        }

        /**
         * Fallback: Legacy bundle fetch.
         */
        private async loadBundleLegacy(): Promise<void> {
            try {
                const url = `/apps/bundles/products?productId=${encodeURIComponent(this.productId)}&shop=${encodeURIComponent(this.shop)}&bundleId=${encodeURIComponent(this.bundleId)}`;
                const response = await fetch(url);

                if (!response.ok) {
                    this.showToast(`API error: ${response.status}`, "error");
                }

                const data: BundleResponse = await response.json();

                if (!data.success || !data.bundles?.length) {
                    this.showToast("No bundles returned", "error");
                }

                this.bundle =
                    data.bundles.find((b) => b.id === this.bundleId) ||
                    data.bundles[0];

                if (!this.bundle) {
                    this.showError("Bundle not available");
                    return;
                }

                this.renderProducts(this.bundle);
                this.updatePricing(this.bundle);
            } catch (error) {
                console.error("[RadiusBundle] Legacy fetch error:", error);
                this.showError("Failed to load bundle");
            }
        }

        private getQuantityLabel(): string {
            return (
                this.bundleStructure?.labels?.quantityLabel ||
                "Qty:"
            );
        }

        /**
         * Renders products (replacing skeleton).
         */
        private renderProducts(bundle: Bundle): void {
            const productsContainer = this.container.querySelector(
                "[data-bundle-products]",
            );

            if (!productsContainer) {
                return;
            }

            const layout = this.getLayout();
            const sortedProducts = [...bundle.products].sort(
                (a, b) => a.displayOrder - b.displayOrder,
            );

            let html = "";

            sortedProducts.forEach((product, index) => {
                const isLast = index === sortedProducts.length - 1;
                html += this.renderProductCard(product, layout);

                if (["list"].includes(layout) && !isLast) {
                    html +=
                        '<div class="radius-bundle__divider-plus"><div class="divider-position">+</div></div>';
                }
            });

            productsContainer.innerHTML = html;

            if (layout === "slider") {
                this.initSliderDots(sortedProducts.length);
            }
        }

        /**
         * Renders a single product card.
         */
        private renderProductCard(
            product: BundleProduct,
            layout: string,
        ): string {
            const imageHtml =
                this.showImages && product.featuredImage
                    ? `<img src="${this.escapeHtml(product.featuredImage)}" alt="${this.escapeHtml(product.title)}" loading="lazy" />`
                    : this.showImages
                      ? `<div class="radius-bundle__product-placeholder">📦</div>`
                      : "";

            // Calculate discounted price based on bundle discount
            const structure = this.bundleStructure;
            let discountedPrice = product.price;

            if (structure && structure.discountValue > 0) {
                switch (structure.discountType) {
                    case "PERCENTAGE":
                        discountedPrice =
                            product.price * (1 - structure.discountValue / 100);
                        break;
                    case "FIXED_AMOUNT":
                        // For a fixed amount, distribute proportionally across products
                        const totalPrice =
                            this.bundle?.products.reduce(
                                (sum, p) => sum + p.price,
                                0,
                            ) || product.price;
                        const proportion = product.price / totalPrice;
                        const productDiscount =
                            structure.discountValue * proportion;
                        discountedPrice = Math.max(
                            0,
                            product.price - productDiscount,
                        );
                        break;
                    case "CUSTOM_PRICE":
                        // For custom price, distribute proportionally
                        const totalRegular =
                            this.bundle?.products.reduce(
                                (sum, p) => sum + p.price,
                                0,
                            ) || product.price;
                        const priceRatio = product.price / totalRegular;
                        discountedPrice = structure.discountValue * priceRatio;
                        break;
                    default:
                        discountedPrice = product.price;
                }
            }

            // Round to the nearest cent
            discountedPrice = Math.round(discountedPrice);

            const priceHtml =
                product.compareAtPrice > product.price
                    ? `<span class="radius-bundle__product-price-current">${this.formatMoney(discountedPrice)}</span>
               ${this.showComparePrices ? `<span class="radius-bundle__product-price-compare">${this.formatMoney(product.price)}</span>` : ""} `
                    : discountedPrice < product.price
                      ? `<span class="radius-bundle__product-price-current">${this.formatMoney(discountedPrice)}</span>
                   ${this.showComparePrices ? `<span class="radius-bundle__product-price-compare">${this.formatMoney(product.price)}</span>` : ""} `
                      : `<span class="radius-bundle__product-price-current">${this.formatMoney(product.price)}</span>`;

            const imageWrapper = this.showImages
                ? `<div class="radius-bundle__product-image">${imageHtml}</div>`
                : "";

            const productUrl = product.handle
                ? `/products/${product.handle}`
                : "#";
            const productTitleHtml = this.enableHyperLink
                ? `<h4 class="radius-bundle__product-title"><a href="${productUrl}">${this.escapeHtml(product.title)}</a></h4>`
                : `<h4 class="radius-bundle__product-title">${this.escapeHtml(product.title)}</h4>`;

            // List layout
            if (layout === "list") {
                return `
                    <div class="radius-bundle__product radius-bundle__product--list" 
                    data-product-id="${product.id}" 
                    data-variant-id="${product.variantId}">
                        ${imageWrapper}
                        <div class="radius-bundle__product-info">
                            ${productTitleHtml}
                            ${this.showQuantity ? `<div class="radius-bundle__product-quantity">${this.getQuantityLabel()} ${product.quantity}</div>` : ""}
                        </div>
                        ${
                            this.showPrices
                                ? `
                            <div class="radius-bundle__product-price">
                                ${priceHtml}
                            </div>
                        `
                                : ""
                        }
                    </div>
                `;
            }

            // Grid layout
            if (layout === "grid") {
                return `
                    <div class="radius-bundle__product radius-bundle__product--grid" 
                         data-product-id="${product.id}" 
                         data-variant-id="${product.variantId}">
                        ${imageWrapper}
                        ${productTitleHtml}
                        ${
                            this.showPrices
                                ? `<div class="radius-bundle__product-price">${priceHtml}</div>`
                                : ""
                        }
                        ${this.showQuantity ? `<div class="radius-bundle__product-quantity">${this.getQuantityLabel()} ${product.quantity}</div>` : ""}
                    </div>
                `;
            }

            // Compact layout
            if (layout === "compact") {
                return `
            <div class="radius-bundle__product radius-bundle__product--compact" 
                data-product-id="${product.id}" 
                data-variant-id="${product.variantId}">
                ${imageWrapper}
                <div class="radius-bundle__product-info radius-bundle__product-info--compact">
                    ${productTitleHtml}
                    ${this.showQuantity ? `<div class="radius-bundle__product-quantity">${this.getQuantityLabel()} ${product.quantity}</div>` : ""}
                </div>
                ${
                    this.showPrices
                        ? `
                        <div class="radius-bundle__product-price">
                            ${priceHtml}
                        </div>
                    `
                        : ""
                }
            </div>`;
            }

            // Slider layout
            return `
            <div class="radius-bundle__product radius-bundle__product--slider" 
                data-product-id="${product.id}" 
                data-variant-id="${product.variantId}">
                ${imageWrapper}
                ${productTitleHtml}
                ${
                    this.showPrices
                        ? `<div class="radius-bundle__product-price">${priceHtml}</div>`
                        : ""
                }
                ${this.showQuantity ? `<div class="radius-bundle__product-quantity">${this.getQuantityLabel()} ${product.quantity}</div>` : ""}
            </div>`;
        }

        /**
         * Updates pricing display.
         */
        private updatePricing(bundle: Bundle): void {
            const originalTotal = bundle.products.reduce(
                (sum, product) => sum + product.price * product.quantity,
                0,
            );

            let discountAmount: number;
            let bundleTotal: number;

            const structure = this.bundleStructure || bundle;

            switch (structure.discountType) {
                case "PERCENTAGE":
                    discountAmount =
                        originalTotal * (structure.discountValue / 100);
                    bundleTotal = originalTotal - discountAmount;
                    break;
                case "FIXED_AMOUNT":
                    discountAmount = structure.discountValue;
                    bundleTotal = originalTotal - discountAmount;
                    break;
                case "CUSTOM_PRICE":
                    bundleTotal = structure.discountValue;
                    discountAmount = originalTotal - bundleTotal;
                    break;
                default:
                    discountAmount = 0;
                    bundleTotal = originalTotal;
            }

            bundleTotal = Math.max(0, bundleTotal);
            discountAmount = Math.max(0, discountAmount);

            const regularPriceEl = this.container.querySelector(
                "[data-regular-price]",
            );
            const bundlePriceEl = this.container.querySelector(
                "[data-bundle-price]",
            );
            const savingsEl = this.container.querySelector("[data-savings]");
            const savingsAmountEl = this.container.querySelector(
                "[data-savings-amount]",
            );

            if (regularPriceEl) {
                regularPriceEl.textContent = this.formatMoney(originalTotal);
            }

            if (bundlePriceEl) {
                bundlePriceEl.textContent = this.formatMoney(bundleTotal);
            }

            if (savingsEl && savingsAmountEl && discountAmount > 0) {
                savingsAmountEl.textContent = this.formatMoney(discountAmount);
                (savingsEl as HTMLElement).style.display = "flex";
            }
        }

        /**
         * Binds event listeners.
         */
        private bindEvents(): void {
            const addToCartBtn = this.container.querySelector(
                "[data-bundle-add-to-cart]",
            );

            if (addToCartBtn) {
                addToCartBtn.addEventListener("click", () =>
                    this.handleAddToCart(),
                );
            }

            const prevBtn = this.container.querySelector("[data-slider-prev]");
            const nextBtn = this.container.querySelector("[data-slider-next]");

            if (prevBtn) {
                prevBtn.addEventListener("click", () =>
                    this.slideProducts("prev"),
                );
            }
            if (nextBtn) {
                nextBtn.addEventListener("click", () =>
                    this.slideProducts("next"),
                );
            }
        }

        /**
         * Handles add to cart.
         */
        private async handleAddToCart(): Promise<void> {
            if (!this.bundle) {
                return;
            }

            const button = this.container.querySelector(
                "[data-bundle-add-to-cart]",
            ) as HTMLButtonElement;

            if (!button) {
                return;
            }

            button.classList.add("is-loading");
            button.disabled = true;

            try {
                const cartItems: CartAddItem[] = this.bundle.products
                    .filter(
                        (p) => p.role === "INCLUDED" || p.role === "OPTIONAL",
                    )
                    .filter((p) => p.variantId)
                    .map((p) => ({
                        id: this.extractNumericId(p.variantId),
                        quantity: p.quantity,
                        properties: {
                            _bundle_id: this.bundle!.id,
                            _bundle_name: this.bundle!.name,
                            _product_id: p.id,
                        },
                    }));

                if (cartItems.length === 0) {
                    this.showToast("No valid products to add to cart", "error");
                }

                const addResponse = await fetch("/cart/add.js", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ items: cartItems }),
                });

                if (!addResponse.ok) {
                    const errorData = await addResponse
                        .json()
                        .catch(() => ({}));
                    this.showToast(
                        errorData.description ||
                            `Failed to add to cart: ${addResponse.status}`,
                        "error",
                    );
                }

                const cart = await fetch("/cart.js").then((r) => r.json());

                let existingDiscounts: DiscountConfig[] = [];

                if (cart.attributes?._radiusDiscounts) {
                    try {
                        existingDiscounts = JSON.parse(
                            cart.attributes._radiusDiscounts,
                        );
                    } catch {
                        existingDiscounts = [];
                    }
                }

                const structure = this.bundleStructure || this.bundle;

                const newDiscount: DiscountConfig = {
                    bundleId: this.bundle.id,
                    bundleName: this.bundle.name,
                    discountType: structure.discountType || "PERCENTAGE",
                    discountValue: structure.discountValue || 0,
                    requiredLineCount: this.bundle.products.filter(
                        (p) => p.role === "INCLUDED",
                    ).length,
                    minOrderValue: structure.minOrderValue || 0,
                    maxDiscountAmount: structure.maxDiscountAmount || 0,
                    discountApplication:
                        structure.discountApplication || "bundle",
                    discountedProductIds: structure.discountedProductIds || [],
                    freeShipping: structure.freeShipping || false,
                };

                existingDiscounts = existingDiscounts.filter(
                    (d) => d.bundleId !== this.bundle!.id,
                );
                existingDiscounts.push(newDiscount);

                await fetch("/cart/update.js", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        attributes: {
                            _radiusDiscounts: JSON.stringify(existingDiscounts),
                        },
                    }),
                });

                this.showToast("Bundle added to cart!", "success");

                // ✅ Calculate totals for tracking
                const totalValue = cartItems.reduce((sum, item) => {
                    const product = this.bundle?.products.find(
                        (p) => this.extractNumericId(p.variantId) === item.id,
                    );
                    return sum + (product?.price || 0) * item.quantity;
                }, 0);

                // ✅ Calculate discount/savings
                let discountValue = 0;
                if (newDiscount.discountType === "PERCENTAGE") {
                    discountValue =
                        (totalValue * newDiscount.discountValue) / 100;
                } else if (newDiscount.discountType === "FIXED_AMOUNT") {
                    discountValue = newDiscount.discountValue;
                }

                // ✅ Dispatch enhanced event with tracking data
                this.container.dispatchEvent(
                    new CustomEvent("bundle:addedToCart", {
                        detail: {
                            bundleId: this.bundleId,
                            productIds: cartItems.map((item) => item.id),
                            totalValue: totalValue,
                            discountValue: discountValue,
                            bundle: this.bundle,
                            cartItems,
                            discountConfig: newDiscount,
                        },
                        bubbles: true,
                    }),
                );

                console.log("[RadiusBundle] Bundle added to cart:", {
                    bundleId: this.bundleId,
                    productCount: cartItems.length,
                    totalValue: totalValue,
                    discountValue: discountValue,
                });

                document.dispatchEvent(new CustomEvent("cart:refresh"));
                await this.updateCartCount();
            } catch (error) {
                console.error("[RadiusBundle] Add to cart error:", error);
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Failed to add bundle to cart";
                this.showToast(errorMessage, "error");
            } finally {
                button.classList.remove("is-loading");
                button.disabled = false;
            }
        }

        /**
         * Slides products in the carousel
         */
        private slideProducts(direction: "prev" | "next"): void {
            const track = this.container.querySelector(
                "[data-slider-track]",
            ) as HTMLElement;

            if (!track) {
                return;
            }

            const scrollAmount = 200;

            if (direction === "prev") {
                track.scrollBy({ left: -scrollAmount, behavior: "smooth" });
            } else {
                track.scrollBy({ left: scrollAmount, behavior: "smooth" });
            }
        }

        /**
         * Initializes slider dots
         */
        private initSliderDots(count: number): void {
            const dotsContainer =
                this.container.querySelector("[data-slider-dots]");

            if (!dotsContainer || count <= 1) {
                return;
            }

            let html = "";

            for (let i = 0; i < count; i++) {
                html += `<button class="radius-bundle__slider-dot${i === 0 ? " active" : ""}" data-index="${i}"></button>`;
            }

            dotsContainer.innerHTML = html;
        }

        /**
         * Updates cart count
         */
        private async updateCartCount(): Promise<void> {
            try {
                const cart = await fetch("/cart.js").then((r) => r.json());
                const cartLink = document.querySelector("#cart-icon-bubble");

                if (cartLink && cart.item_count > 0) {
                    let bubble = cartLink.querySelector(".cart-count-bubble");

                    if (!bubble) {
                        bubble = document.createElement("div");
                        bubble.className = "cart-count-bubble";
                        bubble.innerHTML = `
                        <span aria-hidden="true">${cart.item_count}</span>
                        <span class="visually-hidden">${cart.item_count} items</span>
                    `;
                        cartLink.appendChild(bubble);
                    } else {
                        const countSpan = bubble.querySelector(
                            '[aria-hidden="true"]',
                        );
                        const srSpan = bubble.querySelector(".visually-hidden");

                        if (countSpan)
                            countSpan.textContent = cart.item_count.toString();

                        if (srSpan) {
                            srSpan.textContent = `${cart.item_count} items`;
                        }

                        (bubble as HTMLElement).style.display = "flex";
                    }
                }
            } catch (e) {
                console.warn("[RadiusBundle] Could not update cart count:", e);
            }
        }

        /**
         * Gets layout
         */
        private getLayout(): string {
            if (this.container.classList.contains("radius-bundle--grid")) {
                return "grid";
            }

            if (this.container.classList.contains("radius-bundle--carousel")) {
                return "slider";
            }

            if (this.container.classList.contains("radius-bundle--compact")) {
                return "compact";
            }
            return "list";
        }

        /**
         * Shows toast notification
         */
        private showToast(message: string, type: "success" | "error"): void {
            // Remove any existing toasts
            const existingToast = document.querySelector(
                ".radius-bundle-toast",
            );

            if (existingToast) {
                existingToast.remove();
            }

            // Create toast element
            const toast = document.createElement("div");
            toast.className = `radius-bundle-toast radius-bundle-toast--${type}`;

            // Icon based on type
            const icon =
                type === "success"
                    ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>'
                    : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';

            toast.innerHTML = `
                <div class="radius-bundle-toast__icon">${icon}</div>
                <div class="radius-bundle-toast__message">${this.escapeHtml(message)}</div>
                <button class="radius-bundle-toast__close" aria-label="Close">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            `;

            // Add to body
            document.body.appendChild(toast);

            // Trigger animation
            requestAnimationFrame(() => {
                toast.classList.add("radius-bundle-toast--visible");
            });

            // Close button handler
            const closeBtn = toast.querySelector(".radius-bundle-toast__close");
            const closeToast = () => {
                toast.classList.remove("radius-bundle-toast--visible");
                setTimeout(() => toast.remove(), 300);
            };

            if (closeBtn) {
                closeBtn.addEventListener("click", closeToast);
            }

            // Auto-hide after 4 seconds
            setTimeout(closeToast, 4000);
        }

        /**
         * Shows error message
         */
        private showError(message: string): void {
            const productsContainer = this.container.querySelector(
                "[data-bundle-products]",
            );
            if (productsContainer) {
                productsContainer.innerHTML = `<div class="radius-bundle__error">${message}</div>`;
            }
        }

        /**
         * Formats money
         */
        private formatMoney(cents: number): string {
            if (typeof window.Shopify?.formatMoney === "function") {
                return window.Shopify.formatMoney(cents);
            }
            return `$${(cents / 100).toFixed(2)}`;
        }

        /**
         * Extracts numeric ID from GID
         */
        private extractNumericId(gid: string): string {
            if (!gid) return "";
            if (/^\d+$/.test(gid)) return gid;
            const match = gid.match(/\/(\d+)$/);
            return match ? match[1] : gid;
        }

        /**
         * Escapes HTML
         */
        private escapeHtml(text: string): string {
            const div = document.createElement("div");
            div.textContent = text;

            return div.innerHTML;
        }

        /*
         * Formats label
         */
        private formatLabel(
            template: string,
            values: Record<string, string | number>
        ): string {
            return template.replace(/\{(\w+)\}/g, (_, key) =>
                values[key] !== undefined ? String(values[key]) : ""
            );
        }
    }

    /**
     * Initializes radius bundles
     */
    function initRadiusBundles(): void {
        const bundles = document.querySelectorAll<HTMLElement>(
            ".radius-bundle[data-bundle-id]",
        );

        bundles.forEach((container) => {
            try {
                new RadiusBundleWidget(container);
            } catch (error) {
                console.error(
                    "[RadiusBundle] Failed to initialize widget:",
                    error,
                );
            }
        });
    }

    // Auto-initialize
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initRadiusBundles);
    } else {
        initRadiusBundles();
    }

    (window as any).RadiusBundleWidget = RadiusBundleWidget;
})();
