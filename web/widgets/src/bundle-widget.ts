import "./bundle-widget.scss";

/**
 * Radius Bundle Widget - TypeScript
 *
 * Handles bundle widget functionality with pre-loaded config from Liquid.
 * - Uses pre-loaded bundle config from data attributes for instant rendering
 * - Fetches product data from API (products not stored in metafields)
 * - Handles add to cart
 * - Handles slider navigation
 * - Updates pricing display
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

interface BundleConfig {
    id: string;
    status: string;
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
}

interface Bundle extends BundleConfig {
    name: string;
    description?: string;
    products: BundleProduct[];
}

interface BundleResponse {
    success: boolean;
    bundles: Bundle[];
    count: number;
}

interface CartAddItem {
    id: string;
    quantity: number;
    properties?: Record<string, string>;
}

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

declare global {
    interface Window {
        Shopify?: {
            formatMoney?: (cents: number) => string;
        };
        RadiusBundleWidget: typeof RadiusBundleWidget;
    }
}

/**
 * Radius Bundle Widget Class
 * Manages a single bundle widget instance.
 */
class RadiusBundleWidget {
    private container: HTMLElement;
    private bundleId: string;
    private productId: string;
    private shop: string;
    private bundleConfig: BundleConfig | null = null;
    private bundle: Bundle | null = null;
    private showImages: boolean = true;
    private showSavings: boolean = true;

    /**
     * Creates a new RadiusBundleWidget instance.
     *
     * @param container - The bundle container element
     */
    constructor(container: HTMLElement) {
        this.container = container;
        this.bundleId = container.dataset.bundleId || "";
        this.productId =
            container
                .closest("[data-product-id]")
                ?.getAttribute("data-product-id") || "";
        this.shop =
            container.closest("[data-shop]")?.getAttribute("data-shop") || "";

        // Parse pre-loaded config from Liquid
        this.showImages = container.dataset.showImages !== "false";
        this.showSavings = container.dataset.showSavings !== "false";

        const configJson = container.dataset.bundleConfig;
        if (configJson) {
            try {
                this.bundleConfig = JSON.parse(configJson);
            } catch (e) {
                console.warn(
                    "[RadiusBundle] Failed to parse bundle config:",
                    e,
                );
            }
        }

        this.init();
    }

    /**
     * Initializes the widget.
     */
    private async init(): Promise<void> {
        if (!this.bundleId || !this.productId || !this.shop) {
            console.warn("[RadiusBundle] Missing required data attributes");
            return;
        }

        // Immediately update badge if we have config (no API call needed)
        if (this.bundleConfig) {
            this.updateBadgeFromConfig(this.bundleConfig);
        }

        // Fetch products from API (products aren't in metafields)
        await this.loadBundle();
        this.bindEvents();
    }

    /**
     * Updates badge immediately from pre-loaded config.
     */
    private updateBadgeFromConfig(config: BundleConfig): void {
        const badgeEl = this.container.querySelector("[data-bundle-badge]");

        if (!badgeEl) return;

        let badgeText = "";

        if (config.discountValue && config.discountValue > 0) {
            switch (config.discountType) {
                case "PERCENTAGE":
                    badgeText = `Save ${config.discountValue}%`;
                    break;
                case "FIXED_AMOUNT":
                    badgeText = `Save ${this.formatMoney(config.discountValue)}`;
                    break;
                case "CUSTOM_PRICE":
                    badgeText = "Special Price";
                    break;
            }
        }

        if (badgeText) {
            badgeEl.innerHTML = badgeText;
            badgeEl.classList.remove("radius-bundle__badge--skeleton");
            badgeEl.classList.add("radius-bundle__badge--visible");
        } else {
            (badgeEl as HTMLElement).style.display = "none";
        }
    }

    /**
     * Fetches bundle data and renders products.
     */
    private async loadBundle(): Promise<void> {
        try {
            const bundle = await this.fetchBundle();

            if (!bundle) {
                this.showError("Bundle not available");
                return;
            }

            this.bundle = bundle;
            this.renderProducts(bundle);
            this.updatePricing(bundle);
            this.updateTitle(bundle);

            console.log(bundle);

            // Update badge with full bundle data (includes name)
            this.updateBadge(bundle);
            this.hideLoading();
        } catch (error) {
            console.error("[RadiusBundle] Load error:", error);
            this.showError("Failed to load bundle");
        }
    }

