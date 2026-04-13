import {
    escapeHtml,
    extractNumericId,
    formatMoney,
    getLocalePath,
    responsiveImg,
    showToast,
    trimMoney,
} from "./utils";
import { handleCartRedirect, updateCartCount } from "./cart";
import { enqueueCartAttributeWrite } from "./cart-attributes";
import type { BundleStructure, VolumeTier, VolumeTiersConfig } from "./types";

/** Parse volumeTiers from bundleStructure (stored as JSON in the metafield) */
export function parseVolumeTiers(bundleStructure: BundleStructure): VolumeTiersConfig | null {
    const raw = bundleStructure.volumeTiers;
    if (!raw) return null;
    try {
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (!parsed?.tiers?.length) return null;
        return parsed as VolumeTiersConfig;
    } catch {
        return null;
    }
}

function calcDiscountedPricePerUnit(
    unitPriceCents: number,
    tier: VolumeTier,
    discountType: VolumeTiersConfig["discountType"],
): number {
    switch (discountType) {
        case "PERCENTAGE":
            return Math.round(unitPriceCents * (1 - tier.discount / 100));
        case "FIXED_AMOUNT":
            return Math.max(0, Math.round(unitPriceCents - tier.discount * 100));
        case "CUSTOM_PRICE":
            return Math.round(tier.discount * 100);
        default:
            return unitPriceCents;
    }
}

function calcSavingsDisplay(
    unitPriceCents: number,
    tier: VolumeTier,
    discountType: VolumeTiersConfig["discountType"],
): string {
    switch (discountType) {
        case "PERCENTAGE":
            return `Save ${Math.round(tier.discount)}%`;
        case "FIXED_AMOUNT":
            return `Save ${trimMoney(formatMoney(tier.discount * 100))} off`;
        case "CUSTOM_PRICE": {
            const saving = unitPriceCents - tier.discount * 100;
            return saving > 0 ? `Save ${trimMoney(formatMoney(saving))}` : "";
        }
        default:
            return "";
    }
}

/** Resolve {quantity} and {discount} placeholders in tier title/subtitle */
function resolvePlaceholders(
    text: string,
    tier: VolumeTier,
    discountType: VolumeTiersConfig["discountType"],
): string {
    let discountStr: string;
    switch (discountType) {
        case "PERCENTAGE":
            discountStr = `${tier.discount}%`;
            break;
        case "FIXED_AMOUNT":
            discountStr = trimMoney(formatMoney(tier.discount * 100));
            break;
        default:
            discountStr = String(tier.discount);
    }
    return text
        .replace(/\{quantity\}/g, String(tier.minQuantity))
        .replace(/\{discount\}/g, discountStr);
}

function badgeClass(style?: string): string {
    switch (style) {
        case "popular":
            return "rb-vol__tier-badge--popular";
        case "best-value":
            return "rb-vol__tier-badge--best-value";
        case "new":
            return "rb-vol__tier-badge--new";
        default:
            return "rb-vol__tier-badge--default";
    }
}

function renderTierRow(
    tier: VolumeTier,
    index: number,
    config: VolumeTiersConfig,
    unitPriceCents: number,
    showPrices: boolean,
    showComparePrices: boolean,
    showSavings: boolean,
): string {
    const isDefault = !!tier.isDefault;
    const isLast = index === config.tiers.length - 1;
    const qtyLabel = config.openEnded || !isLast
        ? `${tier.minQuantity}+`
        : `${tier.minQuantity}`;

    const discountedCents = calcDiscountedPricePerUnit(unitPriceCents, tier, config.discountType);
    const hasDiscount = config.discountType !== "NO_DISCOUNT" && tier.discount > 0;
    const savingsText = showSavings && hasDiscount
        ? calcSavingsDisplay(unitPriceCents, tier, config.discountType)
        : "";

    const badgeHtml = tier.badge?.text
        ? `<span class="rb-vol__tier-badge ${badgeClass(tier.badge.style)}">${escapeHtml(tier.badge.text)}</span>`
        : "";

    // Title: fall back to "Buy X Units"
    const resolvedTitle = tier.title
        ? escapeHtml(resolvePlaceholders(tier.title, tier, config.discountType))
        : `Buy ${escapeHtml(qtyLabel)} Units`;

    // Savings line below title (green)
    const savingsLineHtml = savingsText
        ? `<span class="rb-vol__tier-savings-line">${escapeHtml(savingsText)}</span>`
        : "";

    // Right-side pricing
    const priceColHtml = showPrices && unitPriceCents > 0
        ? `<div class="rb-vol__tier-pricing">
                <span class="rb-vol__tier-price">${trimMoney(formatMoney(discountedCents))}</span>
                ${hasDiscount && showComparePrices ? `<span class="rb-vol__tier-original">${trimMoney(formatMoney(unitPriceCents))}</span>` : ""}
            </div>`
        : "";

    return `
        <li class="rb-vol__tier${isDefault ? " rb-vol__tier--default" : ""}"
            data-tier-index="${index}"
            data-tier-qty="${tier.minQuantity}"
            role="button"
            tabindex="0"
            aria-pressed="${isDefault ? "true" : "false"}"
            aria-label="${resolvedTitle}">
            <div class="rb-vol__tier-radio" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <div class="rb-vol__tier-info">
                <div class="rb-vol__tier-title-row">
                    <span class="rb-vol__tier-title">${resolvedTitle}</span>
                    ${badgeHtml}
                </div>
                ${tier.subtitle ? `<span class="rb-vol__tier-subtitle">${escapeHtml(resolvePlaceholders(tier.subtitle, tier, config.discountType))}</span>` : ""}
                ${savingsLineHtml}
            </div>
            ${priceColHtml}
        </li>
    `;
}

