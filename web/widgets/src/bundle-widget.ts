import "./bundle-widget.scss";

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

interface Bundle {
    id: string;
    name: string;
    description?: string;
    discountType?: "PERCENTAGE" | "FIXED_AMOUNT";
    discountValue?: number;
    products: BundleProduct[];
    settings?: {
        layout?: "grid" | "list";
        showPrices?: boolean;
        showSavings?: boolean;
        showProductImages?: boolean;
    };
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

export class ProductBundleWidget {
    private container: HTMLElement;
    private productId: string;
    private shop: string;
    private layout: "grid" | "list";
    private showSavings: boolean;
    private showImages: boolean;

    constructor(container: HTMLElement) {
        this.container = container;
        this.productId = container.dataset.productId!;
        this.shop = container.dataset.shop!;
        this.layout = (container.dataset.layout as "grid" | "list") || "grid";
        this.showSavings = true;
        this.showImages = true;

        this.init();
    }

    private async init(): Promise<void> {
        if (!this.productId || !this.shop) {
            this.showError("Missing required data");
            return;
        }

        await this.fetchAndRender();
    }

    private showLoading(): void {
        const loading = this.container.querySelector(".bundle-loading");
        if (loading) {
            loading.classList.remove("bundle-widget-hidden");
        }
    }

    private hideLoading(): void {
        const loading = this.container.querySelector(".bundle-loading");
        if (loading) {
            loading.remove();
        }
    }

    private showError(message: string): void {
        this.hideLoading();
        const content = this.container.querySelector(".bundle-widget-content");
        if (content) {
            content.innerHTML = `<div class="bundle-error">${message}</div>`;
        }
    }

    private async fetchBundle(): Promise<Bundle | null> {
        try {
            const url = `/apps/bundles/products?productId=${encodeURIComponent(this.productId)}&shop=${encodeURIComponent(this.shop)}`;
            const response = await fetch(url);

            if (!response.ok) {
                console.error(
                    `Bundle fetch failed: ${response.status} ${response.statusText}`,
                );
                return null;
            }

            const data: BundleResponse = await response.json();

            if (!data.success || !data.bundles?.length) {
                return null;
            }

            return data.bundles[0];
        } catch (error) {
            console.error("Bundle fetch error:", error);
            return null;
        }
    }

    private async fetchAndRender(): Promise<void> {
        this.showLoading();

        const bundle = await this.fetchBundle();

        if (!bundle) {
            this.showError("No bundles available for this product");
            return;
        }

        this.render(bundle);
        this.hideLoading();
    }

    private render(bundle: Bundle): void {
        const showSavings = bundle.settings?.showSavings ?? this.showSavings;
        const showImages =
            bundle.settings?.showProductImages ?? this.showImages;

        // Calculate pricing
        const originalTotal = bundle.products.reduce(
            (sum, product) => sum + product.price * product.quantity,
            0,
        );
        const discountAmount =
            bundle.discountType === "PERCENTAGE"
                ? (originalTotal * (bundle.discountValue || 0)) / 100
                : bundle.discountValue || 0;
        const bundleTotal = originalTotal - discountAmount;

        const content = this.container.querySelector(".bundle-widget-content");
        if (!content) return;

        content.innerHTML = `
        <div class="bundle-widget bundle-widget--fbt">
            <div class="bundle-header">
                <h3 class="bundle-title">${this.escapeHtml(bundle.name)}</h3>
            </div>
            
            <div class="bundle-products-horizontal">
                ${bundle.products
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map(
                        (product) => `
                        <div class="bundle-product-item">
                            ${
                                showImages && product.featuredImage
                                    ? `<div class="bundle-product-image">
                                     <img src="${product.featuredImage}" alt="${this.escapeHtml(product.title)}" loading="lazy" />
                                   </div>`
                                    : `<div class="bundle-product-placeholder">
                                     <span>📦</span>
                                   </div>`
                            }
                            <div class="bundle-product-details">
                                <h4 class="bundle-product-name">${this.escapeHtml(product.title)}</h4>
                                <p class="bundle-product-price">Qty: ${product.quantity} × $${product.price.toFixed(2)}</p>
                            </div>
                        </div>
                    `,
                    )
                    .join("")}
            </div>

            <div class="bundle-pricing">
                <div class="bundle-pricing-row">
                    <span class="bundle-pricing-label">Total Price:</span>
                    <div class="bundle-pricing-values">
                        <span class="bundle-current-price">$${bundleTotal.toFixed(2)}</span>
                        <span class="bundle-original-price">$${originalTotal.toFixed(2)}</span>
                    </div>
                </div>
                
                ${
                    showSavings && bundle.discountValue
                        ? `
                    <div class="bundle-savings-row">
                        <span class="bundle-savings-label">You save:</span>
                        <span class="bundle-savings-amount">
                            $${discountAmount.toFixed(2)} 
                            (${bundle.discountValue}${bundle.discountType === "PERCENTAGE" ? "%" : ""})
                        </span>
                    </div>
                `
                        : ""
                }
            </div>

            <button class="bundle-add-to-cart bundle-add-to-cart--primary" data-bundle-id="${bundle.id}">
                Add Bundle to Cart
            </button>
            
            <div class="bundle-message bundle-message--hidden"></div>
        </div>
    `;

        // Add event listener for add to cart button
        const addToCartBtn = content.querySelector(
            ".bundle-add-to-cart",
        ) as HTMLButtonElement;
        if (addToCartBtn) {
            addToCartBtn.addEventListener("click", () =>
                this.handleAddToCart(bundle),
            );
        }
    }

