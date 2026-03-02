import type { BaseRenderContext, Bundle, BundleProduct, BundleStructure } from "./types";
import { escapeHtml, formatLabel, formatMoney, getLocalePath, trimMoney } from "./utils";

export interface BogoContext extends BaseRenderContext {
    showSavings: boolean;
    showSavingsBadge: boolean;
    imagePosition: string;
    badgeStyle: string;
    imageSize: string;
    quantityLabel: string;
}

function splitByRole(bundle: Bundle) {
    const triggers = bundle.products.filter(p => p.role === "TRIGGER").sort((a, b) => a.displayOrder - b.displayOrder);
    const rewards = bundle.products.filter(p => p.role === "REWARD").sort((a, b) => a.displayOrder - b.displayOrder);
    return { triggers, rewards };
}

export function calculateBxgyRewardPrice(originalPrice: number, structure: BundleStructure): number {
    const dv = structure.discountValue || 0;
    switch (structure.discountType) {
        case "PERCENTAGE":
            return Math.round(originalPrice * (1 - dv / 100));
        case "FIXED_AMOUNT":
            return Math.round(Math.max(0, originalPrice - dv * 100));
        case "CUSTOM_PRICE":
            return Math.round(dv * 100);
        default:
            return originalPrice;
    }
}

function enableCartButton(widgetContainer: HTMLElement): void {
    const btn = widgetContainer.querySelector("[data-bundle-add-to-cart]") as HTMLButtonElement | null;
    if (btn) btn.disabled = false;
}

function hideStandardPricing(widgetContainer: HTMLElement): void {
    const el = widgetContainer.querySelector(".radius-bundle__pricing");
    if (el) (el as HTMLElement).style.display = "none";
}

function hideStandardButton(widgetContainer: HTMLElement): void {
    const el = widgetContainer.querySelector(".radius-bundle__add-to-cart");
    if (el) (el as HTMLElement).style.display = "none";
}

function wireCustomCartButton(productsContainer: Element, widgetContainer: HTMLElement, selector: string): void {
    const btn = productsContainer.querySelector(selector);
    if (btn) {
        btn.addEventListener("click", () => {
            const realBtn = widgetContainer.querySelector("[data-bundle-add-to-cart]") as HTMLButtonElement | null;
            if (realBtn) { realBtn.disabled = false; realBtn.click(); }
        });
    }
}

export function renderBxgyProducts(bundle: Bundle, container: Element, ctx: BogoContext): void {
    const { triggers, rewards } = splitByRole(bundle);
    const structure = ctx.bundleStructure || bundle;
    const buyQty = structure.buyQuantity || 1;
    const getQty = structure.getQuantity || 1;
    const imgLoading = ctx.lazyLoadImages ? ' loading="lazy"' : "";

    const renderCard = (product: BundleProduct, isReward: boolean): string => {
        const imageHtml = ctx.showImages && product.featuredImage
            ? `<img src="${escapeHtml(product.featuredImage)}" alt="${escapeHtml(product.title)}"${imgLoading} />`
            : ctx.showImages
              ? `<div class="radius-bundle__product-placeholder">📦</div>`
              : "";
        const imageWrapper = ctx.showImages ? `<div class="radius-bundle__product-image">${imageHtml}</div>` : "";
        const productUrl = product.handle ? getLocalePath(`/products/${product.handle}`) : "#";
        const titleHtml = ctx.enableHyperLink
            ? `<h4 class="radius-bundle__product-title"><a href="${productUrl}">${escapeHtml(product.title)}</a></h4>`
            : `<h4 class="radius-bundle__product-title">${escapeHtml(product.title)}</h4>`;

        let priceHtml: string;
        if (isReward && structure.discountType !== "NO_DISCOUNT" && structure.discountValue > 0) {
            const discountedPrice = calculateBxgyRewardPrice(product.price, structure);
            priceHtml = `
                <span class="radius-bundle__product-price-current">${formatMoney(discountedPrice)}</span>
                ${ctx.showComparePrices ? `<span class="radius-bundle__product-price-compare">${formatMoney(product.price)}</span>` : ""}
            `;
        } else {
            priceHtml = `<span class="radius-bundle__product-price-current">${formatMoney(product.price)}</span>`;
        }

        return `
            <div class="radius-bundle__product radius-bundle__product--list"
                 data-product-id="${product.id}"
                 data-variant-id="${product.variantId}">
                ${imageWrapper}
                <div class="radius-bundle__product-info">
                    ${titleHtml}
                    ${ctx.showQuantity ? `<div class="radius-bundle__product-quantity">${ctx.quantityLabel} ${product.quantity}</div>` : ""}
                </div>
                ${ctx.showPrices ? `<div class="radius-bundle__product-price">${priceHtml}</div>` : ""}
            </div>
        `;
    };

    let html = `<div class="radius-bundle__bxgy-section radius-bundle__bxgy-trigger">`;
    html += `<div class="radius-bundle__bxgy-label">Buy ${buyQty}</div>`;
    triggers.forEach(p => { html += renderCard(p, false); });
    html += `</div>`;

    html += `<div class="radius-bundle__bxgy-arrow"><span>+</span></div>`;

    html += `<div class="radius-bundle__bxgy-section radius-bundle__bxgy-reward">`;
    html += `<div class="radius-bundle__bxgy-label">Get ${getQty}</div>`;
    rewards.forEach(p => { html += renderCard(p, true); });
    html += `</div>`;

    container.innerHTML = html;
    enableCartButton(ctx.container);
}

