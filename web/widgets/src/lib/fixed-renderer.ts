import type { Bundle, BundleProduct, BundleStructure } from "./types";
import { calculateBxgyRewardPrice } from "./bogo-renderer";
import { escapeHtml, formatMoney } from "./utils";

export interface FixedContext {
    container: HTMLElement;
    bundleStructure: BundleStructure | null;
    bundle: Bundle | null;
    showImages: boolean;
    showPrices: boolean;
    showComparePrices: boolean;
    showQuantity: boolean;
    showSavings: boolean;
    showFreeShipping: boolean;
    lazyLoadImages: boolean;
    enableHyperLink: boolean;
    dividerStyle: string;
    moreProductSettings: boolean;
    moreProductCount: number;
    moreProductsText: string;
    showLessText: string;
    quantityLabel: string;
    isBxgy: boolean;
}

function getInitialVisibleCount(ctx: FixedContext): number {
    return ctx.moreProductSettings ? ctx.moreProductCount : Infinity;
}

export function renderProductCard(
    product: BundleProduct,
    layout: string,
    index: number,
    ctx: FixedContext,
): string {
    const imgLoading = ctx.lazyLoadImages ? ' loading="lazy"' : "";
    const imageHtml =
        ctx.showImages && product.featuredImage
            ? `<img src="${escapeHtml(product.featuredImage)}" alt="${escapeHtml(product.title)}"${imgLoading} />`
            : ctx.showImages
              ? `<div class="radius-bundle__product-placeholder">📦</div>`
              : "";

    const structure = ctx.bundleStructure;
    let discountedPrice = product.price;
    let hasDiscount = false;

    if (structure && ctx.bundle?.products) {
        const products = ctx.bundle.products;

        const applyToSpecific = structure.discountApplication === "products";
        const shouldDiscount =
            !applyToSpecific ||
            (structure.discountedProductIds?.length > 0 &&
                structure.discountedProductIds.includes(product.id));

        const totalBundlePrice = products.reduce(
            (sum, p) => sum + p.price * (p.quantity || 1),
            0,
        );

        const productTotal = product.price * (product.quantity || 1);
        const proportion = totalBundlePrice > 0 ? productTotal / totalBundlePrice : 0;
        const discountValue = structure.discountValue || 0;

        if (!shouldDiscount) {
            // No discount for this product
        } else
            switch (structure.discountType) {
                case "PERCENTAGE":
                    if (discountValue > 0 && discountValue <= 100) {
                        discountedPrice = product.price * (1 - discountValue / 100);
                        hasDiscount = true;
                    }
                    break;

                case "FIXED_AMOUNT":
                    if (discountValue > 0 && totalBundlePrice > 0) {
                        const discountInCents = discountValue * 100;
                        const productLineDiscount = discountInCents * proportion;
                        const perUnitDiscount = productLineDiscount / (product.quantity || 1);
                        discountedPrice = Math.max(0, product.price - perUnitDiscount);
                        hasDiscount = discountedPrice < product.price;
                    }
                    break;

                case "CUSTOM_PRICE":
                    if (discountValue > 0 && totalBundlePrice > 0) {
                        const customPriceInCents = discountValue * 100;
                        const productLinePrice = customPriceInCents * proportion;
                        discountedPrice = productLinePrice / (product.quantity || 1);
                        hasDiscount = discountedPrice < product.price;
                    }
                    break;

                default:
                    discountedPrice = product.price;
                    hasDiscount = false;
            }
    }

    discountedPrice = Math.round(discountedPrice);

    const hasCompareAt = product.compareAtPrice && product.compareAtPrice > product.price;
    let priceHtml: string;

    if (hasDiscount && discountedPrice < product.price) {
        priceHtml = `
            <span class="radius-bundle__product-price-current">${formatMoney(discountedPrice)}</span>
            ${ctx.showComparePrices ? `<span class="radius-bundle__product-price-compare">${formatMoney(product.price)}</span>` : ""}
        `;
    } else if (hasCompareAt) {
        priceHtml = `
            <span class="radius-bundle__product-price-current">${formatMoney(product.price)}</span>
            ${ctx.showComparePrices ? `<span class="radius-bundle__product-price-compare">${formatMoney(product.compareAtPrice)}</span>` : ""}
        `;
    } else {
        priceHtml = `<span class="radius-bundle__product-price-current">${formatMoney(product.price)}</span>`;
    }

    const imageWrapper = ctx.showImages
        ? `<div class="radius-bundle__product-image">${imageHtml}</div>`
        : "";

    const productUrl = product.handle ? `/products/${product.handle}` : "#";
    const productTitleHtml = ctx.enableHyperLink
        ? `<h4 class="radius-bundle__product-title"><a href="${productUrl}">${escapeHtml(product.title)}</a></h4>`
        : `<h4 class="radius-bundle__product-title">${escapeHtml(product.title)}</h4>`;

    if (layout === "list") {
        const initialVisibleCount = getInitialVisibleCount(ctx);
        const isHidden = index >= initialVisibleCount;
        return `
            <div class="radius-bundle__product radius-bundle__product--list${isHidden ? " radius-bundle__product--hidden" : ""}"
                 data-product-id="${product.id}"
                 data-variant-id="${product.variantId}"
                 data-product-index="${index}"
                 ${isHidden ? 'style="display: none;"' : ""}>
                ${imageWrapper}
                <div class="radius-bundle__product-info">
                    ${productTitleHtml}
                    ${ctx.showQuantity ? `<div class="radius-bundle__product-quantity">${ctx.quantityLabel} ${product.quantity}</div>` : ""}
                </div>
                ${ctx.showPrices ? `<div class="radius-bundle__product-price">${priceHtml}</div>` : ""}
            </div>
        `;
    }

    if (layout === "grid") {
        const initialVisibleCount = getInitialVisibleCount(ctx);
        const isHidden = index >= initialVisibleCount;
        return `
            <div class="radius-bundle__product radius-bundle__product--grid${isHidden ? " radius-bundle__product--hidden" : ""}"
                 data-product-id="${product.id}"
                 data-variant-id="${product.variantId}"
                 data-product-index="${index}"
                 ${isHidden ? 'style="display: none;"' : ""}>
                ${imageWrapper}
                ${productTitleHtml}
                ${ctx.showPrices ? `<div class="radius-bundle__product-price">${priceHtml}</div>` : ""}
                ${ctx.showQuantity ? `<div class="radius-bundle__product-quantity">${ctx.quantityLabel} ${product.quantity}</div>` : ""}
            </div>
        `;
    }

    if (layout === "compact") {
        const initialVisibleCount = getInitialVisibleCount(ctx);
        const isHidden = index >= initialVisibleCount;
        return `
            <div class="radius-bundle__product radius-bundle__product--compact${isHidden ? " radius-bundle__product--hidden" : ""}"
                 data-product-id="${product.id}"
                 data-variant-id="${product.variantId}"
                 data-product-index="${index}"
                 ${isHidden ? 'style="display: none;"' : ""}>
                ${imageWrapper}
                <div class="radius-bundle__product-info radius-bundle__product-info--compact">
                    ${productTitleHtml}
                    ${ctx.showQuantity ? `<div class="radius-bundle__product-quantity">${ctx.quantityLabel} ${product.quantity}</div>` : ""}
                </div>
                ${ctx.showPrices ? `<div class="radius-bundle__product-price">${priceHtml}</div>` : ""}
            </div>
        `;
    }

    // Slider layout (default)
    return `
        <div class="radius-bundle__product radius-bundle__product--slider"
             data-product-id="${product.id}"
             data-variant-id="${product.variantId}">
            ${imageWrapper}
            ${productTitleHtml}
            ${ctx.showPrices ? `<div class="radius-bundle__product-price">${priceHtml}</div>` : ""}
            ${ctx.showQuantity ? `<div class="radius-bundle__product-quantity">${ctx.quantityLabel} ${product.quantity}</div>` : ""}
        </div>
    `;
}

