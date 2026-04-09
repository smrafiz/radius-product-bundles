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
            return `${Math.round(tier.discount)}% off`;
        case "FIXED_AMOUNT":
            return `${trimMoney(formatMoney(tier.discount * 100))} off`;
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
        ? `<span class="rb-vol__tier-savings-line">Save ${escapeHtml(savingsText)}</span>`
        : "";

    // Right-side pricing
    const priceColHtml = showPrices && unitPriceCents > 0
        ? `<div class="rb-vol__tier-pricing">
                <span class="rb-vol__tier-price">${trimMoney(formatMoney(discountedCents))}</span>
                ${hasDiscount ? `<span class="rb-vol__tier-original">${trimMoney(formatMoney(unitPriceCents))}</span>` : ""}
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
    showSavings: boolean,
    lazyLoadImages: boolean,
): void {
    const imageHtml =
        showImages && productImageSrc
            ? `<div class="rb-vol__product-image">${responsiveImg(productImageSrc, productTitle, { lazy: lazyLoadImages, size: "thumb" })}</div>`
            : "";

    const tiersHtml = config.tiers
        .map((tier, i) =>
            renderTierRow(tier, i, config, unitPriceCents, showPrices, showSavings),
        )
        .join("");

    const productInfoHtml = `
        <div class="rb-vol__product-header">
            ${imageHtml}
            <div class="rb-vol__product-meta">
                <span class="rb-vol__product-title">${escapeHtml(productTitle)}</span>
                ${showPrices && unitPriceCents > 0 ? `<span class="rb-vol__product-base-price">${trimMoney(formatMoney(unitPriceCents))} / unit</span>` : ""}
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
        ? `<div class="rb-vol__card-savings">SAVE ${escapeHtml(savingsText.toUpperCase())}</div>`
        : "";

    const btnLabel = "Select";

    return `
        <li class="rb-vol__tier rb-vol__card${isDefault ? " rb-vol__tier--default" : ""}${badgeText ? " rb-vol__card--popular" : ""}"
            data-tier-index="${index}"
            data-tier-qty="${tier.minQuantity}"
            role="button"
            tabindex="0"
            aria-pressed="${isDefault ? "true" : "false"}"
            aria-label="${resolvedTitle}, Buy ${escapeHtml(qtyLabel)} units">
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
                ${showPrices && unitPriceCents > 0 ? `<span class="rb-vol__product-base-price">${trimMoney(formatMoney(unitPriceCents))} / unit</span>` : ""}
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
        const base = bundleStructure.labels?.buttonText || "Add to Cart";
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