/** Render the full volume tier list into the products container */
export function renderVolumeTable(
    container: Element,
    config: VolumeTiersConfig,
    bundleStructure: BundleStructure,
    productImageSrc: string | null,
    productTitle: string,
    unitPriceCents: number,
    showImages: boolean,
    showPrices: boolean,
    showComparePrices: boolean,
    showSavings: boolean,
    lazyLoadImages: boolean,
): void {
    const imageHtml =
        showImages && productImageSrc
            ? `<div class="rb-vol__product-image">${responsiveImg(productImageSrc, productTitle, { lazy: lazyLoadImages, size: "thumb" })}</div>`
            : "";

    const tiersHtml = config.tiers
        .map((tier, i) =>
            renderTierRow(tier, i, config, unitPriceCents, showPrices, showComparePrices, showSavings),
        )
        .join("");

    const productInfoHtml = `
        <div class="rb-vol__product-header">
            ${imageHtml}
            <div class="rb-vol__product-meta">
                <span class="rb-vol__product-title">${escapeHtml(productTitle)}</span>
                ${showPrices && unitPriceCents > 0 ? `<span class="rb-vol__product-base-price">${trimMoney(formatMoney(unitPriceCents))} / ${escapeHtml(bundleStructure.labels?.volumeUnitLabel || "unit")}</span>` : ""}
            </div>
        </div>
    `;

    container.innerHTML = `
        <div class="rb-vol__wrap">
            ${productInfoHtml}
            <ul class="rb-vol__tiers" role="list" aria-label="Volume discount tiers">
                ${tiersHtml}
            </ul>
        </div>
    `;
}

function renderPricingCard(
    tier: VolumeTier,
    index: number,
    config: VolumeTiersConfig,
    unitPriceCents: number,
    showPrices: boolean,
    showSavings: boolean,
): string {
    const isDefault = !!tier.isDefault;
    const isLast = index === config.tiers.length - 1;
    const qtyLabel = config.openEnded || !isLast
        ? `${tier.minQuantity}+`
        : `${tier.minQuantity}`;

    const discountedCents = calcDiscountedPricePerUnit(unitPriceCents, tier, config.discountType);
    const hasDiscount = config.discountType !== "NO_DISCOUNT" && tier.discount > 0;
    const savingsText = showSavings && hasDiscount
        ? calcSavingsDisplay(unitPriceCents, tier, config.discountType)
        : "";

    const resolvedTitle = tier.title
        ? escapeHtml(resolvePlaceholders(tier.title, tier, config.discountType))
        : (index === 0 ? "Standard" : index === 1 ? "Value Pack" : index === 2 ? "Bulk Deal" : `Tier ${index + 1}`);

    const badgeText = tier.badge?.text;
    const badgeHtml = badgeText
        ? `<div class="rb-vol__card-popular-badge ${badgeClass(tier.badge?.style)}" aria-hidden="true">${escapeHtml(badgeText).toUpperCase()}</div>`
        : "";

    const subtitleText = tier.subtitle
        ? escapeHtml(resolvePlaceholders(tier.subtitle, tier, config.discountType))
        : `Buy ${escapeHtml(qtyLabel)} Units`;
    const subtitleHtml = `<div class="rb-vol__card-subtitle">${subtitleText}</div>`;

    const priceHtml = showPrices && unitPriceCents > 0
        ? `<div class="rb-vol__card-price">${trimMoney(formatMoney(discountedCents))}</div>`
        : "";

    const savingsPillHtml = savingsText
        ? `<div class="rb-vol__card-savings">${escapeHtml(savingsText).toUpperCase()}</div>`
        : "";

    const btnLabel = "Select";
    const savingsPart = savingsText ? `, ${savingsText}` : "";
    const badgePart = badgeText ? `, ${badgeText}` : "";

    return `
        <li class="rb-vol__tier rb-vol__card${isDefault ? " rb-vol__tier--default" : ""}${badgeText ? " rb-vol__card--popular" : ""}"
            data-tier-index="${index}"
            data-tier-qty="${tier.minQuantity}"
            role="button"
            tabindex="0"
            aria-pressed="${isDefault ? "true" : "false"}"
            aria-label="${resolvedTitle}, Buy ${escapeHtml(qtyLabel)} units${escapeHtml(savingsPart)}${escapeHtml(badgePart)}">
            ${badgeHtml}
            <div class="rb-vol__card-title">${resolvedTitle}</div>
            ${subtitleHtml}
            ${priceHtml}
            ${savingsPillHtml}
            <button class="rb-vol__card-select-btn" tabindex="-1" aria-hidden="true">${btnLabel}</button>
        </li>
    `;
}

/** Render the pricing cards layout into the products container */
export function renderVolumePricingCards(
    container: Element,
    config: VolumeTiersConfig,
    bundleStructure: BundleStructure,
    productImageSrc: string | null,
    productTitle: string,
    unitPriceCents: number,
    showImages: boolean,
    showPrices: boolean,
    showSavings: boolean,
    lazyLoadImages: boolean,
): void {
    const imageHtml =
        showImages && productImageSrc
            ? `<div class="rb-vol__product-image">${responsiveImg(productImageSrc, productTitle, { lazy: lazyLoadImages, size: "thumb" })}</div>`
            : "";

    const cardsHtml = config.tiers
        .map((tier, i) =>
            renderPricingCard(tier, i, config, unitPriceCents, showPrices, showSavings),
        )
        .join("");

    const productInfoHtml = `
        <div class="rb-vol__product-header">
            ${imageHtml}
            <div class="rb-vol__product-meta">
                <span class="rb-vol__product-title">${escapeHtml(productTitle)}</span>
                ${showPrices && unitPriceCents > 0 ? `<span class="rb-vol__product-base-price">${trimMoney(formatMoney(unitPriceCents))} / ${escapeHtml(bundleStructure.labels?.volumeUnitLabel || "unit")}</span>` : ""}
            </div>
        </div>
    `;

    container.innerHTML = `
        <div class="rb-vol__wrap">
            ${productInfoHtml}
            <ul class="rb-vol__cards-grid" role="list" aria-label="Volume discount tiers">
                ${cardsHtml}
            </ul>
        </div>
    `;
}

// ── Volume Slider Layout ─────────────────────────────────────────────────────

/** Compute slider max: openEnded → lastMin×1.5 capped at 100, else lastMin */
function sliderMax(config: VolumeTiersConfig): number {
    const lastMin = config.tiers[config.tiers.length - 1].minQuantity;
    if (config.openEnded) return Math.min(100, Math.round(lastMin * 1.5));
    return lastMin;
}

/** Find the highest tier where qty >= minQuantity; null if below all tiers */
function activeTierForQty(qty: number, config: VolumeTiersConfig): VolumeTier | null {
    let best: VolumeTier | null = null;
    for (const t of config.tiers) {
        if (qty >= t.minQuantity) best = t;
    }
    return best;
}

/** Next tier above current qty; null if at/above last tier */
function nextTierForQty(qty: number, config: VolumeTiersConfig): VolumeTier | null {
    for (const t of config.tiers) {
        if (qty < t.minQuantity) return t;
    }
    return null;
}