export function renderFixedProducts(
    bundle: Bundle,
    container: Element,
    layout: string,
    ctx: FixedContext,
): void {
    const sortedProducts = [...bundle.products].sort(
        (a, b) => a.displayOrder - b.displayOrder,
    );

    let html = "";
    const initialVisibleCount = getInitialVisibleCount(ctx);

    sortedProducts.forEach((product, index) => {
        const isLast = index === sortedProducts.length - 1;
        html += renderProductCard(product, layout, index, ctx);

        if (layout === "list" && !isLast) {
            const isDividerHidden = index >= initialVisibleCount - 1;
            const dividerHiddenAttr = isDividerHidden ? ' style="display: none;"' : "";
            const dividerHiddenClass = isDividerHidden ? " radius-bundle__divider--hidden" : "";

            if (ctx.dividerStyle === "plus") {
                html += `<div class="radius-bundle__divider radius-bundle__divider--plus${dividerHiddenClass}" data-divider-index="${index}"${dividerHiddenAttr}><div class="divider-position">+</div></div>`;
            } else if (ctx.dividerStyle === "line") {
                html += `<div class="radius-bundle__divider radius-bundle__divider--line${dividerHiddenClass}" data-divider-index="${index}"${dividerHiddenAttr}></div>`;
            }
        }
    });

    if (layout === "list" || layout === "grid" || layout === "compact") {
        html += getShowMoreButton(sortedProducts.length, ctx);
    }

    container.innerHTML = html;

    if (layout === "list" || layout === "grid" || layout === "compact") {
        initShowMoreToggle(ctx);
    }

    const addToCartBtn = ctx.container.querySelector("[data-bundle-add-to-cart]") as HTMLButtonElement | null;
    if (addToCartBtn) {
        addToCartBtn.disabled = false;
    }
}

