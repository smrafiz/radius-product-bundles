import type {
    BaseRenderContext,
    Bundle,
    BundleProduct,
    BundleStructure,
} from "./types";
import {
    escapeHtml,
    formatLabel,
    formatMoney,
    getLocalePath,
    trimMoney,
} from "./utils";

export interface BogoContext extends BaseRenderContext {
    showSavings: boolean;
    showSavingsBadge: boolean;
    imagePosition: string;
    badgeStyle: string;
    imageSize: string;
    quantityLabel: string;
}

function splitByRole(bundle: Bundle) {
    const triggers = bundle.products
        .filter((p) => p.role === "TRIGGER")
        .sort((a, b) => a.displayOrder - b.displayOrder);
    const rewards = bundle.products
        .filter((p) => p.role === "REWARD")
        .sort((a, b) => a.displayOrder - b.displayOrder);
    return { triggers, rewards };
}

export function calculateBxgyRewardPrice(
    originalPrice: number,
    structure: BundleStructure,
): number {
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
    const btn = widgetContainer.querySelector(
        "[data-bundle-add-to-cart]",
    ) as HTMLButtonElement | null;
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

function hideStandardHeader(widgetContainer: HTMLElement): void {
    const el = widgetContainer.querySelector(".radius-bundle__header");
    if (el) (el as HTMLElement).style.display = "none";
}

function wireCustomCartButton(
    productsContainer: Element,
    widgetContainer: HTMLElement,
    selector: string,
): void {
    const btn = productsContainer.querySelector(selector);
    if (btn) {
        btn.addEventListener("click", () => {
            const realBtn = widgetContainer.querySelector(
                "[data-bundle-add-to-cart]",
            ) as HTMLButtonElement | null;
            if (realBtn) {
                realBtn.disabled = false;
                realBtn.click();
            }
        });
    }
}

export function renderBxgyProducts(
    bundle: Bundle,
    container: Element,
    ctx: BogoContext,
): void {
    const { triggers, rewards } = splitByRole(bundle);
    const structure = ctx.bundleStructure || bundle;
    const buyQty = structure.buyQuantity || 1;
    const getQty = structure.getQuantity || 1;
    const imgLoading = ctx.lazyLoadImages ? ' loading="lazy"' : "";

    const renderCard = (product: BundleProduct, isReward: boolean): string => {
        const imageHtml =
            ctx.showImages && product.featuredImage
                ? `<img src="${escapeHtml(product.featuredImage)}" alt="${escapeHtml(product.title)}"${imgLoading} />`
                : ctx.showImages
                  ? `<div class="radius-bundle__product-placeholder">📦</div>`
                  : "";
        const imageWrapper = ctx.showImages
            ? `<div class="radius-bundle__product-image">${imageHtml}</div>`
            : "";
        const productUrl = product.handle
            ? getLocalePath(`/products/${product.handle}`)
            : "#";
        const titleHtml = ctx.enableHyperLink
            ? `<h3 class="radius-bundle__product-title"><a href="${productUrl}">${escapeHtml(product.title)}</a></h3>`
            : `<h3 class="radius-bundle__product-title">${escapeHtml(product.title)}</h3>`;

        let priceHtml: string;
        if (
            isReward &&
            structure.discountType !== "NO_DISCOUNT" &&
            structure.discountValue > 0
        ) {
            const discountedPrice = calculateBxgyRewardPrice(
                product.price,
                structure,
            );
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
    triggers.forEach((p) => {
        html += renderCard(p, false);
    });
    html += `</div>`;

    html += `<div class="radius-bundle__bxgy-arrow"><span>+</span></div>`;

    html += `<div class="radius-bundle__bxgy-section radius-bundle__bxgy-reward">`;
    html += `<div class="radius-bundle__bxgy-label">Get ${getQty}</div>`;
    rewards.forEach((p) => {
        html += renderCard(p, true);
    });
    html += `</div>`;

    container.innerHTML = html;
    enableCartButton(ctx.container);
}

export function renderClassicCardProducts(
    bundle: Bundle,
    container: Element,
    ctx: BogoContext,
): void {
    const { triggers, rewards } = splitByRole(bundle);
    const structure = ctx.bundleStructure || bundle;
    const imgLoading = ctx.lazyLoadImages ? ' loading="lazy"' : "";

    const labels = structure.labels;
    const triggerBadge = labels?.bogoTriggerBadgeText || "You Buy";
    const youPayLabel = labels?.bogoYouPayLabel || "You Pay Only";
    const youSaveLabel = labels?.bogoYouSaveLabel || "You Save";
    const freeText = labels?.bogoFreeText || "FREE";

    let rewardBadge: string;
    if (
        structure.discountType === "PERCENTAGE" &&
        structure.discountValue === 100
    ) {
        rewardBadge = `You Get ${freeText}`;
    } else if (
        structure.discountType === "PERCENTAGE" &&
        structure.discountValue > 0
    ) {
        rewardBadge = `${structure.discountValue}% Off`;
    } else if (
        structure.discountType === "FIXED_AMOUNT" &&
        structure.discountValue > 0
    ) {
        rewardBadge = `${trimMoney(formatMoney(structure.discountValue * 100))} Off`;
    } else {
        rewardBadge = labels?.bogoRewardBadgeText || "You Get";
    }

    const isHorizontal = ctx.imagePosition === "left";
    const isOutlineBadge = ctx.badgeStyle === "outline";
    const aspectClass = `rb-classic__image--${ctx.imageSize}`;

    const renderProduct = (
        product: BundleProduct,
        isReward: boolean,
    ): string => {
        const imageHtml =
            ctx.showImages && product.featuredImage
                ? `<img src="${escapeHtml(product.featuredImage)}" alt="${escapeHtml(product.title)}"${imgLoading} />`
                : ctx.showImages
                  ? `<div class="rb-classic__placeholder">📦</div>`
                  : "";

        const sectionClass = isReward ? "reward" : "trigger";

        let priceHtml = "";
        if (ctx.showPrices) {
            if (
                isReward &&
                structure.discountType !== "NO_DISCOUNT" &&
                structure.discountValue > 0
            ) {
                const discountedPrice = calculateBxgyRewardPrice(
                    product.price,
                    structure,
                );
                const isFree = discountedPrice === 0;
                priceHtml = `<div class="rb-classic__price">`;
                if (ctx.showComparePrices) {
                    priceHtml += `<span class="rb-classic__price-compare">${formatMoney(product.price)}</span>`;
                }
                priceHtml += `<span class="rb-classic__price-current rb-classic__price-current--${sectionClass}">${isFree ? escapeHtml(freeText) : formatMoney(discountedPrice)}</span>`;
                priceHtml += `</div>`;
            } else {
                priceHtml = `<div class="rb-classic__price"><span class="rb-classic__price-current">${formatMoney(product.price)}</span></div>`;
            }
        }

        const imageBlock = ctx.showImages
            ? `<div class="rb-classic__image ${aspectClass}">${imageHtml}</div>`
            : "";

        const productUrl = product.handle
            ? getLocalePath(`/products/${product.handle}`)
            : "#";
        const titleHtml = ctx.enableHyperLink
            ? `<h3 class="rb-classic__title"><a href="${productUrl}">${escapeHtml(product.title)}</a></h3>`
            : `<h3 class="rb-classic__title">${escapeHtml(product.title)}</h3>`;

        return `
            <div class="rb-classic__product${isHorizontal ? " rb-classic__product--horizontal" : ""}">
                ${imageBlock}
                <div class="rb-classic__text">
                    ${titleHtml}
                    ${priceHtml}
                </div>
            </div>
        `;
    };

    let headerBadge = labels?.bogoBadgeText || "";
    if (!headerBadge) {
        const buyQty = triggers.length || structure.buyQuantity || 1;
        const getQty = rewards.length || structure.getQuantity || 1;
        if (
            structure.discountType === "PERCENTAGE" &&
            structure.discountValue === 100
        ) {
            headerBadge = `Buy ${buyQty} Get ${getQty} ${freeText}`;
        } else if (
            structure.discountType === "PERCENTAGE" &&
            structure.discountValue > 0
        ) {
            headerBadge = `Buy ${buyQty} Get ${getQty} at ${structure.discountValue}% Off`;
        } else if (
            structure.discountType === "FIXED_AMOUNT" &&
            structure.discountValue > 0
        ) {
            headerBadge = `Buy ${buyQty} Get ${getQty} at ${trimMoney(formatMoney(structure.discountValue * 100))} Off`;
        }
    }

    let html = `<div class="rb-classic__header">`;
    if (headerBadge && ctx.showSavingsBadge) {
        html += `<span class="rb-classic__header-badge">${headerBadge}</span>`;
    }
    html += `<h2 class="rb-classic__header-title">${bundle.name}</h2>`;
    if (structure.subtitle) {
        html += `<div class="rb-classic__header-subtitle">${structure.subtitle}</div>`;
    }
    html += `</div>`;

    const outlineClass = isOutlineBadge ? " rb-classic__badge--outline" : "";

    html += `<div class="rb-classic__grid">`;
    html += `<div class="rb-classic__card rb-classic__card--trigger">`;
    if (ctx.showSavingsBadge) {
        html += `<span class="rb-classic__badge rb-classic__badge--trigger${outlineClass}">${escapeHtml(triggerBadge)}</span>`;
    }
    const triggerCols =
        triggers.length > 1
            ? `grid-template-columns:repeat(${triggers.length},1fr)`
            : "";
    html += `<div class="rb-classic__group-products"${triggerCols ? ` style="${triggerCols}"` : ""}>`;
    triggers.forEach((p) => {
        html += renderProduct(p, false);
    });
    html += `</div></div>`;

    html += `<div class="rb-classic__card rb-classic__card--reward">`;
    if (ctx.showSavingsBadge) {
        html += `<span class="rb-classic__badge rb-classic__badge--reward${outlineClass}">${escapeHtml(rewardBadge)}</span>`;
    }
    const rewardCols =
        rewards.length > 1
            ? `grid-template-columns:repeat(${rewards.length},1fr)`
            : "";
    html += `<div class="rb-classic__group-products"${rewardCols ? ` style="${rewardCols}"` : ""}>`;
    rewards.forEach((p) => {
        html += renderProduct(p, true);
    });
    html += `</div></div>`;
    html += `</div>`;

    const totalOriginal = [...triggers, ...rewards].reduce(
        (sum, p) => sum + p.price,
        0,
    );
    const totalDiscounted =
        triggers.reduce((sum, p) => sum + p.price, 0) +
        rewards.reduce(
            (sum, p) => sum + calculateBxgyRewardPrice(p.price, structure),
            0,
        );
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

    const actionsEl = container.querySelector(".radius-bundle__actions");
    container.innerHTML = html;
    hideStandardHeader(ctx.container);
    hideStandardPricing(ctx.container);

    if (actionsEl) {
        container.appendChild(actionsEl);
    }
    enableCartButton(ctx.container);
}

export function renderBogoSleekProducts(
    bundle: Bundle,
    container: Element,
    ctx: BogoContext,
): void {
    const { triggers, rewards } = splitByRole(bundle);
    const structure = ctx.bundleStructure || bundle;
    const imgLoading = ctx.lazyLoadImages ? ' loading="lazy"' : "";
    const labels = structure.labels;
    const youPayLabel = labels?.bogoYouPayLabel || "You pay";
    const freeText = labels?.bogoFreeText || "FREE";
    const totalLabel = labels?.bogoTotalLabel || "Total";

    const renderCard = (product: BundleProduct, isReward: boolean): string => {
        const imageHtml =
            ctx.showImages && product.featuredImage
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

        if (
            isReward &&
            structure.discountType !== "NO_DISCOUNT" &&
            structure.discountValue > 0
        ) {
            const discountedPrice = calculateBxgyRewardPrice(
                product.price,
                structure,
            );
            const isFree = discountedPrice === 0;
            let rewardLabel = "";
            if (isFree) {
                rewardLabel = freeText;
            } else if (structure.discountType === "PERCENTAGE") {
                rewardLabel = `${structure.discountValue}% Off`;
            } else if (structure.discountType === "FIXED_AMOUNT") {
                rewardLabel = `${trimMoney(formatMoney(structure.discountValue * 100))} Off`;
            }
            badgeHtml =
                rewardLabel && ctx.showSavingsBadge
                    ? `<span class="rb-sleek__badge">${escapeHtml(rewardLabel)}</span>`
                    : "";
            if (ctx.showPrices) {
                priceHtml = `
                <div class="rb-sleek__price">
                    <span class="rb-sleek__price-current rb-sleek__price-current--reward">${isFree ? formatMoney(0) : formatMoney(discountedPrice)}</span>
                    ${ctx.showComparePrices ? `<span class="rb-sleek__price-compare">${formatMoney(product.price)}</span>` : ""}
                </div>
            `;
            }
        } else {
            labelHtml = ctx.showSavingsBadge
                ? `<span class="rb-sleek__label">${escapeHtml(youPayLabel)}</span>`
                : "";
            if (ctx.showPrices) {
                priceHtml = `
                <div class="rb-sleek__price">
                    <span class="rb-sleek__price-current">${formatMoney(product.price)}</span>
                </div>
            `;
            }
        }

        const cardClass = `rb-sleek__card rb-sleek__card--${isReward ? "reward" : "trigger"}`;

        const productUrl = product.handle
            ? getLocalePath(`/products/${product.handle}`)
            : "#";
        const titleHtml = ctx.enableHyperLink
            ? `<h3 class="rb-sleek__title"><a href="${productUrl}">${escapeHtml(product.title)}</a></h3>`
            : `<h3 class="rb-sleek__title">${escapeHtml(product.title)}</h3>`;

        return `
            <div class="${cardClass}">
                ${imageBlock}
                <div class="rb-sleek__info">
                    ${titleHtml}
                    ${labelHtml}${badgeHtml}
                </div>
                ${priceHtml}
            </div>
        `;
    };

    const totalDiscounted =
        triggers.reduce((sum, p) => sum + p.price, 0) +
        rewards.reduce(
            (sum, p) => sum + calculateBxgyRewardPrice(p.price, structure),
            0,
        );

    let html = `<div class="rb-sleek__container">`;
    html += `<h2 class="rb-sleek__header">${bundle.name}</h2>`;

    triggers.forEach((p) => {
        html += renderCard(p, false);
    });
    html += `<div class="rb-sleek__divider"><span class="rb-sleek__divider-icon">+</span></div>`;
    rewards.forEach((p) => {
        html += renderCard(p, true);
    });

    html += `<div class="rb-sleek__separator"></div>`;
    html += `<div class="rb-sleek__footer">`;
    html += `<span class="rb-sleek__total">${escapeHtml(totalLabel)}: ${formatMoney(totalDiscounted)}</span>`;
    html += `</div>`;
    html += `</div>`;

    const actionsEl = container.querySelector(".radius-bundle__actions");
    container.innerHTML = html;
    hideStandardHeader(ctx.container);
    hideStandardPricing(ctx.container);

    const footerEl = container.querySelector(".rb-sleek__footer");
    if (actionsEl && footerEl) {
        actionsEl.classList.add("rb-sleek__actions-inline");
        footerEl.appendChild(actionsEl);
    }
    enableCartButton(ctx.container);
}

export function renderBogoMinimalistProducts(
    bundle: Bundle,
    container: Element,
    ctx: BogoContext,
): void {
    const { triggers, rewards } = splitByRole(bundle);
    const allProducts = [...triggers, ...rewards];
    const structure = ctx.bundleStructure || bundle;
    const imgLoading = ctx.lazyLoadImages ? ' loading="lazy"' : "";

    const totalOriginal = allProducts.reduce((sum, p) => sum + p.price, 0);
    const totalDiscounted =
        triggers.reduce((sum, p) => sum + p.price, 0) +
        rewards.reduce(
            (sum, p) => sum + calculateBxgyRewardPrice(p.price, structure),
            0,
        );
    const savings = totalOriginal - totalDiscounted;

    const triggerProduct = triggers[0];

    const minLabels = structure.labels;
    let badgeHtml = "";
    if (savings > 0 && ctx.showSavingsBadge) {
        let badgeText = minLabels?.bogoBadgeText || "";
        if (!badgeText) {
            const buyQty = triggers.length || structure.buyQuantity || 1;
            const getQty = rewards.length || structure.getQuantity || 1;
            const freeText = minLabels?.bogoFreeText || "FREE";
            if (
                structure.discountType === "PERCENTAGE" &&
                structure.discountValue === 100
            ) {
                badgeText = `Buy ${buyQty} Get ${getQty} ${freeText}`;
            } else if (
                structure.discountType === "PERCENTAGE" &&
                structure.discountValue > 0
            ) {
                badgeText = `Save ${structure.discountValue}%`;
            } else if (
                structure.discountType === "FIXED_AMOUNT" &&
                structure.discountValue > 0
            ) {
                badgeText = `Save ${trimMoney(formatMoney(structure.discountValue * 100))}`;
            }
        }
        if (badgeText) {
            badgeHtml = `<span class="rb-minimalist__badge">${badgeText}</span>`;
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

    const freeText = minLabels?.bogoFreeText || "FREE";
    const triggerBadge = minLabels?.bogoTriggerBadgeText || "You Buy";
    let rewardBadge: string;
    if (
        structure.discountType === "PERCENTAGE" &&
        structure.discountValue === 100
    ) {
        rewardBadge = freeText;
    } else if (
        structure.discountType === "PERCENTAGE" &&
        structure.discountValue > 0
    ) {
        rewardBadge = `${structure.discountValue}% Off`;
    } else if (
        structure.discountType === "FIXED_AMOUNT" &&
        structure.discountValue > 0
    ) {
        rewardBadge = `${trimMoney(formatMoney(structure.discountValue * 100))} Off`;
    } else {
        rewardBadge = minLabels?.bogoRewardBadgeText || "You Get";
    }

    const renderMinItem = (p: BundleProduct, isReward: boolean): string => {
        const img =
            ctx.showImages && p.featuredImage
                ? `<div class="rb-minimalist__item-image"><img src="${escapeHtml(p.featuredImage)}" alt="${escapeHtml(p.title)}"${imgLoading} /></div>`
                : "";
        const roleClass = isReward ? "reward" : "trigger";
        const roleBadge = isReward ? rewardBadge : triggerBadge;

        let priceHtml = "";
        if (ctx.showPrices) {
            if (
                isReward &&
                structure.discountType !== "NO_DISCOUNT" &&
                structure.discountValue > 0
            ) {
                const discountedPrice = calculateBxgyRewardPrice(
                    p.price,
                    structure,
                );
                const isFree = discountedPrice === 0;
                priceHtml = `<div class="rb-minimalist__item-price">`;
                priceHtml += `<span class="rb-minimalist__item-price-current rb-minimalist__item-price-current--reward">${isFree ? escapeHtml(freeText) : formatMoney(discountedPrice)}</span>`;
                if (ctx.showComparePrices) {
                    priceHtml += `<span class="rb-minimalist__item-price-compare">${formatMoney(p.price)}</span>`;
                }
                priceHtml += `</div>`;
            } else {
                priceHtml = `<div class="rb-minimalist__item-price"><span class="rb-minimalist__item-price-current">${formatMoney(p.price)}</span></div>`;
            }
        }

        const productUrl = p.handle
            ? getLocalePath(`/products/${p.handle}`)
            : "#";
        const titleHtml = ctx.enableHyperLink
            ? `<h3 class="rb-minimalist__item-title"><a href="${productUrl}">${escapeHtml(p.title)}</a></h3>`
            : `<h3 class="rb-minimalist__item-title">${escapeHtml(p.title)}</h3>`;
        const roleLabelHtml = ctx.showSavingsBadge
            ? `<span class="rb-minimalist__item-role rb-minimalist__item-role--${roleClass}">${escapeHtml(roleBadge)}</span>`
            : "";

        return `<div class="rb-minimalist__item rb-minimalist__item--${roleClass}">
            ${img}
            <div class="rb-minimalist__item-info">
                ${roleLabelHtml}
                ${titleHtml}
                ${priceHtml}
            </div>
        </div>`;
    };

    let itemsHtml = `<div class="rb-minimalist__items">`;
    triggers.forEach((p) => {
        itemsHtml += renderMinItem(p, false);
    });
    rewards.forEach((p) => {
        itemsHtml += renderMinItem(p, true);
    });
    itemsHtml += `</div>`;

    let html = `<div class="rb-minimalist__container">${badgeHtml}<div class="rb-minimalist__hero">${heroImageHtml}<div class="rb-minimalist__hero-info">`;
    html += `<h2 class="rb-minimalist__title">${bundle.name}</h2>`;
    if (structure.subtitle) {
        html += `<div class="rb-minimalist__subtitle">${structure.subtitle}</div>`;
    }
    html += `<div class="rb-minimalist__pricing">${pricingHtml}</div></div></div>`;
    html += itemsHtml;
    html += `</div>`;

    const actionsEl = container.querySelector(".radius-bundle__actions");
    container.innerHTML = html;
    hideStandardHeader(ctx.container);
    hideStandardPricing(ctx.container);

    const minimalistContainer = container.querySelector(
        ".rb-minimalist__container",
    );
    if (actionsEl && minimalistContainer) {
        minimalistContainer.appendChild(actionsEl);
    }
    enableCartButton(ctx.container);
}

export function renderBogoCompactGridProducts(
    bundle: Bundle,
    container: Element,
    ctx: BogoContext,
): void {
    const { triggers, rewards } = splitByRole(bundle);
    const structure = ctx.bundleStructure || bundle;
    const imgLoading = ctx.lazyLoadImages ? ' loading="lazy"' : "";
    const labels = structure.labels;

    const totalOriginal = [...triggers, ...rewards].reduce(
        (sum, p) => sum + p.price,
        0,
    );
    const totalDiscounted =
        triggers.reduce((sum, p) => sum + p.price, 0) +
        rewards.reduce(
            (sum, p) => sum + calculateBxgyRewardPrice(p.price, structure),
            0,
        );
    const savings = totalOriginal - totalDiscounted;

    let badgeText = "";
    if (savings > 0 && ctx.showSavingsBadge) {
        badgeText = labels?.bogoBadgeText || "";
        if (!badgeText) {
            const buyQty = triggers.length || structure.buyQuantity || 1;
            const getQty = rewards.length || structure.getQuantity || 1;
            const freeText = labels?.bogoFreeText || "FREE";
            if (
                structure.discountType === "PERCENTAGE" &&
                structure.discountValue === 100
            ) {
                badgeText = `Buy ${buyQty} Get ${getQty} ${freeText}`;
            } else if (
                structure.discountType === "PERCENTAGE" &&
                structure.discountValue > 0
            ) {
                badgeText = `Save ${structure.discountValue}%`;
            } else if (
                structure.discountType === "FIXED_AMOUNT" &&
                structure.discountValue > 0
            ) {
                badgeText = `Save ${trimMoney(formatMoney(structure.discountValue * 100))}`;
            }
        }
    }

    const renderTile = (product: BundleProduct, isReward: boolean): string => {
        const imageHtml =
            ctx.showImages && product.featuredImage
                ? `<div class="rb-cg__tile-image"><img src="${escapeHtml(product.featuredImage)}" alt="${escapeHtml(product.title)}"${imgLoading} /></div>`
                : ctx.showImages
                  ? `<div class="rb-cg__tile-image"><div class="rb-cg__tile-placeholder">📦</div></div>`
                  : "";

        let priceHtml = "";
        const hasRewardDiscount =
            isReward &&
            structure.discountType !== "NO_DISCOUNT" &&
            structure.discountValue > 0;
        const discountedPrice = hasRewardDiscount
            ? calculateBxgyRewardPrice(product.price, structure)
            : product.price;
        const isFree = hasRewardDiscount && discountedPrice === 0;

        if (ctx.showPrices) {
            if (hasRewardDiscount) {
                priceHtml = `<div class="rb-cg__tile-prices">`;
                priceHtml += `<div class="rb-cg__tile-price rb-cg__tile-price--reward">${isFree ? formatMoney(0) : formatMoney(discountedPrice)}</div>`;
                if (ctx.showComparePrices) {
                    priceHtml += `<div class="rb-cg__tile-compare">${formatMoney(product.price)}</div>`;
                }
                priceHtml += `</div>`;
            } else {
                priceHtml = `<div class="rb-cg__tile-prices"><div class="rb-cg__tile-price">${formatMoney(product.price)}</div></div>`;
            }
        }

        const cgFreeText = labels?.bogoFreeText || "FREE";
        const cgPayLabel = labels?.bogoYouPayLabel || "You Pay";
        let roleLabel = cgPayLabel;
        if (isReward) {
            if (isFree) {
                roleLabel = cgFreeText;
            } else if (structure.discountType === "PERCENTAGE") {
                roleLabel = `${structure.discountValue}% Off`;
            } else if (structure.discountType === "FIXED_AMOUNT") {
                roleLabel = `${trimMoney(formatMoney(structure.discountValue * 100))} Off`;
            } else {
                roleLabel = labels?.bogoRewardBadgeText || cgFreeText;
            }
        }
        const tileClass = `rb-cg__tile rb-cg__tile--${isReward ? "reward" : "trigger"}`;

        const productUrl = product.handle
            ? getLocalePath(`/products/${product.handle}`)
            : "#";
        const titleHtml = ctx.enableHyperLink
            ? `<h3 class="rb-cg__tile-title"><a href="${productUrl}">${escapeHtml(product.title)}</a></h3>`
            : `<h3 class="rb-cg__tile-title">${escapeHtml(product.title)}</h3>`;

        const roleLabelHtml = ctx.showSavingsBadge
            ? `<span class="rb-cg__tile-role rb-cg__tile-role--${isReward ? "reward" : "trigger"}">${roleLabel}</span>`
            : "";

        return `
            <div class="${tileClass}">
                ${imageHtml}
                ${roleLabelHtml}
                ${titleHtml}
                ${priceHtml}
            </div>
        `;
    };

    let html = `<div class="rb-cg__container">`;

    html += `<div class="rb-cg__banner">`;
    html += `<div class="rb-cg__banner-text">`;
    html += `<h2 class="rb-cg__banner-title">${bundle.name}</h2>`;
    if (structure.subtitle) {
        html += `<span class="rb-cg__banner-subtitle">${structure.subtitle}</span>`;
    }
    html += `</div>`;
    if (badgeText) {
        html += `<span class="rb-cg__banner-badge">${badgeText}</span>`;
    }
    html += `</div>`;

    const renderSliderGroup = (
        products: BundleProduct[],
        isReward: boolean,
        groupClass: string,
        perPage: number,
        flexVal: number,
    ): string => {
        const pages: BundleProduct[][] = [];
        for (let i = 0; i < products.length; i += perPage) {
            pages.push(products.slice(i, i + perPage));
        }
        let g = `<div class="rb-cg__tile-group ${groupClass}" style="flex:${flexVal}">`;
        g += `<div class="rb-cg__slider" data-cg-slider>`;
        pages.forEach((page) => {
            const cols = page.length === 1 ? 1 : perPage;
            g += `<div class="rb-cg__slide" style="grid-template-columns:repeat(${cols},1fr)">`;
            page.forEach((p) => {
                g += renderTile(p, isReward);
            });
            g += `</div>`;
        });
        g += `</div>`;
        if (pages.length > 1) {
            g += `<div class="rb-cg__dots">`;
            pages.forEach((_, i) => {
                g += `<button class="rb-cg__dot${i === 0 ? " rb-cg__dot--active" : ""}" data-cg-dot="${i}"></button>`;
            });
            g += `</div>`;
        }
        g += `</div>`;
        return g;
    };

    const singleEach = triggers.length <= 1 && rewards.length <= 1;
    html += `<div class="rb-cg__tiles">`;
    html += renderSliderGroup(
        triggers,
        false,
        "rb-cg__tile-group--trigger",
        2,
        singleEach ? 1 : 2,
    );
    html += `<div class="rb-cg__connector">+</div>`;
    html += renderSliderGroup(rewards, true, "rb-cg__tile-group--reward", 1, 1);
    html += `</div>`;

    html += `<div class="rb-cg__footer">`;
    html += `<div class="rb-cg__footer-pricing">`;
    const cgTotalLabel = labels?.bogoTotalLabel || "Total";
    const cgSaveText = labels?.bogoSaveText || "Save {amount}";
    html += `<span class="rb-cg__footer-label">${escapeHtml(cgTotalLabel)}</span>`;
    html += `<span class="rb-cg__footer-total">${formatMoney(totalDiscounted)}`;
    if (savings > 0) {
        html += ` <span class="rb-cg__footer-savings">${escapeHtml(formatLabel(cgSaveText, { amount: formatMoney(savings) }))}</span>`;
    }
    html += `</span></div>`;
    html += `</div>`;

    html += `</div>`;
    const actionsEl = container.querySelector(".radius-bundle__actions");
    container.innerHTML = html;
    hideStandardHeader(ctx.container);
    hideStandardPricing(ctx.container);

    const footerEl = container.querySelector(".rb-cg__footer");
    if (actionsEl && footerEl) {
        actionsEl.classList.add("rb-cg__actions-inline");
        footerEl.appendChild(actionsEl);
    }
    enableCartButton(ctx.container);

    container
        .querySelectorAll<HTMLElement>("[data-cg-slider]")
        .forEach((slider) => {
            const group = slider.parentElement;
            if (!group) return;
            const dots =
                group.querySelectorAll<HTMLButtonElement>("[data-cg-dot]");
            const pageCount = slider.children.length;
            let current = 0;

            const sw = () => group.offsetWidth;

            const goTo = (idx: number) => {
                current = Math.max(0, Math.min(idx, pageCount - 1));
                slider.style.transition = "transform 0.3s ease";
                slider.style.transform = `translateX(-${current * sw()}px)`;
                dots.forEach((d) => d.classList.remove("rb-cg__dot--active"));
                dots[current]?.classList.add("rb-cg__dot--active");
            };

            dots.forEach((dot) => {
                dot.addEventListener("click", () =>
                    goTo(Number(dot.dataset.cgDot || 0)),
                );
            });

            let startX = 0;
            let dragging = false;

            const onStart = (x: number) => {
                startX = x;
                dragging = true;
                slider.style.transition = "none";
                slider.classList.add("rb-cg__slider--dragging");
            };
            const onMove = (x: number) => {
                if (!dragging) return;
                const dx = x - startX;
                slider.style.transform = `translateX(${-current * sw() + dx}px)`;
            };
            const onEnd = (x: number) => {
                if (!dragging) return;
                dragging = false;
                slider.classList.remove("rb-cg__slider--dragging");
                const dx = x - startX;
                const threshold = sw() * 0.2;
                if (dx < -threshold && current < pageCount - 1)
                    goTo(current + 1);
                else if (dx > threshold && current > 0) goTo(current - 1);
                else goTo(current);
            };

            slider.addEventListener("mousedown", (e) => {
                e.preventDefault();
                onStart(e.clientX);
            });
            slider.addEventListener("mousemove", (e) => onMove(e.clientX));
            slider.addEventListener("mouseup", (e) => onEnd(e.clientX));
            slider.addEventListener("mouseleave", () => {
                if (dragging) onEnd(startX);
            });
            slider.addEventListener(
                "touchstart",
                (e) => onStart(e.touches[0].clientX),
                { passive: true },
            );
            slider.addEventListener(
                "touchmove",
                (e) => onMove(e.touches[0].clientX),
                { passive: true },
            );
            slider.addEventListener("touchend", (e) =>
                onEnd(e.changedTouches[0].clientX),
            );
        });
}

export function renderBogoChecklistProducts(
    bundle: Bundle,
    container: Element,
    ctx: BogoContext,
): void {
    const { triggers, rewards } = splitByRole(bundle);
    const structure = ctx.bundleStructure || bundle;
    const imgLoading = ctx.lazyLoadImages ? ' loading="lazy"' : "";
    const labels = structure.labels;
    const freeText = labels?.bogoFreeText || "FREE";
    const progressText =
        labels?.checklistProgressText || "{count}/{total} items added";
    const hintText = labels?.checklistHintText || "{remaining} more to unlock!";
    const completedText = labels?.checklistCompletedText || "Unlocked!";
    const lockedLabel =
        labels?.checklistLockedLabel || "Unlock by adding all items above";
    const unlockedLabel = labels?.checklistUnlockedLabel || "Reward Unlocked";
    const pricingLockedText =
        labels?.checklistPricingLockedText ||
        "Select all items to see your price";
    const totalLabel = labels?.bogoTotalLabel || "Total";
    const discountLabel = labels?.youSaveLabel || "You Save";
    const youPayLabel = labels?.bogoYouPayLabel || "You Pay";

    const totalTriggers = triggers.length;
    const progress = 0;
    const isUnlocked = false;
    const progressPercent = 0;

    const checkSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    const lockSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`;
    const unlockSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>`;

    let rewardBadgeText: string;
    if (
        structure.discountType === "PERCENTAGE" &&
        structure.discountValue === 100
    ) {
        rewardBadgeText = freeText;
    } else if (
        structure.discountType === "PERCENTAGE" &&
        structure.discountValue > 0
    ) {
        rewardBadgeText = `${structure.discountValue}% Off`;
    } else if (
        structure.discountType === "FIXED_AMOUNT" &&
        structure.discountValue > 0
    ) {
        rewardBadgeText = `${trimMoney(formatMoney(structure.discountValue * 100))} Off`;
    } else {
        rewardBadgeText = labels?.bogoRewardBadgeText || "You Get";
    }

    let html = `<div class="rb-checklist__container">`;

    html += `<div class="rb-checklist__progress">`;
    html += `<h2 class="rb-checklist__progress-title">${bundle.name}</h2>`;
    if (structure.subtitle) {
        html += `<p class="rb-checklist__progress-subtitle">${structure.subtitle}</p>`;
    }
    html += `<div class="rb-checklist__progress-row">`;
    html += `<span class="rb-checklist__progress-count">${formatLabel(progressText, { count: progress, total: totalTriggers })}</span>`;
    html += `<span class="rb-checklist__progress-hint">${formatLabel(hintText, { remaining: totalTriggers })}</span>`;
    html += `</div>`;
    html += `<div class="rb-checklist__progress-track"><div class="rb-checklist__progress-fill" style="width:${progressPercent}%"></div></div>`;
    html += `</div>`;

    html += `<div class="rb-checklist__section">`;
    triggers.forEach((p) => {
        const imageHtml =
            ctx.showImages && p.featuredImage
                ? `<div class="rb-checklist__item-image"><img src="${escapeHtml(p.featuredImage)}" alt="${escapeHtml(p.title)}"${imgLoading} /></div>`
                : ctx.showImages
                  ? `<div class="rb-checklist__item-placeholder">📦</div>`
                  : "";

        const productUrl = p.handle
            ? getLocalePath(`/products/${p.handle}`)
            : "#";
        const titleHtml = ctx.enableHyperLink
            ? `<h3 class="rb-checklist__item-title"><a href="${productUrl}">${escapeHtml(p.title)}</a></h3>`
            : `<h3 class="rb-checklist__item-title">${escapeHtml(p.title)}</h3>`;

        html += `<div class="rb-checklist__item" data-product-id="${p.id}" data-variant-id="${p.variantId}">`;
        html += `<div class="rb-checklist__checkbox"></div>`;
        html += imageHtml;
        html += `<div class="rb-checklist__item-info">`;
        html += titleHtml;
        if (ctx.showQuantity && p.quantity > 1) {
            html += `<div class="rb-checklist__item-qty">${ctx.quantityLabel} ${p.quantity}</div>`;
        }
        html += `</div>`;
        if (ctx.showPrices) {
            html += `<div class="rb-checklist__item-price">${formatMoney(p.price)}</div>`;
        }
        html += `</div>`;
    });
    html += `</div>`;

    const rewardStateClass = isUnlocked
        ? "rb-checklist__reward--unlocked"
        : "rb-checklist__reward--locked";
    html += `<div class="rb-checklist__reward ${rewardStateClass}">`;
    html += `<div class="rb-checklist__reward-header">`;
    html += `<span class="rb-checklist__reward-label">${escapeHtml(lockedLabel)}</span>`;
    if (rewardBadgeText && ctx.showSavingsBadge) {
        html += `<span class="rb-checklist__reward-badge">${escapeHtml(rewardBadgeText)}</span>`;
    }
    html += `<span class="rb-checklist__lock-icon">${isUnlocked ? unlockSvg : lockSvg}</span>`;
    html += `</div>`;
    html += `<div class="rb-checklist__reward-products">`;
    rewards.forEach((p) => {
        const imageHtml =
            ctx.showImages && p.featuredImage
                ? `<div class="rb-checklist__reward-image"><img src="${escapeHtml(p.featuredImage)}" alt="${escapeHtml(p.title)}"${imgLoading} /></div>`
                : ctx.showImages
                  ? `<div class="rb-checklist__reward-placeholder">🎁</div>`
                  : "";

        const productUrl = p.handle
            ? getLocalePath(`/products/${p.handle}`)
            : "#";
        const titleHtml = ctx.enableHyperLink
            ? `<h3 class="rb-checklist__reward-title"><a href="${productUrl}">${escapeHtml(p.title)}</a></h3>`
            : `<h3 class="rb-checklist__reward-title">${escapeHtml(p.title)}</h3>`;

        html += `<div class="rb-checklist__reward-item">`;
        html += imageHtml;
        html += `<div class="rb-checklist__reward-info">`;
        html += titleHtml;
        if (ctx.showPrices) {
            const discountedPrice = calculateBxgyRewardPrice(
                p.price,
                structure,
            );
            const isFree = discountedPrice === 0;
            html += `<div class="rb-checklist__reward-price">`;
            html += `<span class="rb-checklist__reward-price-current">${isFree ? escapeHtml(freeText) : formatMoney(discountedPrice)}</span>`;
            if (
                ctx.showComparePrices &&
                structure.discountType !== "NO_DISCOUNT" &&
                structure.discountValue > 0
            ) {
                html += `<span class="rb-checklist__reward-price-compare">${formatMoney(p.price)}</span>`;
            }
            html += `</div>`;
        }
        html += `</div></div>`;
    });
    html += `</div></div>`;

    // Pricing summary box
    if (ctx.showPrices) {
        const originalTotal = [...triggers, ...rewards].reduce(
            (s, p) => s + p.price * p.quantity,
            0,
        );
        const discountedTotal =
            triggers.reduce((s, p) => s + p.price * p.quantity, 0) +
            rewards.reduce(
                (s, p) =>
                    s +
                    calculateBxgyRewardPrice(p.price, structure) * p.quantity,
                0,
            );
        const savings = originalTotal - discountedTotal;
        const savingsPct =
            originalTotal > 0 ? Math.round((savings / originalTotal) * 100) : 0;

        html += `<div class="rb-checklist__pricing rb-checklist__pricing--locked" data-original="${originalTotal}" data-discounted="${discountedTotal}" data-savings="${savings}" data-savings-pct="${savingsPct}">`;
        html += `<div class="rb-checklist__pricing-locked-text">${escapeHtml(pricingLockedText)}</div>`;
        html += `<div class="rb-checklist__pricing-details" style="display:none">`;
        html += `<div class="rb-checklist__pricing-row"><span>${escapeHtml(totalLabel)}</span><span class="rb-checklist__pricing-original">${formatMoney(originalTotal)}</span></div>`;
        if (savings > 0) {
            html += `<div class="rb-checklist__pricing-row rb-checklist__pricing-discount"><span>${escapeHtml(discountLabel)}</span><span>-${formatMoney(savings)}</span></div>`;
        }
        html += `<div class="rb-checklist__pricing-divider"></div>`;
        html += `<div class="rb-checklist__pricing-row rb-checklist__pricing-total"><span>${escapeHtml(youPayLabel)}</span><span>${formatMoney(discountedTotal)}</span></div>`;
        html += `</div></div>`;
    }

    html += `</div>`;

    const actionsEl = container.querySelector(".radius-bundle__actions");
    container.innerHTML = html;
    hideStandardHeader(ctx.container);
    hideStandardPricing(ctx.container);

    const checklistContainer = container.querySelector(
        ".rb-checklist__container",
    );
    if (actionsEl && checklistContainer) {
        checklistContainer.appendChild(actionsEl);
    }

    const realBtn = container.querySelector(
        "[data-bundle-add-to-cart]",
    ) as HTMLButtonElement | null;
    const items = container.querySelectorAll(".rb-checklist__item");
    const fill = container.querySelector(
        ".rb-checklist__progress-fill",
    ) as HTMLElement | null;
    const countEl = container.querySelector(".rb-checklist__progress-count");
    const hintEl = container.querySelector(".rb-checklist__progress-hint");
    const reward = container.querySelector(".rb-checklist__reward");
    const lockIcon = container.querySelector(".rb-checklist__lock-icon");
    const rewardLabel = container.querySelector(".rb-checklist__reward-label");
    const pricingBox = container.querySelector(".rb-checklist__pricing");
    const pricingLocked = container.querySelector(
        ".rb-checklist__pricing-locked-text",
    ) as HTMLElement | null;
    const pricingDetails = container.querySelector(
        ".rb-checklist__pricing-details",
    ) as HTMLElement | null;
    const total = items.length;

    const syncState = () => {
        const checked = container.querySelectorAll(
            ".rb-checklist__item--checked",
        ).length;
        const pct = total > 0 ? (checked / total) * 100 : 0;
        if (fill) {
            fill.style.width = `${pct}%`;
        }
        if (countEl) {
            countEl.textContent = formatLabel(progressText, {
                count: checked,
                total,
            });
        }
        const remaining = total - checked;
        if (hintEl) {
            hintEl.textContent =
                remaining > 0
                    ? formatLabel(hintText, { remaining })
                    : completedText;
        }
        const allChecked = checked >= total;
        if (reward) {
            reward.classList.toggle(
                "rb-checklist__reward--locked",
                !allChecked,
            );
            reward.classList.toggle(
                "rb-checklist__reward--unlocked",
                allChecked,
            );
        }
        if (lockIcon) {
            lockIcon.innerHTML = allChecked ? unlockSvg : lockSvg;
        }
        if (rewardLabel) {
            rewardLabel.textContent = allChecked ? unlockedLabel : lockedLabel;
        }
        if (pricingBox) {
            pricingBox.classList.toggle(
                "rb-checklist__pricing--locked",
                !allChecked,
            );
            pricingBox.classList.toggle(
                "rb-checklist__pricing--unlocked",
                allChecked,
            );
        }
        if (pricingLocked) {
            pricingLocked.style.display = allChecked ? "none" : "";
        }
        if (pricingDetails) {
            pricingDetails.style.display = allChecked ? "" : "none";
        }
        if (realBtn) {
            realBtn.disabled = !allChecked;
        }
    };

    items.forEach((item) => {
        item.addEventListener("click", () => {
            const isChecked = item.classList.toggle(
                "rb-checklist__item--checked",
            );
            const cb = item.querySelector(".rb-checklist__checkbox");
            if (cb) {
                cb.classList.toggle(
                    "rb-checklist__checkbox--checked",
                    isChecked,
                );
                cb.innerHTML = isChecked ? checkSvg : "";
            }
            syncState();
        });
    });
}

export function renderSplitDealProducts(
    bundle: Bundle,
    container: Element,
    ctx: BogoContext,
): void {
    const { triggers, rewards } = splitByRole(bundle);
    const structure = ctx.bundleStructure || bundle;
    const imgLoading = ctx.lazyLoadImages ? ' loading="lazy"' : "";
    const labels = structure.labels;
    const triggerLabel = labels?.bogoTriggerBadgeText || "Buy";
    const freeText = labels?.bogoFreeText || "FREE";
    const youPayLabel = labels?.bogoYouPayLabel || "You Pay";
    const youSaveLabel = labels?.bogoYouSaveLabel || "You Save";

    let rewardLabel: string;
    if (
        structure.discountType === "PERCENTAGE" &&
        structure.discountValue === 100
    ) {
        rewardLabel = `Get ${freeText}`;
    } else if (
        structure.discountType === "PERCENTAGE" &&
        structure.discountValue > 0
    ) {
        rewardLabel = `Get at ${structure.discountValue}% Off`;
    } else if (
        structure.discountType === "FIXED_AMOUNT" &&
        structure.discountValue > 0
    ) {
        rewardLabel = `Get ${trimMoney(formatMoney(structure.discountValue * 100))} Off`;
    } else {
        rewardLabel = labels?.bogoRewardBadgeText || "Get";
    }

    let badgeText = labels?.bogoBadgeText || "";
    if (!badgeText) {
        const buyQty = triggers.length || structure.buyQuantity || 1;
        const getQty = rewards.length || structure.getQuantity || 1;
        if (
            structure.discountType === "PERCENTAGE" &&
            structure.discountValue === 100
        ) {
            badgeText = `Buy ${buyQty} Get ${getQty} ${freeText}`;
        } else if (
            structure.discountType === "PERCENTAGE" &&
            structure.discountValue > 0
        ) {
            badgeText = `Buy ${buyQty} Get ${getQty} at ${structure.discountValue}% Off`;
        } else if (
            structure.discountType === "FIXED_AMOUNT" &&
            structure.discountValue > 0
        ) {
            badgeText = `Buy ${buyQty} Get ${getQty} — ${trimMoney(formatMoney(structure.discountValue * 100))} Off`;
        }
    }

    const renderProduct = (
        product: BundleProduct,
        isReward: boolean,
    ): string => {
        const imageHtml =
            ctx.showImages && product.featuredImage
                ? `<img src="${escapeHtml(product.featuredImage)}" alt="${escapeHtml(product.title)}"${imgLoading} />`
                : ctx.showImages
                  ? `<div class="rb-split__product-placeholder">📦</div>`
                  : "";
        const imageBlock = ctx.showImages
            ? `<div class="rb-split__product-image">${imageHtml}</div>`
            : "";

        let priceHtml = "";
        let savingsHtml = "";
        if (ctx.showPrices) {
            if (
                isReward &&
                structure.discountType !== "NO_DISCOUNT" &&
                structure.discountValue > 0
            ) {
                const discountedPrice = calculateBxgyRewardPrice(
                    product.price,
                    structure,
                );
                const isFree = discountedPrice === 0;

                priceHtml = `<div class="rb-split__product-price">`;
                priceHtml += `<span class="rb-split__price-current rb-split__price-current--reward">${isFree ? escapeHtml(freeText) : formatMoney(discountedPrice)}</span>`;
                if (ctx.showComparePrices) {
                    priceHtml += `<span class="rb-split__price-compare">${formatMoney(product.price)}</span>`;
                }
                priceHtml += `</div>`;
            } else {
                priceHtml = `<div class="rb-split__product-price"><span class="rb-split__price-current">${formatMoney(product.price)}</span></div>`;
            }
        }

        const productUrl = product.handle
            ? getLocalePath(`/products/${product.handle}`)
            : "#";
        const titleHtml = ctx.enableHyperLink
            ? `<h3 class="rb-split__product-title"><a href="${productUrl}">${escapeHtml(product.title)}</a></h3>`
            : `<h3 class="rb-split__product-title">${escapeHtml(product.title)}</h3>`;

        return `
            <div class="rb-split__product" data-product-id="${product.id}" data-variant-id="${product.variantId}">
                ${imageBlock}
                <div class="rb-split__product-info">
                    ${titleHtml}
                    ${priceHtml}
                </div>
            </div>
        `;
    };

    let html = `<div class="rb-split__container">`;

    html += `<div class="rb-split__header">`;
    if (badgeText && ctx.showSavingsBadge) {
        html += `<div class="rb-split__deal-badge">${badgeText}</div>`;
    }
    html += `<h2 class="rb-split__title">${bundle.name}</h2>`;
    if (structure.subtitle) {
        html += `<p class="rb-split__subtitle">${structure.subtitle}</p>`;
    }
    html += `</div>`;

    html += `<div class="rb-split__equation">`;

    html += `<div class="rb-split__column">`;
    html += `<div class="rb-split__column-header rb-split__column-header--trigger">${escapeHtml(triggerLabel)}</div>`;
    html += `<div class="rb-split__column-body rb-split__column-body--trigger">`;
    triggers.forEach((p) => {
        html += renderProduct(p, false);
    });
    html += `</div></div>`;

    html += `<div class="rb-split__connector"><span>+</span></div>`;

    html += `<div class="rb-split__column">`;
    html += `<div class="rb-split__column-header rb-split__column-header--reward">${escapeHtml(rewardLabel)}</div>`;
    html += `<div class="rb-split__column-body rb-split__column-body--reward">`;
    rewards.forEach((p) => {
        html += renderProduct(p, true);
    });
    html += `</div></div>`;

    html += `</div>`;

    const totalOriginal = [...triggers, ...rewards].reduce(
        (sum, p) => sum + p.price,
        0,
    );
    const totalDiscounted =
        triggers.reduce((sum, p) => sum + p.price, 0) +
        rewards.reduce(
            (sum, p) => sum + calculateBxgyRewardPrice(p.price, structure),
            0,
        );
    const savings = totalOriginal - totalDiscounted;

    if (savings > 0 && ctx.showSavings) {
        html += `
            <div class="rb-split__summary">
                <div class="rb-split__summary-col">
                    <span class="rb-split__summary-label rb-split__summary-pay">${escapeHtml(youPayLabel)}</span>
                    <span class="rb-split__summary-value">${formatMoney(totalDiscounted)}</span>
                </div>
                <div class="rb-split__summary-col rb-split__summary-col--right">
                    <span class="rb-split__summary-label rb-split__summary-save">${escapeHtml(youSaveLabel)}</span>
                    <span class="rb-split__summary-value rb-split__summary-value--savings">${formatMoney(savings)}</span>
                </div>
            </div>
        `;
    }

    html += `</div>`;

    const actionsEl = container.querySelector(".radius-bundle__actions");
    container.innerHTML = html;
    hideStandardHeader(ctx.container);
    hideStandardPricing(ctx.container);

    const splitContainer = container.querySelector(".rb-split__container");
    if (actionsEl && splitContainer) {
        splitContainer.appendChild(actionsEl);
    }
    enableCartButton(ctx.container);
}