export function renderClassicCardProducts(bundle: Bundle, container: Element, ctx: BogoContext): void {
    const { triggers, rewards } = splitByRole(bundle);
    const structure = ctx.bundleStructure || bundle;
    const imgLoading = ctx.lazyLoadImages ? ' loading="lazy"' : "";

    const labels = structure.labels;
    const triggerBadge = labels?.bogoTriggerBadgeText || "You Buy";
    const rewardBadge = labels?.bogoRewardBadgeText || "You Get FREE";
    const youPayLabel = labels?.bogoYouPayLabel || "You Pay Only";
    const youSaveLabel = labels?.bogoYouSaveLabel || "You Save";

    const isHorizontal = ctx.imagePosition === "left";
    const isOutlineBadge = ctx.badgeStyle === "outline";
    const aspectClass = `rb-classic__image--${ctx.imageSize}`;

    const renderCard = (product: BundleProduct, isReward: boolean): string => {
        const imageHtml = ctx.showImages && product.featuredImage
            ? `<img src="${escapeHtml(product.featuredImage)}" alt="${escapeHtml(product.title)}"${imgLoading} />`
            : ctx.showImages
              ? `<div class="rb-classic__placeholder">📦</div>`
              : "";

        const badgeText = isReward ? rewardBadge : triggerBadge;
        const sectionClass = isReward ? "reward" : "trigger";
        const outlineClass = isOutlineBadge ? " rb-classic__badge--outline" : "";

        let priceHtml = "";
        if (ctx.showPrices) {
            if (isReward && structure.discountType !== "NO_DISCOUNT" && structure.discountValue > 0) {
                const discountedPrice = calculateBxgyRewardPrice(product.price, structure);
                const isFree = discountedPrice === 0;
                priceHtml = `<div class="rb-classic__price">`;
                if (ctx.showComparePrices) {
                    priceHtml += `<span class="rb-classic__price-compare">${formatMoney(product.price)}</span>`;
                }
                priceHtml += `<span class="rb-classic__price-current rb-classic__price-current--${sectionClass}">${isFree ? "FREE" : formatMoney(discountedPrice)}</span>`;
                priceHtml += `</div>`;
            } else {
                priceHtml = `<div class="rb-classic__price"><span class="rb-classic__price-current">${formatMoney(product.price)}</span></div>`;
            }
        }

        const cardClass = `rb-classic__card rb-classic__card--${sectionClass}${isHorizontal ? " rb-classic__card--horizontal" : ""}`;
        const imageBlock = ctx.showImages
            ? `<div class="rb-classic__image ${aspectClass}">${imageHtml}</div>`
            : "";

        const textBlock = `
            <div class="rb-classic__text">
                <h4 class="rb-classic__title">${escapeHtml(product.title)}</h4>
                ${priceHtml}
            </div>
        `;

        return `
            <div class="${cardClass}">
                <span class="rb-classic__badge rb-classic__badge--${sectionClass}${outlineClass}">${escapeHtml(badgeText)}</span>
                ${imageBlock}
                ${textBlock}
            </div>
        `;
    };

    let html = `<div class="rb-classic__grid">`;
    triggers.forEach(p => { html += renderCard(p, false); });
    rewards.forEach(p => { html += renderCard(p, true); });
    html += `</div>`;

    const totalOriginal = [...triggers, ...rewards].reduce((sum, p) => sum + p.price, 0);
    const totalDiscounted = triggers.reduce((sum, p) => sum + p.price, 0) +
        rewards.reduce((sum, p) => sum + calculateBxgyRewardPrice(p.price, structure), 0);
    const savings = totalOriginal - totalDiscounted;

    if (savings > 0 && ctx.showSavings) {
        html += `
            <div class="rb-classic__pricing-bar">
                <div class="rb-classic__pricing-col">
                    <span class="rb-classic__pricing-label rb-classic__pricing-pay">${escapeHtml(youPayLabel)}</span>
                    <span class="rb-classic__pricing-value">${formatMoney(totalDiscounted)}</span>
                </div>
                <div class="rb-classic__pricing-col rb-classic__pricing-col--right">
                    <span class="rb-classic__pricing-label rb-classic__pricing-save">${escapeHtml(youSaveLabel)}</span>
                    <span class="rb-classic__pricing-value rb-classic__pricing-value--savings">${formatMoney(savings)}</span>
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
    hideStandardPricing(ctx.container);
    enableCartButton(ctx.container);
}

export function renderBogoSleekProducts(bundle: Bundle, container: Element, ctx: BogoContext): void {
    const { triggers, rewards } = splitByRole(bundle);
    const structure = ctx.bundleStructure || bundle;
    const imgLoading = ctx.lazyLoadImages ? ' loading="lazy"' : "";
    const labels = structure.labels;
    const youPayLabel = labels?.bogoYouPayLabel || "You pay";

    const renderCard = (product: BundleProduct, isReward: boolean): string => {
        const imageHtml = ctx.showImages && product.featuredImage
            ? `<img src="${escapeHtml(product.featuredImage)}" alt="${escapeHtml(product.title)}"${imgLoading} />`
            : ctx.showImages
              ? `<div class="rb-sleek__placeholder">📦</div>`
              : "";

        const imageBlock = ctx.showImages
            ? `<div class="rb-sleek__image">${imageHtml}</div>`
            : "";

        let priceHtml = "";
        let labelHtml = "";
        let badgeHtml = "";

        if (isReward && structure.discountType !== "NO_DISCOUNT" && structure.discountValue > 0) {
            const discountedPrice = calculateBxgyRewardPrice(product.price, structure);
            const isFree = discountedPrice === 0;
            badgeHtml = isFree ? `<span class="rb-sleek__badge">FREE</span>` : "";
            priceHtml = `
                <div class="rb-sleek__price">
                    <span class="rb-sleek__price-current rb-sleek__price-current--reward">${isFree ? formatMoney(0) : formatMoney(discountedPrice)}</span>
                    ${ctx.showComparePrices ? `<span class="rb-sleek__price-compare">${formatMoney(product.price)}</span>` : ""}
                </div>
            `;
        } else {
            labelHtml = `<span class="rb-sleek__label">${escapeHtml(youPayLabel)}</span>`;
            priceHtml = `
                <div class="rb-sleek__price">
                    <span class="rb-sleek__price-current">${formatMoney(product.price)}</span>
                </div>
            `;
        }

        const cardClass = `rb-sleek__card rb-sleek__card--${isReward ? "reward" : "trigger"}`;

        return `
            <div class="${cardClass}">
                ${imageBlock}
                <div class="rb-sleek__info">
                    <h4 class="rb-sleek__title">${escapeHtml(product.title)}</h4>
                    ${labelHtml}${badgeHtml}
                </div>
                ${priceHtml}
            </div>
        `;
    };

    const totalDiscounted = triggers.reduce((sum, p) => sum + p.price, 0) +
        rewards.reduce((sum, p) => sum + calculateBxgyRewardPrice(p.price, structure), 0);

    const buttonText = ctx.container.querySelector("[data-bundle-add-to-cart]")?.textContent?.trim() || "Add to Cart";

    let html = `<div class="rb-sleek__container">`;
    html += `<h3 class="rb-sleek__header">${escapeHtml(bundle.name)}</h3>`;

    triggers.forEach(p => { html += renderCard(p, false); });
    html += `<div class="rb-sleek__divider">+</div>`;
    rewards.forEach(p => { html += renderCard(p, true); });

    html += `<div class="rb-sleek__separator"></div>`;
    html += `
        <div class="rb-sleek__footer">
            <span class="rb-sleek__total">Total: ${formatMoney(totalDiscounted)}</span>
            <button class="rb-sleek__cart-btn" data-sleek-add-to-cart>${escapeHtml(buttonText)}</button>
        </div>
    `;
    html += `</div>`;

    container.innerHTML = html;
    hideStandardPricing(ctx.container);
    hideStandardButton(ctx.container);
    wireCustomCartButton(container, ctx.container, "[data-sleek-add-to-cart]");
}

export function renderBogoMinimalistProducts(bundle: Bundle, container: Element, ctx: BogoContext): void {
    const { triggers, rewards } = splitByRole(bundle);
    const allProducts = [...triggers, ...rewards];
    const structure = ctx.bundleStructure || bundle;
    const imgLoading = ctx.lazyLoadImages ? ' loading="lazy"' : "";

    const totalOriginal = allProducts.reduce((sum, p) => sum + p.price, 0);
    const totalDiscounted = triggers.reduce((sum, p) => sum + p.price, 0) +
        rewards.reduce((sum, p) => sum + calculateBxgyRewardPrice(p.price, structure), 0);
    const savings = totalOriginal - totalDiscounted;

    const triggerProduct = triggers[0];

    let badgeHtml = "";
    if (savings > 0 && ctx.showSavingsBadge) {
        let badgeText = "";
        if (structure.discountType === "PERCENTAGE" && structure.discountValue === 100) {
            badgeText = "Buy 1 Get 1 FREE";
        } else if (structure.discountType === "PERCENTAGE" && structure.discountValue > 0) {
            badgeText = `Save ${structure.discountValue}%`;
        } else if (structure.discountType === "FIXED_AMOUNT" && structure.discountValue > 0) {
            badgeText = `Save ${trimMoney(formatMoney(structure.discountValue * 100))}`;
        }
        if (badgeText) {
            badgeHtml = `<span class="rb-minimalist__badge">${escapeHtml(badgeText)}</span>`;
        }
    }

    let heroImageHtml = "";
    if (ctx.showImages && triggerProduct?.featuredImage) {
        heroImageHtml = `<div class="rb-minimalist__hero-image"><img src="${escapeHtml(triggerProduct.featuredImage)}" alt="${escapeHtml(triggerProduct.title)}"${imgLoading} /></div>`;
    } else if (ctx.showImages) {
        heroImageHtml = `<div class="rb-minimalist__hero-placeholder">📦</div>`;
    }

    let pricingHtml = `<span class="rb-minimalist__price">${formatMoney(totalDiscounted)}</span>`;
    if (totalOriginal > totalDiscounted) {
        pricingHtml += `<span class="rb-minimalist__price-compare">${formatMoney(totalOriginal)}</span>`;
    }

    let itemsHtml = `<div class="rb-minimalist__items">`;
    allProducts.forEach(p => {
        const img = ctx.showImages && p.featuredImage
            ? `<div class="rb-minimalist__item-image"><img src="${escapeHtml(p.featuredImage)}" alt="${escapeHtml(p.title)}"${imgLoading} /></div>`
            : "";
        itemsHtml += `<div class="rb-minimalist__item">${img}<span class="rb-minimalist__item-title">${escapeHtml(p.title)}</span></div>`;
    });
    itemsHtml += `</div>`;

    let html = `<div class="rb-minimalist__container">${badgeHtml}<div class="rb-minimalist__hero">${heroImageHtml}<div class="rb-minimalist__hero-info">`;
    html += `<div class="rb-minimalist__title">${escapeHtml(bundle.name)}</div>`;
    if (structure.subtitle) {
        html += `<div class="rb-minimalist__subtitle">${escapeHtml(structure.subtitle)}</div>`;
    }
    html += `<div class="rb-minimalist__pricing">${pricingHtml}</div></div></div>`;
    html += itemsHtml;
    html += `</div>`;

    container.innerHTML = html;
    hideStandardPricing(ctx.container);

    const actionsEl = ctx.container.querySelector(".radius-bundle__actions");
    const minimalistContainer = container.querySelector(".rb-minimalist__container");
    if (actionsEl && minimalistContainer) {
        minimalistContainer.appendChild(actionsEl);
    }
    enableCartButton(ctx.container);
}

export function renderBogoCompactGridProducts(bundle: Bundle, container: Element, ctx: BogoContext): void {
    const { triggers, rewards } = splitByRole(bundle);
    const structure = ctx.bundleStructure || bundle;
    const imgLoading = ctx.lazyLoadImages ? ' loading="lazy"' : "";
    const labels = structure.labels;

    const totalOriginal = [...triggers, ...rewards].reduce((sum, p) => sum + p.price, 0);
    const totalDiscounted = triggers.reduce((sum, p) => sum + p.price, 0) +
        rewards.reduce((sum, p) => sum + calculateBxgyRewardPrice(p.price, structure), 0);
    const savings = totalOriginal - totalDiscounted;

    let badgeText = "";
    if (savings > 0) {
        const badgeRaw = labels?.savingsBadgeText || "Save {amount}";
        let badgeAmount = "";
        if (structure.discountType === "PERCENTAGE") {
            badgeAmount = `${structure.discountValue}%`;
        } else {
            badgeAmount = trimMoney(formatMoney(savings));
        }
        badgeText = formatLabel(badgeRaw, { amount: badgeAmount });
    }

    const renderTile = (product: BundleProduct, isReward: boolean): string => {
        const imageHtml = ctx.showImages && product.featuredImage
            ? `<div class="rb-cg__tile-image"><img src="${escapeHtml(product.featuredImage)}" alt="${escapeHtml(product.title)}"${imgLoading} /></div>`
            : ctx.showImages
              ? `<div class="rb-cg__tile-image"><div class="rb-cg__tile-placeholder">📦</div></div>`
              : "";

        let priceHtml = "";
        if (isReward && structure.discountType !== "NO_DISCOUNT" && structure.discountValue > 0) {
            const discountedPrice = calculateBxgyRewardPrice(product.price, structure);
            const isFree = discountedPrice === 0;
            priceHtml = `<div class="rb-cg__tile-price rb-cg__tile-price--reward">${isFree ? formatMoney(0) : formatMoney(discountedPrice)}</div>`;
            if (ctx.showComparePrices) {
                priceHtml += `<div class="rb-cg__tile-compare">${formatMoney(product.price)}</div>`;
            }
        } else {
            priceHtml = `<div class="rb-cg__tile-price">${formatMoney(product.price)}</div>`;
        }

        const roleLabel = isReward ? "FREE" : "You Pay";
        const tileClass = `rb-cg__tile rb-cg__tile--${isReward ? "reward" : "trigger"}`;

        return `
            <div class="${tileClass}">
                ${imageHtml}
                <span class="rb-cg__tile-role rb-cg__tile-role--${isReward ? "reward" : "trigger"}">${roleLabel}</span>
                <div class="rb-cg__tile-title">${escapeHtml(product.title)}</div>
                ${priceHtml}
            </div>
        `;
    };

    const buttonText = ctx.container.querySelector("[data-bundle-add-to-cart]")?.textContent?.trim() || "Add to Cart";

    let html = `<div class="rb-cg__container">`;

    html += `<div class="rb-cg__banner">`;
    html += `<span class="rb-cg__banner-title">${escapeHtml(bundle.name)}</span>`;
    if (badgeText) {
        html += `<span class="rb-cg__banner-badge">${escapeHtml(badgeText)}</span>`;
    }
    html += `</div>`;

    html += `<div class="rb-cg__tiles">`;
    triggers.forEach(p => { html += renderTile(p, false); });
    html += `<div class="rb-cg__connector">+</div>`;
    rewards.forEach(p => { html += renderTile(p, true); });
    html += `</div>`;

    html += `<div class="rb-cg__footer">`;
    html += `<div class="rb-cg__footer-pricing">`;
    html += `<span class="rb-cg__footer-label">Total</span>`;
    html += `<span class="rb-cg__footer-total">${formatMoney(totalDiscounted)}`;
    if (savings > 0) {
        html += ` <span class="rb-cg__footer-savings">Save ${formatMoney(savings)}</span>`;
    }
    html += `</span></div>`;
    html += `<button class="rb-cg__cart-btn" data-cg-add-to-cart>${escapeHtml(buttonText)}</button>`;
    html += `</div>`;

    html += `</div>`;
    container.innerHTML = html;

    hideStandardPricing(ctx.container);
    hideStandardButton(ctx.container);
    wireCustomCartButton(container, ctx.container, "[data-cg-add-to-cart]");
}