export function updatePricing(bundle: Bundle, ctx: FixedContext): void {
    const sellingTotal = bundle.products.reduce(
        (sum, product) => sum + product.price * product.quantity,
        0,
    );
    let discountAmount: number;
    let bundleTotal: number;

    const structure = ctx.bundleStructure || bundle;

    if (ctx.isBxgy) {
        const triggerTotal = bundle.products
            .filter(p => p.role === "TRIGGER")
            .reduce((sum, p) => sum + p.price * p.quantity, 0);
        const discountedRewardTotal = bundle.products
            .filter(p => p.role === "REWARD")
            .reduce((sum, p) => sum + calculateBxgyRewardPrice(p.price, structure) * p.quantity, 0);
        bundleTotal = triggerTotal + discountedRewardTotal;
        discountAmount = Math.max(0, sellingTotal - bundleTotal);
        updatePricingDisplay(sellingTotal, bundleTotal, discountAmount, structure, ctx);
        return;
    }

    const applyToSpecific = structure.discountApplication === "products";
    const discountedIds = new Set(structure.discountedProductIds || []);

    const discountableTotal = applyToSpecific
        ? bundle.products
              .filter((p) => discountedIds.has(p.id))
              .reduce((sum, p) => sum + p.price * (p.quantity || 1), 0)
        : sellingTotal;

    const nonDiscountableTotal = sellingTotal - discountableTotal;

    switch (structure.discountType) {
        case "PERCENTAGE":
            bundleTotal = nonDiscountableTotal + discountableTotal * (1 - structure.discountValue / 100);
            break;
        case "FIXED_AMOUNT":
            bundleTotal = nonDiscountableTotal + Math.max(0, discountableTotal - structure.discountValue * 100);
            break;
        case "CUSTOM_PRICE":
            bundleTotal = nonDiscountableTotal + structure.discountValue * 100;
            break;
        default:
            bundleTotal = sellingTotal;
    }

    bundleTotal = Math.max(0, bundleTotal);
    discountAmount = Math.max(0, sellingTotal - bundleTotal);

    updatePricingDisplay(sellingTotal, bundleTotal, discountAmount, structure, ctx);
}