/** Percent savings string for a tier, e.g. "Save 8%" */
function tierSavingsBadgeText(tier: VolumeTier, config: VolumeTiersConfig): string {
    switch (config.discountType) {
        case "PERCENTAGE":
            return `Save ${Math.round(tier.discount)}%`;
        case "FIXED_AMOUNT":
            return `Save ${trimMoney(formatMoney(tier.discount * 100))}`;
        case "CUSTOM_PRICE":
            return `Special price`;
        default:
            return "";
    }
}

/** Nudge text: "Add X more to save Y%!" */
function nudgeText(qty: number, next: VolumeTier, config: VolumeTiersConfig): string {
    const more = next.minQuantity - qty;
    let savingStr = "";
    switch (config.discountType) {
        case "PERCENTAGE":
            savingStr = `${Math.round(next.discount)}%`;
            break;
        case "FIXED_AMOUNT":
            savingStr = `${trimMoney(formatMoney(next.discount * 100))}`;
            break;
        case "CUSTOM_PRICE":
            savingStr = `a special price`;
            break;
    }
    return `Add ${more} more to save ${savingStr}!`;
}

/** Render the full slider layout into the products container */
export function renderVolumeSlider(
    container: Element,
    config: VolumeTiersConfig,
    showImages: boolean,
    productImageSrc: string | null,
    productTitle: string,
    unitPriceCents: number,
    showPrices: boolean,
    showSavings: boolean,
    showComparePrices: boolean,
    showQuantity: boolean,
    lazyLoadImages: boolean,
    selectQuantityLabel?: string,
    youSaveLabel?: string,
    unitLabel?: string,
    unitsLabel?: string,
): void {
    const u = unitLabel || "unit";
    const us = unitsLabel || "units";
    const max = sliderMax(config);
    const firstTier = config.tiers[0];
    const initQty = firstTier.minQuantity;

    // Initial active tier for rendering
    const initTier = activeTierForQty(initQty, config);
    const initDiscounted = initTier
        ? calcDiscountedPricePerUnit(unitPriceCents, initTier, config.discountType)
        : unitPriceCents;
    const initTotal = initDiscounted * initQty;
    const initOrigTotal = unitPriceCents * initQty;
    const initSavingsAmt = initOrigTotal - initTotal;
    const hasSavings = initTier !== null && initSavingsAmt > 0;

    // Tier markers: position as percent of slider range
    const markerHtml = config.tiers
        .map((t) => {
            const pct = max > 1 ? ((t.minQuantity - 1) / (max - 1)) * 100 : 0;
            return `<span class="rb-vol-slider__marker" style="left:${pct.toFixed(2)}%" aria-hidden="true" data-marker-qty="${t.minQuantity}"></span>`;
        })
        .join("");

    const imageHtml = showImages && productImageSrc
        ? `<div class="rb-vol-slider__hero-image">
            ${responsiveImg(productImageSrc, productTitle, { lazy: lazyLoadImages, size: "hero" })}
            <div class="rb-vol-slider__savings-badge"${hasSavings ? "" : ' style="display:none"'}>${hasSavings && initTier ? escapeHtml(tierSavingsBadgeText(initTier, config)) : ""}</div>
        </div>`
        : "";

    const priceSavingsHtml = showSavings
        ? `<div class="rb-vol-slider__price-savings"${hasSavings ? "" : ' style="display:none"'}>
            <span class="rb-vol-slider__price-savings-amount" style="color:var(--rb-savings-color,#16a34a)">-${escapeHtml(trimMoney(formatMoney(initSavingsAmt)))}</span>
            <span class="rb-vol-slider__price-savings-label">${escapeHtml(youSaveLabel || "You save")}</span>
        </div>`
        : "";

    const priceBoxHtml = unitPriceCents > 0
        ? `<div class="rb-vol-slider__price-box">
            <div class="rb-vol-slider__price-left">
                ${showPrices ? `<span class="rb-vol-slider__price-total">${escapeHtml(trimMoney(formatMoney(initTotal)))}</span>
                <span class="rb-vol-slider__price-unit">${escapeHtml(trimMoney(formatMoney(initDiscounted)))} / ${escapeHtml(u)}</span>` : ""}
                ${hasSavings && showComparePrices ? `<span class="rb-vol-slider__price-original">${escapeHtml(trimMoney(formatMoney(initOrigTotal)))}</span>` : ""}
            </div>
            ${priceSavingsHtml}
        </div>`
        : "";

    // Nudge banner
    const nextTier = nextTierForQty(initQty, config);
    const nudgeVisible = nextTier !== null;
    const nudgeMsg = nextTier ? escapeHtml(nudgeText(initQty, nextTier, config)) : "";
    const nudgePct = nextTier
        ? Math.round(((initQty - (config.tiers[config.tiers.indexOf(nextTier) - 1]?.minQuantity ?? 1)) /
            (nextTier.minQuantity - (config.tiers[config.tiers.indexOf(nextTier) - 1]?.minQuantity ?? 1))) * 100)
        : 0;

    const nudgeHtml = `<div class="rb-vol-slider__nudge"${nudgeVisible ? "" : ' style="display:none"'}>
        <div class="rb-vol-slider__nudge-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
            <span class="rb-vol-slider__nudge-text">${nudgeMsg}</span>
        </div>
        <div class="rb-vol-slider__nudge-bar">
            <div class="rb-vol-slider__nudge-fill" style="width:${Math.min(100, nudgePct)}%"></div>
        </div>
    </div>`;

    const sliderQuantityHtml = showQuantity ? `<div class="rb-vol-slider__slider-section">
        <div class="rb-vol-slider__slider-header">
            <span class="rb-vol-slider__qty-label">${escapeHtml(selectQuantityLabel || "Select Quantity")}</span>
            <span class="rb-vol-slider__qty-counter" style="color:var(--rb-primary-color,#303030)">${initQty} ${escapeHtml(us)}</span>
        </div>
        <input
            class="rb-vol-slider__slider-track"
            type="range"
            min="1"
            max="${max}"
            value="${initQty}"
            step="1"
            aria-label="Select quantity"
            aria-valuemin="1"
            aria-valuemax="${max}"
            aria-valuenow="${initQty}"
        />
        <div class="rb-vol-slider__slider-markers" aria-hidden="true">
            ${markerHtml}
        </div>
    </div>`: "";

    container.innerHTML = `
        <div class="rb-vol-slider__wrap">
            ${imageHtml}
            <div class="rb-vol-slider__product-title">${escapeHtml(productTitle)}</div>
            ${priceBoxHtml}
            ${sliderQuantityHtml}
            ${nudgeHtml}
        </div>
    `;
}