    /**
     * Fetches bundle data from API.
     */
    private async fetchBundle(): Promise<Bundle | null> {
        try {
            const url = `/apps/bundles/products?productId=${encodeURIComponent(this.productId)}&shop=${encodeURIComponent(this.shop)}&bundleId=${encodeURIComponent(this.bundleId)}`;
            const response = await fetch(url);

            if (!response.ok) {
                console.error(
                    `[RadiusBundle] Fetch failed: ${response.status}`,
                );
                return null;
            }

            const data: BundleResponse = await response.json();

            if (!data.success || !data.bundles?.length) {
                return null;
            }

            return (
                data.bundles.find((b) => b.id === this.bundleId) ||
                data.bundles[0]
            );
        } catch (error) {
            console.error("[RadiusBundle] Fetch error:", error);
            return null;
        }
    }

    /**
     * Renders products into the container.
     */
    private renderProducts(bundle: Bundle): void {
        const productsContainer = this.container.querySelector(
            "[data-bundle-products]",
        );
        if (!productsContainer) return;

        const layout = this.getLayout();
        const sortedProducts = [...bundle.products].sort(
            (a, b) => a.displayOrder - b.displayOrder,
        );

        let html = "";

        sortedProducts.forEach((product, index) => {
            const isLast = index === sortedProducts.length - 1;
            html += this.renderProductCard(product, layout);

            if (layout === "slider" && !isLast) {
                html += '<div class="radius-bundle__slider-plus">+</div>';
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
    private renderProductCard(product: BundleProduct, layout: string): string {
        const imageHtml =
            this.showImages && product.featuredImage
                ? `<img src="${this.escapeHtml(product.featuredImage)}" alt="${this.escapeHtml(product.title)}" loading="lazy" />`
                : this.showImages
                  ? `<div class="radius-bundle__product-placeholder">📦</div>`
                  : "";

        const priceHtml =
            product.compareAtPrice > product.price
                ? `<span class="radius-bundle__product-price-current">${this.formatMoney(product.price)}</span>
                   <span class="radius-bundle__product-price-compare">${this.formatMoney(product.compareAtPrice)}</span>`
                : `<span class="radius-bundle__product-price-current">${this.formatMoney(product.price)}</span>`;

        const imageWrapper = this.showImages
            ? `<div class="radius-bundle__product-image">${imageHtml}</div>`
            : "";

        if (layout === "list") {
            return `
                <div class="radius-bundle__product radius-bundle__product--list" data-product-id="${product.id}" data-variant-id="${product.variantId}">
                    ${imageWrapper}
                    <div class="radius-bundle__product-info">
                        <h4 class="radius-bundle__product-title">${this.escapeHtml(product.title)}</h4>
                        <div class="radius-bundle__product-quantity">Qty: ${product.quantity}</div>
                    </div>
                    <div class="radius-bundle__product-price">
                        ${priceHtml}
                    </div>
                </div>
            `;
        }

        if (layout === "grid") {
            return `
                <div class="radius-bundle__product radius-bundle__product--grid" data-product-id="${product.id}" data-variant-id="${product.variantId}">
                    ${imageWrapper}
                    <h4 class="radius-bundle__product-title">${this.escapeHtml(product.title)}</h4>
                    <div class="radius-bundle__product-price">
                        ${priceHtml}
                    </div>
                    <div class="radius-bundle__product-quantity">Qty: ${product.quantity}</div>
                </div>
            `;
        }

        // Slider layout
        return `
            <div class="radius-bundle__product radius-bundle__product--slider" data-product-id="${product.id}" data-variant-id="${product.variantId}">
                ${imageWrapper}
                <h4 class="radius-bundle__product-title">${this.escapeHtml(product.title)}</h4>
                <div class="radius-bundle__product-price">
                    ${priceHtml}
                </div>
            </div>
        `;
    }

    /**
     * Updates the pricing display.
     */
    private updatePricing(bundle: Bundle): void {
        const originalTotal = bundle.products.reduce(
            (sum, product) => sum + product.price * product.quantity,
            0,
        );

        let discountAmount: number;
        let bundleTotal: number;

        // Use pre-loaded config or bundle data
        const discountType =
            this.bundleConfig?.discountType || bundle.discountType;
        const discountValue =
            this.bundleConfig?.discountValue ?? bundle.discountValue ?? 0;

        switch (discountType) {
            case "PERCENTAGE":
                discountAmount = originalTotal * (discountValue / 100);
                bundleTotal = originalTotal - discountAmount;
                break;
            case "FIXED_AMOUNT":
                discountAmount = discountValue;
                bundleTotal = originalTotal - discountAmount;
                break;
            case "CUSTOM_PRICE":
                bundleTotal = discountValue;
                discountAmount = originalTotal - bundleTotal;
                break;
            default:
                discountAmount = 0;
                bundleTotal = originalTotal;
        }

        // Ensure non-negative
        bundleTotal = Math.max(0, bundleTotal);
        discountAmount = Math.max(0, discountAmount);

        // Update DOM elements
        const originalPriceEl = this.container.querySelector(
            "[data-original-price]",
        );
        const bundlePriceEl = this.container.querySelector(
            "[data-bundle-price]",
        );
        const savingsEl = this.container.querySelector("[data-bundle-savings]");
        const savingsAmountEl = this.container.querySelector(
            "[data-savings-amount]",
        );

        if (originalPriceEl) {
            originalPriceEl.textContent = this.formatMoney(originalTotal);
        }

        if (bundlePriceEl) {
            bundlePriceEl.textContent = this.formatMoney(bundleTotal);
        }

        if (
            savingsEl &&
            savingsAmountEl &&
            discountAmount > 0 &&
            this.showSavings
        ) {
            savingsAmountEl.textContent = this.formatMoney(discountAmount);
            (savingsEl as HTMLElement).style.display = "flex";
        }
    }

    /**
     * Updates the bundle title and hides the skeleton.
     */
    private updateTitle(bundle: Bundle): void {
        const titleEl = this.container.querySelector("[data-bundle-title]");
        const titleSkeleton = this.container.querySelector(
            "[data-bundle-title-skeleton]",
        );

        if (titleEl && bundle.name) {
            titleEl.textContent = bundle.name;
            titleEl.classList.remove("radius-bundle__title--hidden");
            titleEl.classList.add("radius-bundle__title--visible");
        }

        if (titleSkeleton) {
            titleSkeleton.classList.add(
                "radius-bundle__title-skeleton--hidden",
            );
        }
    }

    /**
     * Updates the savings badge from full bundle data.
     */
    private updateBadge(bundle: Bundle): void {
        const badgeEl = this.container.querySelector("[data-bundle-badge]");

        if (!badgeEl) return;

        // Use pre-loaded config or bundle data
        const discountType =
            this.bundleConfig?.discountType || bundle.discountType;
        const discountValue =
            this.bundleConfig?.discountValue ?? bundle.discountValue ?? 0;

        let badgeText = "";

        if (discountValue > 0) {
            switch (discountType) {
                case "PERCENTAGE":
                    badgeText = `Save ${discountValue}%`;
                    break;
                case "FIXED_AMOUNT":
                    badgeText = `Save ${this.formatMoney(discountValue)}`;
                    break;
                case "CUSTOM_PRICE":
                    badgeText = "Special Price";
                    break;
            }
        }

        if (badgeText && this.showSavings) {
            badgeEl.innerHTML = badgeText;
            badgeEl.classList.remove("radius-bundle__badge--skeleton");
            badgeEl.classList.add("radius-bundle__badge--visible");
        } else {
            (badgeEl as HTMLElement).style.display = "none";
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
            prevBtn.addEventListener("click", () => this.slideProducts("prev"));
        }
        if (nextBtn) {
            nextBtn.addEventListener("click", () => this.slideProducts("next"));
        }
    }

    /**
     * Handles add to cart functionality.
     */
    private async handleAddToCart(): Promise<void> {
        if (!this.bundle) return;

        const button = this.container.querySelector(
            "[data-bundle-add-to-cart]",
        ) as HTMLButtonElement;
        const messageEl = this.container.querySelector("[data-bundle-message]");

        if (!button) return;

        button.classList.add("is-loading");
        button.disabled = true;

        try {
            const cartItems: CartAddItem[] = this.bundle.products
                .filter((p) => p.role === "INCLUDED" || p.role === "OPTIONAL")
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
                throw new Error("No valid products to add to cart");
            }

            const addResponse = await fetch("/cart/add.js", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: cartItems }),
            });

            if (!addResponse.ok) {
                const errorData = await addResponse.json().catch(() => ({}));
                throw new Error(
                    errorData.description ||
                        `Failed to add to cart: ${addResponse.status}`,
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

            const requiredProducts = this.bundle.products.filter(
                (p) => p.role === "INCLUDED" || p.isRequired,
            );

            // Use pre-loaded config for discount info
            const config = this.bundleConfig || this.bundle;

            const newDiscount: DiscountConfig = {
                bundleId: this.bundle.id,
                bundleName: this.bundle.name,
                discountType: config.discountType || "PERCENTAGE",
                discountValue: config.discountValue || 0,
                requiredLineCount: requiredProducts.length,
                minOrderValue: config.minOrderValue || 0,
                maxDiscountAmount: config.maxDiscountAmount || 0,
                discountApplication: config.discountApplication || "bundle",
                discountedProductIds: config.discountedProductIds || [],
                freeShipping: config.freeShipping || false,
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

            this.showMessage(messageEl, "Bundle added to cart!", "success");

            this.container.dispatchEvent(
                new CustomEvent("bundle:addedToCart", {
                    detail: {
                        bundle: this.bundle,
                        cartItems,
                        discountConfig: newDiscount,
                    },
                    bubbles: true,
                }),
            );

            document.dispatchEvent(new CustomEvent("cart:refresh"));

            this.updateCartCount();
        } catch (error) {
            console.error("[RadiusBundle] Add to cart error:", error);
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to add bundle to cart";
            this.showMessage(messageEl, errorMessage, "error");
        } finally {
            button.classList.remove("is-loading");
            button.disabled = false;
        }
    }

    /**
     * Slides products in slider layout.
     */
    private slideProducts(direction: "prev" | "next"): void {
        const track = this.container.querySelector(
            "[data-slider-track]",
        ) as HTMLElement;
        if (!track) return;

        const scrollAmount = 200;
        if (direction === "prev") {
            track.scrollBy({ left: -scrollAmount, behavior: "smooth" });
        } else {
            track.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
    }

    /**
     * Initializes slider dots.
     */
    private initSliderDots(count: number): void {
        const dotsContainer =
            this.container.querySelector("[data-slider-dots]");
        if (!dotsContainer || count <= 1) return;

        let html = "";
        for (let i = 0; i < count; i++) {
            html += `<button class="radius-bundle__slider-dot${i === 0 ? " active" : ""}" data-index="${i}"></button>`;
        }
        dotsContainer.innerHTML = html;
    }

    /**
     * Updates the cart count in header.
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
                    if (srSpan) srSpan.textContent = `${cart.item_count} items`;
                    (bubble as HTMLElement).style.display = "flex";
                }
            }
        } catch (e) {
            console.warn("[RadiusBundle] Could not update cart count:", e);
        }
    }

    /**
     * Gets the current layout type.
     */
    private getLayout(): string {
        return this.container.classList.contains("radius-bundle--grid")
            ? "grid"
            : this.container.classList.contains("radius-bundle--slider")
              ? "slider"
              : "list";
    }

    /**
     * Hides the loading skeleton.
     */
    private hideLoading(): void {
        const loading = this.container.querySelector("[data-bundle-loading]");
        if (loading) {
            loading.remove();
        }
    }

    /**
     * Shows an error message.
     */
    private showError(message: string): void {
        this.hideLoading();

        const titleSkeleton = this.container.querySelector(
            "[data-bundle-title-skeleton]",
        );
        if (titleSkeleton) {
            titleSkeleton.classList.add(
                "radius-bundle__title-skeleton--hidden",
            );
        }

        const badgeEl = this.container.querySelector("[data-bundle-badge]");
        if (badgeEl) {
            (badgeEl as HTMLElement).style.display = "none";
        }

        const productsContainer = this.container.querySelector(
            "[data-bundle-products]",
        );
        if (productsContainer) {
            productsContainer.innerHTML = `<div class="radius-bundle__error">${message}</div>`;
        }
    }

    /**
     * Shows a temporary message.
     */
    private showMessage(
        element: Element | null,
        message: string,
        type: "success" | "error",
    ): void {
        if (!element) return;

        element.textContent = message;
        element.className = `radius-bundle__message radius-bundle__message--${type}`;

        setTimeout(() => {
            element.className = "radius-bundle__message";
            element.textContent = "";
        }, 4000);
    }

    /**
     * Formats money value.
     */
    private formatMoney(cents: number): string {
        if (typeof window.Shopify?.formatMoney === "function") {
            return window.Shopify.formatMoney(cents * 100);
        }
        return `$${cents.toFixed(2)}`;
    }

    /**
     * Extracts numeric ID from Shopify GID.
     */
    private extractNumericId(gid: string): string {
        if (!gid) return "";
        if (/^\d+$/.test(gid)) return gid;
        const match = gid.match(/\/(\d+)$/);
        return match ? match[1] : gid;
    }

    /**
     * Escapes HTML to prevent XSS.
     */
    private escapeHtml(text: string): string {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }
}

/**
 * Auto-initialize all bundle widgets when DOM is ready.
 */
function initRadiusBundles(): void {
    const bundles = document.querySelectorAll<HTMLElement>(
        ".radius-bundle[data-bundle-id]",
    );

    bundles.forEach((container) => {
        try {
            new RadiusBundleWidget(container);
        } catch (error) {
            console.error("[RadiusBundle] Failed to initialize widget:", error);
        }
    });
}

// Initialize on DOM ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initRadiusBundles);
} else {
    initRadiusBundles();
}

// Export for external use
window.RadiusBundleWidget = RadiusBundleWidget;