function updatePricingDisplay(
    sellingTotal: number,
    bundleTotal: number,
    discountAmount: number,
    structure: BundleStructure,
    ctx: FixedContext,
): void {
    const regularPriceEl = ctx.container.querySelector("[data-regular-price]");
    if (regularPriceEl) {
        regularPriceEl.textContent = formatMoney(sellingTotal);
    }

    const bundlePriceEl = ctx.container.querySelector("[data-bundle-price]");
    if (bundlePriceEl) {
        bundlePriceEl.textContent = formatMoney(bundleTotal);
    }

    const savingsEl = ctx.container.querySelector("[data-savings]");
    const savingsAmountEl = ctx.container.querySelector("[data-savings-amount]");
    if (savingsEl && savingsAmountEl) {
        if (discountAmount > 0 && ctx.showSavings) {
            savingsAmountEl.textContent = formatMoney(discountAmount);
            (savingsEl as HTMLElement).style.display = "flex";
        } else {
            (savingsEl as HTMLElement).style.display = "none";
        }
    }

    const freeShippingEl = ctx.container.querySelector("[data-free-shipping]");
    if (freeShippingEl) {
        if (structure.freeShipping && ctx.showFreeShipping) {
            (freeShippingEl as HTMLElement).style.display = "flex";
        } else {
            (freeShippingEl as HTMLElement).style.display = "none";
        }
    }
}

export function validateStock(ctx: FixedContext): void {
    if (!ctx.bundle) return;

    const unavailableProducts = ctx.bundle.products.filter((p) => !p.available);
    if (unavailableProducts.length === 0) return;

    const button = ctx.container.querySelector("[data-bundle-add-to-cart]") as HTMLButtonElement;
    if (button) {
        button.disabled = true;
        button.classList.add("is-out-of-stock");

        const outOfStockLabel = ctx.bundleStructure?.labels?.outOfStockText ?? "Out of Stock";
        const buttonText = button.querySelector("[data-button-text]") as HTMLElement;
        if (buttonText) {
            buttonText.textContent = outOfStockLabel;
        } else {
            button.textContent = outOfStockLabel;
        }
    }

    console.log(
        "[RadiusBundle] Bundle unavailable - out of stock products:",
        unavailableProducts.map((p) => p.title),
    );
}

function getShowMoreButton(totalProducts: number, ctx: FixedContext): string {
    const initialVisibleCount = getInitialVisibleCount(ctx);
    if (totalProducts <= initialVisibleCount) return "";

    const extraCount = totalProducts - initialVisibleCount;
    const buttonText = ctx.moreProductsText.replace("{count}", String(extraCount));

    return `
        <button
            class="radius-bundle__show-more-btn"
            type="button"
            data-initial-count="${initialVisibleCount}"
            data-total-count="${totalProducts}"
            data-expanded="false"
        >${buttonText}</button>
    `;
}

function initShowMoreToggle(ctx: FixedContext): void {
    const btn = ctx.container.querySelector(
        ".radius-bundle__show-more-btn",
    ) as HTMLButtonElement | null;

    if (!btn) return;

    const initialCount = parseInt(btn.dataset.initialCount || "4", 10);
    const totalCount = parseInt(btn.dataset.totalCount || "0", 10);
    const extraCount = totalCount - initialCount;
    const moreText = ctx.moreProductsText.replace("{count}", String(extraCount));
    const lessText = ctx.showLessText;
    const products = ctx.container.querySelectorAll<HTMLElement>(
        ".radius-bundle__product[data-product-index]",
    );

    function handleToggleClick(): void {
        const isExpanded = btn!.dataset.expanded === "true";

        products.forEach(function toggleVisibility(product: HTMLElement) {
            const idx = parseInt(product.dataset.productIndex || "0", 10);
            if (idx >= initialCount) {
                product.style.display = isExpanded ? "none" : "";
            }
        });

        const dividers = btn!
            .closest("[data-bundle-products]")
            ?.querySelectorAll<HTMLElement>(
                ".radius-bundle__divider[data-divider-index]",
            );

        dividers?.forEach(function toggleDividerVisibility(divider: HTMLElement) {
            const dividerIdx = parseInt(divider.dataset.dividerIndex || "0", 10);
            if (dividerIdx >= initialCount - 1) {
                divider.style.display = isExpanded ? "none" : "";
            }
        });

        btn!.dataset.expanded = isExpanded ? "false" : "true";
        btn!.textContent = isExpanded ? moreText : lessText;
    }

    btn.addEventListener("click", handleToggleClick);
}