/** Wire slider interaction for volume slider layout */
export function initVolumeSlider(
    widgetContainer: HTMLElement,
    config: VolumeTiersConfig,
    bundleStructure: BundleStructure,
    variantId: string,
    unitPriceCents: number,
    redirectAfterCart: string,
    enableAnalytics: boolean,
    maxBundlesPerOrder: number,
): void {
    // Hide the Liquid qty selector — slider replaces it
    const qtySelector = widgetContainer.querySelector<HTMLElement>(
        ".rb-vol__action-bar .rb-vol__qty-selector",
    );
    if (qtySelector) qtySelector.style.display = "none";

    const maybeSlider = widgetContainer.querySelector<HTMLInputElement>(".rb-vol-slider__slider-track");
    const atcBtn = widgetContainer.querySelector<HTMLButtonElement>("[data-bundle-add-to-cart]");
    if (!maybeSlider || !atcBtn) return;
    const sliderEl = maybeSlider;

    const btnTextEl = atcBtn.querySelector<HTMLElement>("[data-button-text]");
    const liveRegion = widgetContainer.querySelector<HTMLElement>("[data-vol-slider-live]");
    let previousTierIndex = -1;

    // DOM element refs (queried fresh each update)
    function el<T extends HTMLElement>(sel: string): T | null {
        return widgetContainer.querySelector<T>(sel);
    }

    function updateAll(qty: number): void {
        sliderEl.setAttribute("aria-valuenow", String(qty));

        // Update counter
        const counter = el(".rb-vol-slider__qty-counter");
        if (counter) counter.textContent = `${qty} ${bundleStructure.labels?.volumeUnitsLabel || "units"}`;

        // Update ATC button text
        if (btnTextEl) {
            const base = bundleStructure.labels?.addToCartText || "Add to Cart";
            btnTextEl.textContent = `${base} (${qty})`;
        }

        if (unitPriceCents <= 0) return;

        const tier = activeTierForQty(qty, config);
        const currentTierIndex = tier ? config.tiers.indexOf(tier) : -1;
        if (liveRegion && currentTierIndex !== previousTierIndex) {
            previousTierIndex = currentTierIndex;
            if (tier) {
                liveRegion.textContent = tierSavingsBadgeText(tier, config);
            } else {
                liveRegion.textContent = "";
            }
        }

        const discounted = tier
            ? calcDiscountedPricePerUnit(unitPriceCents, tier, config.discountType)
            : unitPriceCents;
        const total = discounted * qty;
        const origTotal = unitPriceCents * qty;
        const savingsAmt = origTotal - total;
        const hasSavings = tier !== null && savingsAmt > 0;

        // Price total
        const priceTotal = el(".rb-vol-slider__price-total");
        if (priceTotal) priceTotal.textContent = trimMoney(formatMoney(total));

        // Per unit
        const priceUnit = el(".rb-vol-slider__price-unit");
        if (priceUnit) priceUnit.textContent = `${trimMoney(formatMoney(discounted))} / ${bundleStructure.labels?.volumeUnitLabel || "unit"}`;

        // Original total (strikethrough)
        const priceOrig = el<HTMLElement>(".rb-vol-slider__price-original");
        if (priceOrig) {
            if (hasSavings) {
                priceOrig.textContent = trimMoney(formatMoney(origTotal));
                priceOrig.style.display = "";
            } else {
                priceOrig.style.display = "none";
            }
        }

        // Savings box (right side)
        const savingsBox = el<HTMLElement>(".rb-vol-slider__price-savings");
        if (savingsBox) {
            if (hasSavings) {
                savingsBox.style.display = "";
                const savingsAmt2 = el(".rb-vol-slider__price-savings-amount");
                if (savingsAmt2) savingsAmt2.textContent = `-${trimMoney(formatMoney(savingsAmt))}`;
            } else {
                savingsBox.style.display = "none";
            }
        }

        // Savings badge on image
        const badge = el<HTMLElement>(".rb-vol-slider__savings-badge");
        if (badge) {
            if (hasSavings && tier) {
                badge.textContent = tierSavingsBadgeText(tier, config);
                badge.style.display = "";
            } else {
                badge.style.display = "none";
            }
        }

        // Nudge banner
        const nextTier = nextTierForQty(qty, config);
        const nudge = el<HTMLElement>(".rb-vol-slider__nudge");
        if (nudge) {
            if (nextTier) {
                nudge.style.display = "";
                const nudgeText2 = el(".rb-vol-slider__nudge-text");
                if (nudgeText2) nudgeText2.textContent = nudgeText(qty, nextTier, config);

                // Progress within bracket
                const tierIdx = config.tiers.indexOf(nextTier);
                const prevMin = tierIdx > 0 ? config.tiers[tierIdx - 1].minQuantity : 1;
                const pct = Math.min(100, Math.round(((qty - prevMin) / (nextTier.minQuantity - prevMin)) * 100));
                const fill = el<HTMLElement>(".rb-vol-slider__nudge-fill");
                if (fill) fill.style.width = `${pct}%`;
            } else {
                // At or above last tier — show "max discount" message
                nudge.style.display = "";
                const nudgeText2 = el(".rb-vol-slider__nudge-text");
                if (nudgeText2) nudgeText2.textContent = "Maximum discount applied!";
                const fill = el<HTMLElement>(".rb-vol-slider__nudge-fill");
                if (fill) fill.style.width = "100%";
            }
        }

        // Slider track fill (CSS custom property)
        const pct = sliderEl.max === sliderEl.min
            ? 100
            : Math.round(((qty - 1) / (parseInt(sliderEl.max, 10) - 1)) * 100);
        sliderEl.style.setProperty("--rb-slider-fill-pct", `${pct}%`);
    }

    // Initial fill
    updateAll(parseInt(sliderEl.value, 10) || 1);

    // Slider input event
    sliderEl.addEventListener("input", () => {
        const qty = parseInt(sliderEl.value, 10) || 1;
        updateAll(qty);
    });

    // ATC button — guard with data-volume-bound
    if (atcBtn.dataset.volumeBound === "true") return;
    atcBtn.dataset.volumeBound = "true";
    atcBtn.disabled = false;

    atcBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const qty = parseInt(sliderEl.value, 10) || 1;
        const tier = activeTierForQty(qty, config);

        const numericVariantId = extractNumericId(variantId);
        if (!numericVariantId) {
            showToast("No product variant available", "error");
            return;
        }

        atcBtn.classList.add("is-loading");
        atcBtn.disabled = true;
        atcBtn.setAttribute("aria-busy", "true");
        const origText = btnTextEl?.textContent || "";
        if (btnTextEl) btnTextEl.textContent = bundleStructure.labels?.addingText ?? "Adding...";

        try {
            const resp = await fetch(getLocalePath("/cart/add.js"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: [
                        {
                            id: parseInt(numericVariantId, 10),
                            quantity: qty,
                            properties: {
                                _bundle_id: bundleStructure.id,
                                _bundle_name: bundleStructure.name,
                            },
                        },
                    ],
                }),
            });

            if (!resp.ok) {
                const errData = await resp.json().catch(() => ({}));
                showToast(errData.description || "Failed to add to cart", "error");
                return;
            }

            await enqueueCartAttributeWrite(bundleStructure.id, {
                bundleId: bundleStructure.id,
                bundleName: bundleStructure.name,
                discountType: tier ? config.discountType : "NO_DISCOUNT",
                discountValue: tier ? tier.discount : 0,
                requiredLineCount: 1,
                minOrderValue: bundleStructure.minOrderValue || 0,
                maxDiscountAmount: bundleStructure.maxDiscountAmount || 0,
                discountApplication: bundleStructure.discountApplication || "bundle",
                discountedProductIds: bundleStructure.discountedProductIds || [],
                freeShipping: bundleStructure.freeShipping || false,
            });

            if (enableAnalytics && tier) {
                const discountedCents = calcDiscountedPricePerUnit(
                    unitPriceCents,
                    tier,
                    config.discountType,
                );
                const totalValue = unitPriceCents * qty;
                const discountValue = totalValue - discountedCents * qty;
                widgetContainer.dispatchEvent(
                    new CustomEvent("bundle:addedToCart", {
                        detail: {
                            bundleId: bundleStructure.id,
                            productIds: [numericVariantId],
                            totalValue,
                            discountValue,
                        },
                        bubbles: true,
                    }),
                );
            }

            showToast("Added to cart!", "success");
            await updateCartCount();
            handleCartRedirect(redirectAfterCart, null, true);
        } catch (err) {
            console.error("[RadiusBundle] Volume Slider ATC error:", err);
            showToast("Failed to add to cart", "error");
        } finally {
            atcBtn.classList.remove("is-loading");
            atcBtn.setAttribute("aria-busy", "false");
            if (btnTextEl) btnTextEl.textContent = bundleStructure.labels?.addedText ?? "Added!";
            atcBtn.classList.add("is-added");
            setTimeout(() => {
                if (btnTextEl) btnTextEl.textContent = origText;
                atcBtn.classList.remove("is-added");
                atcBtn.disabled = false;
            }, 1500);
        }
    });
}

