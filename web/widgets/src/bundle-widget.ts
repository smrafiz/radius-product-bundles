import "./bundle-widget.scss";

interface BundleProduct {
    productId: string;
    variantId: string;
    quantity: number;
    title: string;
    price: number;
    compareAtPrice?: number;
    image?: string;
    role?: "INCLUDED" | "OPTIONAL";
}

interface Bundle {
    name: string;
    products: BundleProduct[];
    discountType?: "PERCENTAGE" | "FIXED";
    discountValue?: number;
    settings?: Record<string, any>;
}

export class ProductBundleWidget {
    container: HTMLElement;
    productId: string;

    constructor(container: HTMLElement) {
        this.container = container;
        this.productId = container.dataset.productId!;
        this.init();
    }

    async init() {
        await this.fetchAndRender();
    }

    private showLoading() {
        const loading = this.container.querySelector(".bundle-loading");
        if (loading) loading.classList.remove("bundle-widget-hidden");
    }

    private hideLoading() {
        const loading = this.container.querySelector(".bundle-loading");
        if (loading) loading.remove(); // Remove loader element completely
    }

    private showError(msg: string) {
        this.container.innerHTML = `<div class="bundle-error">${msg}</div>`;
    }

    private async fetchBundle(): Promise<Bundle | null> {
        try {
            const appUrl = process.env.NEXT_PUBLIC_SHOPIFY_APP_URL || window.location.origin;
            const url = `/api/storefront/product?productId=${encodeURIComponent(this.productId)}`;
            const res = await fetch(url);
            console.log(res);
            if (!res.ok) return null;
            const data = await res.json();
            return data?.products?.length ? data : null;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    private async fetchAndRender() {
        this.showLoading();
        const bundle = await this.fetchBundle();
        if (!bundle) {
            this.showError("No bundles available for this product");
            return;
        }
        this.render(bundle);
        this.hideLoading(); // Hide loader after rendering
    }

    private render(bundle: Bundle) {
        const layout = this.container.dataset.layout || "grid";
        const showSavings = this.container.dataset.showSavings === "true";
        const showImages = this.container.dataset.showImages === "true";

        this.container.querySelector(".bundle-widget-content")!.innerHTML = `
            <div class="bundle-widget">
                <div class="bundle-header">
                    <h3 class="bundle-title">${bundle.name}</h3>
                    ${showSavings && bundle.discountValue ? `<span class="bundle-savings">Save ${bundle.discountValue}${bundle.discountType === "PERCENTAGE" ? "%" : ""}</span>` : ""}
                </div>
                <div class="bundle-products bundle-products--${layout}">
                    ${bundle.products
                        .map(
                            (p) => `
                        <div class="bundle-product ${p.role === "OPTIONAL" ? "optional" : ""}">
                            ${showImages && p.image ? `<img src="${p.image}" alt="${p.title}" />` : ""}
                            <div class="bundle-product-info">
                                <p>${p.title}</p>
                                <p>$${p.price.toFixed(2)}</p>
                            </div>
                        </div>
                    `,
                        )
                        .join("")}
                </div>
                <button class="bundle-add-to-cart">Add Bundle to Cart</button>
            </div>
        `;
    }
}

// Auto-init all widgets on page
document.addEventListener("DOMContentLoaded", () => {
    const containers = document.querySelectorAll<HTMLElement>(
        ".bundle-widget-container",
    );
    containers.forEach((container) => new ProductBundleWidget(container));
});
