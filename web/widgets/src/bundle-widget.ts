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
    discountType?: "PERCENTAGE" | "FIXED";
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
        this.showSavings = container.dataset.showSavings === "true";
        // this.showImages = container.dataset.showImages === "true";
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
                console.error(`Bundle fetch failed: ${response.status} ${response.statusText}`);
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
        const layout = bundle.settings?.layout || this.layout;
        const showSavings = bundle.settings?.showSavings ?? this.showSavings;
        const showImages = bundle.settings?.showProductImages ?? this.showImages;

        // Calculate pricing
        const originalTotal = bundle.products.reduce((sum, product) => sum + product.price, 0);
        const discountAmount = bundle.discountType === "PERCENTAGE"
            ? (originalTotal * bundle.discountValue!) / 100
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
            .map((product, index, array) => `
                        <div class="bundle-product-item">
                            ${showImages && product.featuredImage
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
                    `).join('')
        }
            </div>

            <div class="bundle-pricing">
                <div class="bundle-pricing-row">
                    <span class="bundle-pricing-label">Total Price:</span>
                    <div class="bundle-pricing-values">
                        <span class="bundle-current-price">$${bundleTotal.toFixed(2)}</span>
                        <span class="bundle-original-price">$${originalTotal.toFixed(2)}</span>
                    </div>
                </div>
                
                ${showSavings && bundle.discountValue ? `
                    <div class="bundle-savings-row">
                        <span class="bundle-savings-label">You save:</span>
                        <span class="bundle-savings-amount">
                            $${discountAmount.toFixed(2)} 
                            (${bundle.discountValue}${bundle.discountType === "PERCENTAGE" ? "%" : ""})
                        </span>
                    </div>
                ` : ''}
            </div>

            <button class="bundle-add-to-cart bundle-add-to-cart--primary" data-bundle-id="${bundle.id}">
                Add Bundle to Cart
            </button>
        </div>
    `;

        // Add event listener for add to cart button
        const addToCartBtn = content.querySelector(".bundle-add-to-cart") as HTMLButtonElement;
        if (addToCartBtn) {
            addToCartBtn.addEventListener("click", () => this.handleAddToCart(bundle));
        }
    }

    private renderProduct(product: BundleProduct, showImages: boolean): string {
        const isOptional = product.role === "OPTIONAL";
        const hasComparePrice = product.compareAtPrice > 0 && product.compareAtPrice > product.price;

        return `
            <div class="bundle-product ${isOptional ? "bundle-product--optional" : ""}" data-product-id="${product.id}">
                ${showImages && product.featuredImage
            ? `<div class="bundle-product__image">
                         <img src="${product.featuredImage}" alt="${this.escapeHtml(product.title)}" loading="lazy" />
                       </div>`
            : ""
        }
                <div class="bundle-product__info">
                    <h4 class="bundle-product__title">${this.escapeHtml(product.title)}</h4>
                    <div class="bundle-product__pricing">
                        <span class="bundle-product__price">$${product.price.toFixed(2)}</span>
                        ${hasComparePrice
            ? `<span class="bundle-product__compare-price">$${product.compareAtPrice.toFixed(2)}</span>`
            : ""
        }
                    </div>
                    ${isOptional
            ? `<span class="bundle-product__badge">Optional</span>`
            : ""
        }
                </div>
            </div>
        `;
    }

    private handleAddToCart(bundle: Bundle): void {
        // Get all products to add to cart
        const cartItems = bundle.products
            .filter(product => product.role === "INCLUDED" || product.role === "OPTIONAL")
            .map(product => ({
                id: product.variantId,
                quantity: product.quantity,
                properties: {
                    '_bundle_id': bundle.id,
                    '_bundle_name': bundle.name
                }
            }));

        // Dispatch custom event for cart integration
        this.container.dispatchEvent(new CustomEvent("bundle:addToCart", {
            detail: {
                bundle,
                cartItems,
                totalItems: cartItems.length
            },
            bubbles: true
        }));

        // Log for debugging (remove in production if not needed)
        console.log("Adding bundle to cart:", {
            bundleId: bundle.id,
            bundleName: bundle.name,
            items: cartItems
        });
    }

    private escapeHtml(text: string): string {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }
}

// Auto-initialize all widgets when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    const containers = document.querySelectorAll<HTMLElement>(".bundle-widget-container");

    containers.forEach((container) => {
        try {
            new ProductBundleWidget(container);
        } catch (error) {
            console.error("Failed to initialize bundle widget:", error);
        }
    });
});