// ── Volume Calculator Layout ──────────────────────────────────────────────────

/** Render the savings-calculator layout into the products container */
export function renderVolumeCalculator(
    container: Element,
    config: VolumeTiersConfig,
    productImageSrc: string | null,
    productTitle: string,
    unitPriceCents: number,
    showImages: boolean,
    showPrices: boolean,
    showSavings: boolean,
    showComparePrices: boolean,
    showQuantity: boolean,
    lazyLoadImages: boolean,
    selectQuantityLabel?: string,
    youSaveLabel?: string,
    totalCostLabel?: string,
    costPerUnitLabel?: string,
    regularPriceLabel?: string,
): void {
    const imageHtml = showImages && productImageSrc
        ? `<div class="rb-vol-calc__hero-image">
            ${responsiveImg(productImageSrc, productTitle, { lazy: lazyLoadImages, size: "hero" })}
          </div>`
        : "";

    // Build tier pills — one per tier with discount label
    const pillsHtml = config.tiers
        .map((t, i) => {
            let label: string;
            switch (config.discountType) {
                case "PERCENTAGE":
                    label = `${t.minQuantity}+ (-${Math.round(t.discount)}%)`;
                    break;
                case "FIXED_AMOUNT":
                    label = `${t.minQuantity}+ (-${trimMoney(formatMoney(t.discount * 100))})`;
                    break;
                default:
                    label = `${t.minQuantity}+`;
            }
            return `<button
                class="rb-vol-calc__pill"
                type="button"
                data-calc-tier-index="${i}"
                data-calc-tier-qty="${t.minQuantity}"
                aria-pressed="false"
                aria-label="${escapeHtml(label)}"
            >${escapeHtml(label)}</button>`;
        })
        .join("");

    // Initial values — no tier active (qty=1, below first tier unless firstTier.min=1)
    const initQty = 1;
    const initTier = activeTierForQty(initQty, config);
    const initDiscounted = initTier
        ? calcDiscountedPricePerUnit(unitPriceCents, initTier, config.discountType)
        : unitPriceCents;
    const initTotal = initDiscounted * initQty;
    const initOrigTotal = unitPriceCents * initQty;
    const initSavings = initOrigTotal - initTotal;
    const initHasSavings = initTier !== null && initSavings > 0;

    const calcQuantityHtml = showQuantity ? `<div class="rb-vol-calc__qty-section">
        <label class="rb-vol-calc__qty-label" for="rb-calc-qty-input">${escapeHtml(selectQuantityLabel || "Select Quantity")}</label>
        <div class="rb-vol-calc__qty-wrap">
            <button class="rb-vol-calc__qty-btn" type="button" data-calc-qty-dec aria-label="Decrease quantity">−</button>
            <input
                class="rb-vol-calc__qty-input"
                id="rb-calc-qty-input"
                type="number"
                min="1"
                value="${initQty}"
                step="1"
            />
            <button class="rb-vol-calc__qty-btn" type="button" data-calc-qty-inc aria-label="Increase quantity">+</button>
        </div>
    </div>` : "";

    const calcRows = unitPriceCents > 0
        ? `${showPrices ? `<div class="rb-vol-calc__calc-row" data-calc-total>
                <span class="rb-vol-calc__calc-label">${escapeHtml(totalCostLabel || "Total Cost")}</span>
                <div class="rb-vol-calc__calc-value-wrap">
                    <span class="rb-vol-calc__calc-value" style="color:var(--rb-primary-color,#303030)">${escapeHtml(trimMoney(formatMoney(initTotal)))}</span>
                </div>
            </div>` : ""}
            ${showSavings ? `<div class="rb-vol-calc__calc-row rb-vol-calc__calc-row--savings"${initHasSavings ? "" : ' style="display:none"'}>
                <span class="rb-vol-calc__calc-label">${escapeHtml(youSaveLabel || "You Save")}</span>
                <div class="rb-vol-calc__calc-value-wrap">
                    <span class="rb-vol-calc__calc-value" style="color:var(--rb-savings-color,#16a34a)">${escapeHtml(trimMoney(formatMoney(initSavings)))}</span>
                    <span class="rb-vol-calc__calc-sub"><s>${escapeHtml(trimMoney(formatMoney(initOrigTotal)))}</s></span>
                </div>
            </div>` : ""}
            ${showComparePrices ? `<div class="rb-vol-calc__calc-row" data-calc-cpu${initHasSavings ? "" : ' style="display:none"'}>
                <span class="rb-vol-calc__calc-label">${escapeHtml(costPerUnitLabel || "Cost Per Unit")}</span>
                <div class="rb-vol-calc__calc-value-wrap">
                    <span class="rb-vol-calc__calc-value">${escapeHtml(trimMoney(formatMoney(initDiscounted)))}</span>
                    <span class="rb-vol-calc__calc-sub">${escapeHtml(regularPriceLabel || "Regular price dd")} <s>${escapeHtml(trimMoney(formatMoney(unitPriceCents)))}</s></span>
                </div>
            </div>` : ""}`
        : "";

    container.innerHTML = `
        <div class="rb-vol-calc__wrap">
            ${imageHtml}
            <div class="rb-vol-calc__product-title">${escapeHtml(productTitle)}</div>
            ${calcQuantityHtml}
            ${calcRows}
            <div class="rb-vol-calc__pills" role="group" aria-label="Quantity discount tiers">
                ${pillsHtml}
            </div>
        </div>
    `;
}