    /**
     * Adds bundle products to cart and sets discount attribute.
     */
    private async handleAddToCart(bundle: Bundle): Promise<void> {
        const button = this.container.querySelector(
            ".bundle-add-to-cart",
        ) as HTMLButtonElement;
        const messageEl = this.container.querySelector(
            ".bundle-message",
        ) as HTMLElement;

        if (!button) return;

        // Show loading state
        const originalText = button.textContent || "Add Bundle to Cart";
        button.textContent = "Adding...";
        button.disabled = true;

        try {
            // Step 1: Build cart items from bundle products
            const cartItems: CartAddItem[] = bundle.products
                .filter(
                    (product) =>
                        product.role === "INCLUDED" ||
                        product.role === "OPTIONAL",
                )
                .filter((product) => product.variantId) // Must have variant ID
                .map((product) => ({
                    id: this.extractNumericId(product.variantId),
                    quantity: product.quantity,
                    properties: {
                        _bundle_id: bundle.id,
                        _bundle_name: bundle.name,
                    },
                }));

            if (cartItems.length === 0) {
                throw new Error("No valid products to add to cart");
            }

            // Step 2: Add products to cart
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

            // Step 3: Set bundle discount attribute for Shopify Function
            const discountConfig = {
                bundleId: bundle.id,
                discountType: bundle.discountType || "PERCENTAGE",
                discountValue: bundle.discountValue || 0,
            };

            const updateResponse = await fetch("/cart/update.js", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    attributes: {
                        _bundleDiscount: JSON.stringify(discountConfig),
                    },
                }),
            });

            if (!updateResponse.ok) {
                console.warn("Failed to set bundle discount attribute");
            }

            // Step 4: Show success message
            this.showMessage(messageEl, "Bundle added to cart!", "success");

            // Step 5: Dispatch event for theme integration
            this.container.dispatchEvent(
                new CustomEvent("bundle:addedToCart", {
                    detail: {
                        bundle,
                        cartItems,
                        discountConfig,
                    },
                    bubbles: true,
                }),
            );

            // Step 6: Optional - redirect to cart or open cart drawer
            // Uncomment one of these if needed:
            // window.location.href = "/cart";
            // document.dispatchEvent(new CustomEvent("cart:open"));
        } catch (error) {
            console.error("Add to cart error:", error);
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Failed to add bundle to cart";
            this.showMessage(messageEl, errorMessage, "error");
        } finally {
            // Reset button state
            button.textContent = originalText;
            button.disabled = false;
        }
    }

    /**
     * Extracts numeric ID from Shopify GID.
     * Converts "gid://shopify/ProductVariant/12345" to "12345"
     */
    private extractNumericId(gid: string): string {
        if (!gid) return "";

        // If already numeric, return as-is
        if (/^\d+$/.test(gid)) return gid;

        // Extract from GID format
        const match = gid.match(/\/(\d+)$/);
        return match ? match[1] : gid;
    }

    /**
     * Shows a temporary message to the user.
     */
    private showMessage(
        element: HTMLElement | null,
        message: string,
        type: "success" | "error",
    ): void {
        if (!element) return;

        element.textContent = message;
        element.className = `bundle-message bundle-message--${type}`;

        // Auto-hide after 3 seconds
        setTimeout(() => {
            element.className = "bundle-message bundle-message--hidden";
        }, 3000);
    }

    private escapeHtml(text: string): string {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }
}

// Auto-initialize all widgets when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    const containers = document.querySelectorAll<HTMLElement>(
        ".bundle-widget-container",
    );

    containers.forEach((container) => {
        try {
            new ProductBundleWidget(container);
        } catch (error) {
            console.error("Failed to initialize bundle widget:", error);
        }
    });
});
