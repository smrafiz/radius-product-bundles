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
    const isOpenLast = config.openEnded && index === config.tiers.length - 1;
    const qtyLabel = isOpenLast
        ? `${tier.minQuantity}+`
        : `${tier.minQuantity}+`;

    const discountedCents = calcDiscountedPricePerUnit(unitPriceCents, tier, config.discountType);
    const savingsText = showSavings ? calcSavingsDisplay(unitPriceCents, tier, config.discountType) : "";

    const badgeHtml = tier.badge?.text
        ? `<span class="rb-vol__tier-badge ${badgeClass(tier.badge.style)}">${escapeHtml(tier.badge.text)}</span>`
        : "";

    const priceHtml = showPrices && unitPriceCents > 0
        ? `<span class="rb-vol__tier-price">${trimMoney(formatMoney(discountedCents))}</span>${config.discountType !== "NO_DISCOUNT" ? `<span class="rb-vol__tier-original">${trimMoney(formatMoney(unitPriceCents))}</span>` : ""}`
        : "";

    const savingsHtml = savingsText
        ? `<span class="rb-vol__tier-savings">${escapeHtml(savingsText)}</span>`
        : "";

    return `
        <li class="rb-vol__tier${isDefault ? " rb-vol__tier--default" : ""}"
            data-tier-index="${index}"
            data-tier-qty="${tier.minQuantity}"
            role="button"
            tabindex="0"
            aria-pressed="${isDefault ? "true" : "false"}"
            aria-label="${escapeHtml(tier.title || `Buy ${qtyLabel}`)}">
            <div class="rb-vol__tier-qty">
                <span class="rb-vol__tier-qty-num">${escapeHtml(qtyLabel)}</span>
                <span class="rb-vol__tier-qty-unit">units</span>
            </div>
            <div class="rb-vol__tier-info">
                ${tier.title ? `<span class="rb-vol__tier-title">${escapeHtml(tier.title)}</span>` : ""}
                ${tier.subtitle ? `<span class="rb-vol__tier-subtitle">${escapeHtml(tier.subtitle)}</span>` : ""}
                ${badgeHtml}
            </div>
            <div class="rb-vol__tier-pricing">
                ${priceHtml}
                ${savingsHtml}
            </div>
            <div class="rb-vol__tier-check" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
        </li>
    `;
}

/** Render the full volume table into the products container */
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

/** Wire tier selection interaction */
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
    const tiers = widgetContainer.querySelectorAll<HTMLElement>(".rb-vol__tier");

    function selectTier(tierEl: HTMLElement) {
        tiers.forEach((t) => {
            t.classList.remove("rb-vol__tier--selected");
            t.setAttribute("aria-pressed", "false");
        });
        tierEl.classList.add("rb-vol__tier--selected");
        tierEl.setAttribute("aria-pressed", "true");
    }

    // Apply initial selection (default tier or first)
    const defaultEl =
        widgetContainer.querySelector<HTMLElement>(".rb-vol__tier--default") ||
        (tiers.length > 0 ? tiers[0] : null);
    if (defaultEl) selectTier(defaultEl);

    tiers.forEach((tierEl) => {
        tierEl.addEventListener("click", () => selectTier(tierEl));
        tierEl.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                selectTier(tierEl);
            }
        });
    });

    // Wire the add-to-cart button
    const atcBtn = widgetContainer.querySelector<HTMLButtonElement>(
        "[data-bundle-add-to-cart]",
    );
    if (!atcBtn) return;
    atcBtn.disabled = false;

    atcBtn.addEventListener("click", async () => {
        const selectedEl = widgetContainer.querySelector<HTMLElement>(
            ".rb-vol__tier--selected",
        );
        if (!selectedEl) return;

        const tierIndex = parseInt(selectedEl.dataset.tierIndex || "0", 10);
        const tier = config.tiers[tierIndex];
        if (!tier) return;

        const numericVariantId = extractNumericId(variantId);
        if (!numericVariantId) {
            showToast("No product variant available", "error");
            return;
        }

        atcBtn.classList.add("is-loading");
        atcBtn.disabled = true;
        atcBtn.setAttribute("aria-busy", "true");
        const btnTextEl = atcBtn.querySelector<HTMLElement>("[data-button-text]");
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
                            quantity: tier.minQuantity,
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
                discountType: config.discountType,
                discountValue: tier.discount,
                requiredLineCount: 1,
                minOrderValue: bundleStructure.minOrderValue || 0,
                maxDiscountAmount: bundleStructure.maxDiscountAmount || 0,
                discountApplication: bundleStructure.discountApplication || "bundle",
                discountedProductIds: bundleStructure.discountedProductIds || [],
                freeShipping: bundleStructure.freeShipping || false,
            });

            if (enableAnalytics) {
                const discountedCents = calcDiscountedPricePerUnit(
                    unitPriceCents,
                    tier,
                    config.discountType,
                );
                const totalValue = unitPriceCents * tier.minQuantity;
                const discountValue = totalValue - discountedCents * tier.minQuantity;
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