/** Wire calculator interactions: qty input ↔ tier pills ↔ calc rows */
export function initVolumeCalculator(
    widgetContainer: HTMLElement,
    config: VolumeTiersConfig,
    bundleStructure: BundleStructure,
    variantId: string,
    unitPriceCents: number,
    redirectAfterCart: string,
    enableAnalytics: boolean,
    maxBundlesPerOrder: number,
): void {
    // Hide the Liquid qty selector — calculator replaces it
    const qtySelector = widgetContainer.querySelector<HTMLElement>(
        ".rb-vol__action-bar .rb-vol__qty-selector",
    );
    if (qtySelector) qtySelector.style.display = "none";

    const qtyInput = widgetContainer.querySelector<HTMLInputElement>(".rb-vol-calc__qty-input");
    const atcBtn = widgetContainer.querySelector<HTMLButtonElement>("[data-bundle-add-to-cart]");
    if (!qtyInput || !atcBtn) return;

    const btnTextEl = atcBtn.querySelector<HTMLElement>("[data-button-text]");

    function el<T extends HTMLElement>(sel: string): T | null {
        return widgetContainer.querySelector<T>(sel);
    }

    function getPills(): NodeListOf<HTMLElement> {
        return widgetContainer.querySelectorAll<HTMLElement>(".rb-vol-calc__pill");
    }

    /** Activate a pill by index; -1 = first (no-discount) pill */
    function setActivePill(activeIndex: number): void {
        getPills().forEach((p, i) => {
            const isActive = i === activeIndex;
            p.classList.toggle("rb-vol-calc__pill--active", isActive);
            p.setAttribute("aria-pressed", isActive ? "true" : "false");
        });
    }

    /** Find pill index matching a qty — -1 = no tier active */
    function pillIndexForQty(qty: number): number {
        const tier = activeTierForQty(qty, config);
        if (!tier) return -1;
        return config.tiers.indexOf(tier);
    }

    function updateCalc(qty: number): void {
        const clampedQty = Math.max(1, qty);

        // Update ATC button text
        if (btnTextEl) {
            const base = bundleStructure.labels?.addToCartText || "Add to Cart";
            btnTextEl.textContent = `${base} (${clampedQty})`;
        }

        if (unitPriceCents <= 0) return;

        const tier = activeTierForQty(clampedQty, config);
        const discounted = tier
            ? calcDiscountedPricePerUnit(unitPriceCents, tier, config.discountType)
            : unitPriceCents;
        const total = discounted * clampedQty;
        const origTotal = unitPriceCents * clampedQty;
        const savings = origTotal - total;
        const hasSavings = tier !== null && savings > 0;

        const totalEl = el("[data-calc-total] .rb-vol-calc__calc-value");
        if (totalEl) totalEl.textContent = trimMoney(formatMoney(total));

        const savingsRow = el<HTMLElement>(".rb-vol-calc__calc-row--savings");
        const cpuRow = el<HTMLElement>("[data-calc-cpu]");

        if (savingsRow) {
            savingsRow.style.display = hasSavings ? "" : "none";
            if (hasSavings) {
                const savingsVal = savingsRow.querySelector(".rb-vol-calc__calc-value");
                if (savingsVal) savingsVal.textContent = trimMoney(formatMoney(savings));
                const savingsSub = savingsRow.querySelector(".rb-vol-calc__calc-sub");
                if (savingsSub) savingsSub.innerHTML = `<s>${escapeHtml(trimMoney(formatMoney(origTotal)))}</s>`;
            }
        }

        if (cpuRow) {
            cpuRow.style.display = hasSavings ? "" : "none";
            if (hasSavings) {
                const cpuVal = cpuRow.querySelector(".rb-vol-calc__calc-value");
                if (cpuVal) cpuVal.textContent = trimMoney(formatMoney(discounted));
                const cpuSub = cpuRow.querySelector(".rb-vol-calc__calc-sub");
                if (cpuSub) cpuSub.innerHTML = `${escapeHtml(bundleStructure.labels?.volumeRegularPriceLabel || "Regular price")} <s>${escapeHtml(trimMoney(formatMoney(unitPriceCents)))}</s>`;
            }
        }

        // Sync pill
        setActivePill(pillIndexForQty(clampedQty));
    }

    // Initial update
    updateCalc(parseInt(qtyInput.value, 10) || 1);

    // Qty input change
    qtyInput.addEventListener("input", () => {
        const qty = parseInt(qtyInput.value, 10) || 1;
        updateCalc(qty);
    });

    // Pill clicks — each pill maps to a tier
    getPills().forEach((pill, i) => {
        pill.addEventListener("click", () => {
            const targetQty = config.tiers[i]?.minQuantity ?? 1;
            qtyInput.value = String(targetQty);
            updateCalc(targetQty);
        });
    });

    // +/− buttons
    const decBtn = widgetContainer.querySelector<HTMLButtonElement>("[data-calc-qty-dec]");
    const incBtn = widgetContainer.querySelector<HTMLButtonElement>("[data-calc-qty-inc]");
    if (decBtn) {
        decBtn.addEventListener("click", () => {
            const qty = Math.max(1, (parseInt(qtyInput.value, 10) || 1) - 1);
            qtyInput.value = String(qty);
            updateCalc(qty);
        });
    }
    if (incBtn) {
        incBtn.addEventListener("click", () => {
            const qty = (parseInt(qtyInput.value, 10) || 1) + 1;
            qtyInput.value = String(qty);
            updateCalc(qty);
        });
    }

    // ATC — guard with data-volume-bound
    if (atcBtn.dataset.volumeBound === "true") return;
    atcBtn.dataset.volumeBound = "true";
    atcBtn.disabled = false;

    atcBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);
        const tier = activeTierForQty(qty, config);

        const numericVariantId = extractNumericId(variantId);
        if (!numericVariantId) {
            showToast("No product variant available", "error");
            return;
        }

        atcBtn.classList.add("is-loading");
        atcBtn.disabled = true;
        atcBtn.setAttribute("aria-busy", "true");
        const origText = btnTextEl?.textContent || "";
        if (btnTextEl) btnTextEl.textContent = bundleStructure.labels?.addingText ?? "Adding...";

        try {
            const resp = await fetch(getLocalePath("/cart/add.js"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: [
                        {
                            id: parseInt(numericVariantId, 10),
                            quantity: qty,
                            properties: {
                                _bundle_id: bundleStructure.id,
                                _bundle_name: bundleStructure.name,
                            },
                        },
                    ],
                }),
            });

            if (!resp.ok) {
                const errData = await resp.json().catch(() => ({}));
                showToast(errData.description || "Failed to add to cart", "error");
                return;
            }

            await enqueueCartAttributeWrite(bundleStructure.id, {
                bundleId: bundleStructure.id,
                bundleName: bundleStructure.name,
                discountType: tier ? config.discountType : "NO_DISCOUNT",
                discountValue: tier ? tier.discount : 0,
                requiredLineCount: 1,
                minOrderValue: bundleStructure.minOrderValue || 0,
                maxDiscountAmount: bundleStructure.maxDiscountAmount || 0,
                discountApplication: bundleStructure.discountApplication || "bundle",
                discountedProductIds: bundleStructure.discountedProductIds || [],
                freeShipping: bundleStructure.freeShipping || false,
            });

            if (enableAnalytics && tier) {
                const discountedCents = calcDiscountedPricePerUnit(
                    unitPriceCents,
                    tier,
                    config.discountType,
                );
                const totalValue = unitPriceCents * qty;
                const discountValue = totalValue - discountedCents * qty;
                widgetContainer.dispatchEvent(
                    new CustomEvent("bundle:addedToCart", {
                        detail: {
                            bundleId: bundleStructure.id,
                            productIds: [numericVariantId],
                            totalValue,
                            discountValue,
                        },
                        bubbles: true,
                    }),
                );
            }

            showToast("Added to cart!", "success");
            await updateCartCount();
            handleCartRedirect(redirectAfterCart, null, true);
        } catch (err) {
            console.error("[RadiusBundle] Volume Calculator ATC error:", err);
            showToast("Failed to add to cart", "error");
        } finally {
            atcBtn.classList.remove("is-loading");
            atcBtn.setAttribute("aria-busy", "false");
            if (btnTextEl) btnTextEl.textContent = bundleStructure.labels?.addedText ?? "Added!";
            atcBtn.classList.add("is-added");
            setTimeout(() => {
                if (btnTextEl) btnTextEl.textContent = origText;
                atcBtn.classList.remove("is-added");
                atcBtn.disabled = false;
            }, 1500);
        }
    });
}

/** Wire tier selection + qty selector interaction (two-way binding) */
export function initVolumeTierSelection(
    widgetContainer: HTMLElement,
    config: VolumeTiersConfig,
    bundleStructure: BundleStructure,
    variantId: string,
    unitPriceCents: number,
    redirectAfterCart: string,
    enableAnalytics: boolean,
    maxBundlesPerOrder: number,
): void {
    function getTiers() {
        return widgetContainer.querySelectorAll<HTMLElement>(".rb-vol__tier");
    }
    const tiers = getTiers();
    const atcBtn = widgetContainer.querySelector<HTMLButtonElement>("[data-bundle-add-to-cart]");
    if (!atcBtn) return;
    const btnTextEl = atcBtn.querySelector<HTMLElement>("[data-button-text]");

    // Live references — always query from DOM so we read current state
    function getQtyEl(): HTMLInputElement | null {
        return widgetContainer.querySelector<HTMLInputElement>("[data-vol-qty]");
    }
    function getDecEl(): HTMLButtonElement | null {
        return widgetContainer.querySelector<HTMLButtonElement>("[data-vol-qty-dec]");
    }

    function getQty(): number {
        return parseInt(getQtyEl()?.value || "1", 10) || 1;
    }

    function setQty(n: number): void {
        const el = getQtyEl();
        const clamped = Math.max(1, n);
        if (el) el.value = String(clamped);
        const dec = getDecEl();
        if (dec) dec.disabled = clamped <= 1;
        updateAtcText(clamped);
    }

    function updateAtcText(qty: number): void {
        if (!btnTextEl) return;
        const base = bundleStructure.labels?.addToCartText || "Add to Cart";
        btnTextEl.textContent = `${base} (${qty})`;
    }

    // ── Tier selection ─────────────────────────────────────────────────
    function updateCardBtnText(tierEl: HTMLElement, selected: boolean) {
        const btn = tierEl.querySelector(".rb-vol__card-select-btn");
        if (btn) btn.textContent = selected ? "Applied" : "Select";
    }

    function selectTier(tierEl: HTMLElement, updateQtyInput = true) {
        getTiers().forEach((t) => {
            t.classList.remove("rb-vol__tier--selected");
            t.setAttribute("aria-pressed", "false");
            updateCardBtnText(t, false);
        });
        tierEl.classList.add("rb-vol__tier--selected");
        tierEl.setAttribute("aria-pressed", "true");
        updateCardBtnText(tierEl, true);

        if (updateQtyInput) {
            const tierQty = parseInt(tierEl.dataset.tierQty || "1", 10);
            setQty(tierQty);
        }
    }

    function deselectAll() {
        getTiers().forEach((t) => {
            t.classList.remove("rb-vol__tier--selected");
            t.setAttribute("aria-pressed", "false");
            updateCardBtnText(t, false);
        });
    }

    /** Sync tier highlight to qty — deselect if below all tiers */
    function syncTierToQty() {
        const match = tierForQty(getQty());
        if (match) selectTier(match, false);
        else deselectAll();
    }

    /** Given a qty, find the highest tier where qty >= minQuantity */
    function tierForQty(qty: number): HTMLElement | null {
        const liveTiers = getTiers();
        let best: HTMLElement | null = null;
        liveTiers.forEach((t) => {
            const min = parseInt(t.dataset.tierQty || "1", 10);
            if (qty >= min) best = t;
        });
        return best;
    }

    // Apply initial selection (default tier or first)
    const defaultEl =
        widgetContainer.querySelector<HTMLElement>(".rb-vol__tier--default") ||
        (tiers.length > 0 ? tiers[0] : null);
    if (defaultEl) selectTier(defaultEl);

    // Tier row click / keydown → select + update qty input
    tiers.forEach((tierEl) => {
        tierEl.addEventListener("click", () => selectTier(tierEl));
        tierEl.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                selectTier(tierEl);
            }
        });
    });

    // Qty +/− buttons
    const decBtn = getDecEl();
    if (decBtn && !decBtn.dataset.volBound) {
        decBtn.dataset.volBound = "true";
        decBtn.addEventListener("click", () => {
            setQty(getQty() - 1);
            syncTierToQty();
        });
    }
    const incBtn = widgetContainer.querySelector<HTMLButtonElement>("[data-vol-qty-inc]");
    if (incBtn && !incBtn.dataset.volBound) {
        incBtn.dataset.volBound = "true";
        incBtn.addEventListener("click", () => {
            setQty(getQty() + 1);
            syncTierToQty();
        });
    }
    const inputEl = getQtyEl();
    if (inputEl && !inputEl.dataset.volBound) {
        inputEl.dataset.volBound = "true";
        inputEl.removeAttribute("readonly");
        inputEl.addEventListener("input", () => {
            const v = parseInt(inputEl.value || "1", 10) || 1;
            setQty(v);
            const match = tierForQty(v);
            if (match) selectTier(match, false);
        });
    }

    // ── Add-to-cart button ─────────────────────────────────────────────
    if (atcBtn.dataset.volumeBound === "true") return;
    atcBtn.dataset.volumeBound = "true";
    atcBtn.disabled = false;

    atcBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const selectedEl = widgetContainer.querySelector<HTMLElement>(
            ".rb-vol__tier--selected",
        );

        const tierIndex = selectedEl ? parseInt(selectedEl.dataset.tierIndex || "0", 10) : -1;
        const tier = tierIndex >= 0 ? config.tiers[tierIndex] : null;

        // Use the current qty input value (may differ from tier.minQuantity if user typed)
        const quantity = getQty();

        const numericVariantId = extractNumericId(variantId);
        if (!numericVariantId) {
            showToast("No product variant available", "error");
            return;
        }

        atcBtn.classList.add("is-loading");
        atcBtn.disabled = true;
        atcBtn.setAttribute("aria-busy", "true");
        const origText = btnTextEl?.textContent || "";
        if (btnTextEl) btnTextEl.textContent = bundleStructure.labels?.addingText ?? "Adding...";

        try {
            const resp = await fetch(getLocalePath("/cart/add.js"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items: [
                        {
                            id: parseInt(numericVariantId, 10),
                            quantity,
                            properties: {
                                _bundle_id: bundleStructure.id,
                                _bundle_name: bundleStructure.name,
                            },
                        },
                    ],
                }),
            });

            if (!resp.ok) {
                const errData = await resp.json().catch(() => ({}));
                showToast(errData.description || "Failed to add to cart", "error");
                return;
            }

            await enqueueCartAttributeWrite(bundleStructure.id, {
                bundleId: bundleStructure.id,
                bundleName: bundleStructure.name,
                discountType: tier ? config.discountType : "NO_DISCOUNT",
                discountValue: tier ? tier.discount : 0,
                requiredLineCount: 1,
                minOrderValue: bundleStructure.minOrderValue || 0,
                maxDiscountAmount: bundleStructure.maxDiscountAmount || 0,
                discountApplication: bundleStructure.discountApplication || "bundle",
                discountedProductIds: bundleStructure.discountedProductIds || [],
                freeShipping: bundleStructure.freeShipping || false,
            });

            if (enableAnalytics && tier) {
                const discountedCents = calcDiscountedPricePerUnit(
                    unitPriceCents,
                    tier,
                    config.discountType,
                );
                const totalValue = unitPriceCents * quantity;
                const discountValue = totalValue - discountedCents * quantity;
                widgetContainer.dispatchEvent(
                    new CustomEvent("bundle:addedToCart", {
                        detail: {
                            bundleId: bundleStructure.id,
                            productIds: [numericVariantId],
                            totalValue,
                            discountValue,
                        },
                        bubbles: true,
                    }),
                );
            }

            showToast("Added to cart!", "success");
            await updateCartCount();
            handleCartRedirect(redirectAfterCart, null, true);
        } catch (err) {
            console.error("[RadiusBundle] Volume ATC error:", err);
            showToast("Failed to add to cart", "error");
        } finally {
            atcBtn.classList.remove("is-loading");
            atcBtn.setAttribute("aria-busy", "false");
            if (btnTextEl) btnTextEl.textContent = bundleStructure.labels?.addedText ?? "Added!";
            atcBtn.classList.add("is-added");
            setTimeout(() => {
                if (btnTextEl) btnTextEl.textContent = origText;
                atcBtn.classList.remove("is-added");
                atcBtn.disabled = false;
            }, 1500);
        }
    });
}
