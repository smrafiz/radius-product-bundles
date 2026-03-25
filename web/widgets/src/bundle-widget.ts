import "./scss/index.scss";
import type {
    Bundle,
    BundleProduct,
    BundleResponse,
    BundleStructure,
    CartAddItem,
    DiscountConfig,
    ProductDetailsResponse,
} from "./lib/types";
import {
    countBundlesInCart,
    extractNumericId,
    formatLabel,
    formatMoney,
    getLayout,
    getLocalePath,
    showError,
    showToast,
    trimMoney,
} from "./lib/utils";
import {
    type BogoContext,
    renderBogoCompactGridProducts,
    renderBogoMinimalistProducts,
    renderBogoSleekProducts,
    renderBogoChecklistProducts,
    renderBxgyProducts,
    renderClassicCardProducts,
    renderSplitDealProducts,
} from "./lib/bogo-renderer";
import { BundleSlider } from "./lib/slider";
import { handleCartRedirect, updateCartCount } from "./lib/cart";
import { enqueueCartAttributeWrite } from "./lib/cart-attributes";
import {
    type FixedContext,
    renderFixedProducts,
    updatePricing,
    validateStock,
} from "./lib/fixed-renderer";

(function () {
    "use strict";

    /**
     * Radius Bundle Widget Class
     */
    class RadiusBundleWidget {
        private readonly container: HTMLElement;
        private readonly bundleId: string;
        private readonly productId: string;
        private readonly shop: string;
        private readonly bundleStructure: BundleStructure | null = null;
        private bundle: Bundle | null = null;

        // Display options
        private readonly showImages: boolean = true;
        private readonly showSavings: boolean = true;
        private readonly showSavingsBadge: boolean = true;
        private readonly showPrices: boolean = true;
        private readonly showComparePrices: boolean = true;
        private readonly showQuantity: boolean = true;
        private readonly showFreeShipping: boolean = true;
        private readonly enableHyperLink: boolean = false;
        private readonly lazyLoadImages: boolean = true;

        // Cart behavior
        private readonly redirectAfterCart: string = "cart";
        private readonly enableStockValidation: boolean = true;
        private readonly maxBundlesPerOrder: number = 0;
        private readonly enableAnalytics: boolean = true;
        private readonly isStandalone: boolean = false;

        // Style options
        private readonly imagePosition: string = "top";
        private readonly badgeStyle: string = "filled";
        private readonly imageSize: string = "medium";

        // Layout options
        private readonly dividerStyle: string = "plus";
        private readonly carouselNavigation: string = "both";
        private readonly autoplay: boolean = false;
        private readonly autoplaySpeed: number = 5;

        private readonly moreProductSettings: boolean = false;
        private readonly moreProductCount: number = 4;
        private readonly moreProductsText: string = "+ {count} more products";
        private readonly showLessText: string = "Show less";

        // Responsive overrides
        private readonly responsiveOverrides: {
            tablet?: Record<string, string>;
            mobile?: Record<string, string>;
            breakpoints?: { tablet?: number; mobile?: number };
        } | null = null;
        private readonly desktopDataAttrs: Record<string, string> = {};

        // Slider
        private slider: BundleSlider | null = null;

        // Cleanup references
        private abortController = new AbortController();
        private buyNowObserver: MutationObserver | null = null;
        private buyNowTimeout: number | null = null;
        private viewObserver: IntersectionObserver | null = null;
        private viewTimeout: number | null = null;

        /**
         * Constructor - Initialize widget with container element
         */
        constructor(container: HTMLElement) {
            this.container = container;
            this.bundleId = container.dataset.bundleId || "";
            this.productId =
                container
                    .closest("[data-product-id]")
                    ?.getAttribute("data-product-id") || "";
            this.shop =
                container.closest("[data-shop]")?.getAttribute("data-shop") ||
                "";

            // Parse display options from data attributes
            this.showImages = container.dataset.showImages !== "false";
            this.showSavings = container.dataset.showSavings !== "false";
            this.showSavingsBadge =
                container.dataset.showSavingsBadge !== "false";
            this.showPrices = container.dataset.showPrices !== "false";
            this.showComparePrices =
                container.dataset.showComparePrices !== "false";
            this.showQuantity = container.dataset.showQuantity !== "false";
            this.showFreeShipping =
                container.dataset.showFreeShipping !== "false";
            this.enableHyperLink = container.dataset.enableHyperlink === "true";
            this.lazyLoadImages = container.dataset.lazyLoadImages !== "false";

            // Parse cart behavior
            this.redirectAfterCart =
                container.dataset.redirectAfterCart || "cart";
            this.enableStockValidation =
                container.dataset.enableStockValidation === "true";
            this.maxBundlesPerOrder = parseInt(
                container.dataset.maxBundlesPerOrder || "0",
                10,
            );
            this.enableAnalytics =
                container.dataset.enableAnalytics !== "false";

            console.log(
                "[RadiusBundle] Init - redirectAfterCart:",
                this.redirectAfterCart,
                "| raw:",
                container.dataset.redirectAfterCart,
            );
            // Parse style options from data attributes
            this.imagePosition = container.dataset.imagePosition || "top";
            this.badgeStyle = container.dataset.badgeStyle || "filled";
            this.imageSize = container.dataset.imageSize || "medium";

            // Parse layout options from data attributes
            this.dividerStyle = container.dataset.dividerStyle || "plus";
            this.carouselNavigation =
                container.dataset.carouselNavigation || "both";
            this.autoplay = container.dataset.autoplay === "true";
            this.autoplaySpeed = parseInt(
                container.dataset.autoplaySpeed || "5",
                10,
            );

            this.moreProductSettings =
                container.dataset.moreProductSettings === "true";
            this.moreProductCount = parseInt(
                container.dataset.moreProductCount || "4",
                10,
            );
            this.moreProductsText =
                container.dataset.moreProductsText || "+ {count} more products";
            this.showLessText = container.dataset.showLessText || "Show less";

            // Parse structure from Liquid
            const structureJson = container.dataset.bundleStructure;
            if (structureJson) {
                try {
                    const parsed = JSON.parse(structureJson);
                    const ensureArray = (v: unknown): string[] =>
                        Array.isArray(v)
                            ? v
                            : typeof v === "string"
                              ? JSON.parse(v)
                              : [];
                    parsed.productIds = ensureArray(parsed.productIds);
                    parsed.productQuantities = Array.isArray(
                        parsed.productQuantities,
                    )
                        ? parsed.productQuantities
                        : typeof parsed.productQuantities === "string"
                          ? JSON.parse(parsed.productQuantities)
                          : [];
                    parsed.productRoles = ensureArray(parsed.productRoles);
                    parsed.discountedProductIds = ensureArray(
                        parsed.discountedProductIds,
                    );
                    this.bundleStructure = parsed;
                } catch (e) {
                    console.warn(
                        "[RadiusBundle] Failed to parse bundle structure:",
                        e,
                    );
                }
            }

            // Parse responsive overrides
            const responsiveJson = container.dataset.responsive;
            if (responsiveJson) {
                try {
                    this.responsiveOverrides = JSON.parse(responsiveJson);
                } catch {
                    /* ignore malformed responsive JSON */
                }
            }

            // Detect standalone mode
            this.isStandalone = container.dataset.isStandalone === "true";

            // Store desktop defaults for reset
            this.desktopDataAttrs = {
                boxAlignment: container.dataset.boxAlign || "center",
                imagePosition: container.dataset.imagePosition || "left",
                dividerStyle: container.dataset.dividerStyle || "plus",
                carouselNavigation:
                    container.dataset.carouselNavigation || "both",
            };

            void this.init();
        }

        private initResponsive(): void {
            const bp = this.responsiveOverrides?.breakpoints;
            const tabletBp = bp?.tablet ?? 1024;
            const mobileBp = bp?.mobile ?? 768;
            const tabletMq = window.matchMedia(`(max-width: ${tabletBp}px)`);
            const mobileMq = window.matchMedia(`(max-width: ${mobileBp}px)`);

            const update = () => {
                const device = mobileMq.matches
                    ? "mobile"
                    : tabletMq.matches
                      ? "tablet"
                      : "desktop";
                this.applyDeviceClass(device);
                if (this.responsiveOverrides) {
                    this.applyResponsiveDataAttrs(device);
                }
            };

            tabletMq.addEventListener("change", update);
            mobileMq.addEventListener("change", update);
            update();
        }

        private applyDeviceClass(device: string): void {
            this.container.classList.remove(
                "rb--desktop",
                "rb--tablet",
                "rb--mobile",
            );
            this.container.classList.add(`rb--${device}`);
        }

        private applyResponsiveDataAttrs(device: string): void {
            const attrMap: Record<string, string> = {
                boxAlignment: "boxAlign",
                imagePosition: "imagePosition",
                dividerStyle: "dividerStyle",
                carouselNavigation: "carouselNavigation",
            };

            for (const [key, dataKey] of Object.entries(attrMap)) {
                let value: string | undefined;

                if (device === "mobile") {
                    // Mobile: use mobile value if set, otherwise fall back to desktop
                    value =
                        this.responsiveOverrides?.mobile?.[key] ??
                        this.desktopDataAttrs[key];
                } else if (device === "tablet") {
                    // Tablet: use tablet value if set, otherwise fall back to desktop
                    value =
                        this.responsiveOverrides?.tablet?.[key] ??
                        this.desktopDataAttrs[key];
                } else {
                    // Desktop: use desktop value
                    value = this.desktopDataAttrs[key];
                }

                if (value) {
                    this.container.dataset[dataKey] = value;
                }
            }
        }

        /**
         * Initialize widget
         */
        private async init(): Promise<void> {
            if (!this.bundleId || !this.productId || !this.shop) {
                console.warn("[RadiusBundle] Missing required data attributes");
                return;
            }

            if (this.isStandalone) {
                this.initStandaloneMode();
                return;
            }

            // Show the badge immediately from structure
            if (this.bundleStructure) {
                this.updateBadgeFromStructure(this.bundleStructure);
            }

            // Track bundle view
            this.trackBundleView();

            // Fetch product details only
            await this.loadProductDetails();

            // Bind events after products are loaded
            this.bindEvents();

            // Initialize slider if carousel layout
            if (getLayout(this.container) === "slider") {
                this.initSliderInstance();
            }

            // Initialize responsive data attribute swapping
            this.initResponsive();
        }

        private initStandaloneMode(): void {
            this.container.style.display = "none";

            if (this.enableAnalytics && !(window as any).Shopify?.designMode) {
                // Defer dispatch so radius-bundles.js listener is attached first
                // (bundle-widget.js runs before radius-bundles.js due to defer order)
                setTimeout(() => {
                    document.dispatchEvent(
                        new CustomEvent("bundle:viewed", {
                            detail: {
                                bundleId: this.bundleId,
                                productId: extractNumericId(this.productId),
                                isStandalone: true,
                            },
                            bubbles: true,
                        }),
                    );
                }, 0);
            }

            const form = document.querySelector(
                'form[action*="/cart/add"]',
            ) as HTMLFormElement | null;

            if (form) {
                const bundleName = this.bundleStructure?.name || "Bundle";
                this.injectHiddenInput(
                    form,
                    "properties[_bundle_id]",
                    this.bundleId,
                );
                this.injectHiddenInput(
                    form,
                    "properties[_bundle_name]",
                    bundleName,
                );
            }

            this.interceptStandaloneAddToCart();
            this.interceptBuyNowButton();
        }

        private injectHiddenInput(
            form: HTMLFormElement,
            name: string,
            value: string,
        ): void {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = name;
            input.value = value;
            form.appendChild(input);
        }

        private interceptStandaloneAddToCart(): void {
            const form = document.querySelector(
                'form[action*="/cart/add"]',
            ) as HTMLFormElement | null;

            if (!form) {
                return;
            }

            form.addEventListener(
                "submit",
                async (e) => {
                    e.preventDefault();
                    const formData = new FormData(form);

                    const id = formData.get("id");
                    const quantity = formData.get("quantity") || "1";
                    if (!id) {
                        form.submit();
                        return;
                    }

                    const properties: Record<string, string> = {
                        _bundle_id: this.bundleId,
                        _bundle_name: this.bundleStructure?.name || "Bundle",
                    };

                    for (const [key, value] of formData.entries()) {
                        const match = key.match(/^properties\[(.+)]$/);
                        if (match) properties[match[1]] = String(value);
                    }

                    try {
                        const response = await fetch(
                            getLocalePath("/cart/add.js"),
                            {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    items: [
                                        {
                                            id: parseInt(String(id), 10),
                                            quantity: parseInt(
                                                String(quantity),
                                                10,
                                            ),
                                            properties,
                                        },
                                    ],
                                }),
                            },
                        );

                        if (response.ok) {
                            await this.updateStandaloneCartAttributes();

                            if (this.enableAnalytics) {
                                document.dispatchEvent(
                                    new CustomEvent("bundle:addedToCart", {
                                        detail: {
                                            bundleId: this.bundleId,
                                            productId: this.productId,
                                            isStandalone: true,
                                        },
                                        bubbles: true,
                                    }),
                                );
                            }

                            await updateCartCount();
                            handleCartRedirect(
                                this.redirectAfterCart,
                                null,
                                this.lazyLoadImages,
                            );
                        } else {
                            const errorData = await response
                                .json()
                                .catch(() => ({}));
                            showToast(
                                errorData.description ||
                                    "Failed to add to cart",
                                "error",
                            );
                        }
                    } catch {
                        showToast("Failed to add to cart", "error");
                    }
                },
                { signal: this.abortController.signal },
            );
        }

        private interceptBuyNowButton(): void {
            const hideBuyNow = (container: Element) => {
                (container as HTMLElement).style.display = "none";
            };

            const existing = document.querySelector(
                '[data-shopify="payment-button"]',
            );
            if (existing) {
                hideBuyNow(existing);
                return;
            }

            this.buyNowObserver = new MutationObserver(() => {
                const container = document.querySelector(
                    '[data-shopify="payment-button"]',
                );
                if (container) {
                    this.buyNowObserver?.disconnect();
                    hideBuyNow(container);
                }
            });

            this.buyNowObserver.observe(document.body, {
                childList: true,
                subtree: true,
            });

            this.buyNowTimeout = window.setTimeout(() => {
                this.buyNowObserver?.disconnect();
            }, 10000);
        }

        private async updateStandaloneCartAttributes(): Promise<void> {
            const structure = this.bundleStructure;
            await enqueueCartAttributeWrite(this.bundleId, {
                bundleId: this.bundleId,
                bundleName: structure?.name || "Bundle",
                discountType: "NO_DISCOUNT",
                discountValue: 0,
                requiredLineCount: 1,
                minOrderValue: structure?.minOrderValue || 0,
                maxDiscountAmount: 0,
                discountApplication: "bundle",
                discountedProductIds: [],
                freeShipping: structure?.freeShipping || false,
            });
        }

        private initSliderInstance(): void {
            this.slider = new BundleSlider(this.container, {
                autoplay: this.autoplay,
                autoplaySpeed: this.autoplaySpeed,
            });
            this.slider.init();
        }

        /**
         * Shows badge from structure.
         */
        private updateBadgeFromStructure(structure: BundleStructure): void {
            const badgeEl = this.container.querySelector("[data-bundle-badge]");

            if (!badgeEl) {
                return;
            }

            let badgeText = "";

            const isBxgy =
                structure.bundleType === "BOGO" ||
                structure.bundleType === "BUY_X_GET_Y";
            const roles = Array.isArray(structure.productRoles)
                ? structure.productRoles
                : [];
            const buyQty =
                roles.filter((r) => r === "TRIGGER").length ||
                structure.buyQuantity ||
                1;
            const getQty =
                roles.filter((r) => r === "REWARD").length ||
                structure.getQuantity ||
                1;

            if (isBxgy) {
                if (
                    structure.discountType === "PERCENTAGE" &&
                    structure.discountValue === 100
                ) {
                    badgeText = `Buy ${buyQty} Get ${getQty} FREE`;
                } else if (
                    structure.discountType === "PERCENTAGE" &&
                    structure.discountValue > 0
                ) {
                    badgeText = `Buy ${buyQty} Get ${getQty} at ${structure.discountValue}% off`;
                } else if (
                    structure.discountType === "FIXED_AMOUNT" &&
                    structure.discountValue > 0
                ) {
                    badgeText = `Buy ${buyQty} Get ${getQty} - Save ${trimMoney(formatMoney(structure.discountValue * 100))}`;
                } else if (
                    structure.discountType === "CUSTOM_PRICE" &&
                    structure.discountValue > 0
                ) {
                    badgeText = `Buy ${buyQty} Get ${getQty} for ${trimMoney(formatMoney(structure.discountValue * 100))}`;
                }
            } else if (structure.discountValue && structure.discountValue > 0) {
                switch (structure.discountType) {
                    case "PERCENTAGE":
                        badgeText = formatLabel(
                            structure.labels?.savingsBadgeText ??
                                "Save {percent}%",
                            {
                                percent: structure.discountValue,
                                amount: `${structure.discountValue}%`,
                            },
                        );
                        break;

                    case "FIXED_AMOUNT":
                        badgeText = formatLabel("Save {amount}", {
                            amount: trimMoney(
                                formatMoney(structure.discountValue * 100),
                            ),
                        });
                        break;

                    case "CUSTOM_PRICE":
                        badgeText = formatLabel("Only {amount}", {
                            amount: trimMoney(
                                formatMoney(structure.discountValue * 100),
                            ),
                        });
                        break;
                }
            }

            if (badgeText && this.showSavingsBadge) {
                badgeEl.textContent = badgeText;
                const isBogoPill = badgeEl.classList.contains(
                    "radius-bundle__badge-pill",
                );
                badgeEl.classList.add(
                    isBogoPill
                        ? "radius-bundle__badge-pill--visible"
                        : "radius-bundle__badge--visible",
                );
            } else {
                (badgeEl as HTMLElement).style.display = "none";
            }
        }

        /**
         * Track bundle view event
         */
        private trackBundleView(): void {
            if ((window as any).Shopify?.designMode) {
                return;
            }

            if (!this.enableAnalytics) {
                return;
            }

            try {
                this.viewObserver = new IntersectionObserver(
                    (entries) => {
                        entries.forEach((entry) => {
                            if (entry.isIntersecting) {
                                this.viewTimeout = window.setTimeout(() => {
                                    if (entry.isIntersecting) {
                                        document.dispatchEvent(
                                            new CustomEvent("bundle:viewed", {
                                                detail: {
                                                    bundleId: this.bundleId,
                                                    productId: extractNumericId(
                                                        this.productId,
                                                    ),
                                                },
                                                bubbles: true,
                                            }),
                                        );
                                        this.viewObserver?.unobserve(
                                            this.container,
                                        );
                                    }
                                }, 1000);
                            } else if (this.viewTimeout) {
                                clearTimeout(this.viewTimeout);
                            }
                        });
                    },
                    { threshold: 0.5 },
                );

                this.viewObserver.observe(this.container);
            } catch {
                // IntersectionObserver not supported
            }
        }

        /**
         * Fetches ONLY product details.
         */
        private async loadProductDetails(): Promise<void> {
            try {
                if (!this.bundleStructure?.productIds?.length) {
                    console.warn(
                        "[RadiusBundle] No product IDs, using legacy fetch",
                    );
                    await this.loadBundleLegacy();
                    return;
                }

                console.log(
                    `[RadiusBundle] Fetching ${this.bundleStructure.productIds.length} products`,
                );

                // Fetch products by IDs only
                const productIds = this.bundleStructure.productIds.join(",");
                const url = `/apps/radius-bundles/products?shop=${encodeURIComponent(this.shop)}&ids=${encodeURIComponent(productIds)}`;

                const response = await fetch(url);

                if (!response.ok) {
                    showToast(`API error: ${response.status}`, "error");
                    return;
                }

                const data: ProductDetailsResponse = await response.json();

                if (!data.success || !data.products) {
                    showToast("No products returned", "error");
                    return;
                }

                // Build bundle from structure + product details
                this.bundle = {
                    ...this.bundleStructure,
                    products: this.matchProductsToStructure(data.products),
                } as Bundle;

                if (!this.bundle) {
                    showError(this.container, "Bundle not available");
                    return;
                }

                // Fetch tax-inclusive storefront prices via Shopify Ajax API
                await this.fetchStorefrontPrices(this.bundle.products);

                this.renderProducts(this.bundle);
                updatePricing(this.bundle, this.getFixedContext());
                if (this.enableStockValidation)
                    validateStock(this.getFixedContext());
            } catch (error) {
                console.error("[RadiusBundle] Load error:", error);
                showError(this.container, "Failed to load bundle");
            }
        }

        /**
         * Fetches tax-inclusive prices from Shopify's storefront Ajax API.
         * The Admin API returns raw prices without tax, but the storefront
         * Ajax API (/products/{handle}.js) returns prices in the customer's
         * context (tax-inclusive for tax-inclusive markets).
         */
        private async fetchStorefrontPrices(
            products: BundleProduct[],
        ): Promise<void> {
            const fetchPromises = products
                .filter((p) => p.handle)
                .map(async (product) => {
                    try {
                        const response = await fetch(
                            getLocalePath(`/products/${product.handle}.js`),
                        );
                        if (!response.ok) {
                            return;
                        }

                        const data = await response.json();
                        const variantNumericId = extractNumericId(
                            product.variantId,
                        );

                        // Match exact variant, fallback to first
                        const variant =
                            data.variants?.find(
                                (v: any) => String(v.id) === variantNumericId,
                            ) || data.variants?.[0];

                        if (variant) {
                            product.price = variant.price;
                            product.compareAtPrice =
                                variant.compare_at_price || 0;
                        }
                    } catch {
                        // Silently fall back to Admin API prices
                    }
                });

            await Promise.all(fetchPromises);
        }

        /**
         * Matches fetched products to structure.
         */
        private matchProductsToStructure(
            products: ProductDetailsResponse["products"],
        ): BundleProduct[] {
            if (!this.bundleStructure?.productIds) {
                return [];
            }

            const productMap = new Map(products.map((p) => [p.id, p]));

            const quantities = this.bundleStructure.productQuantities;
            const roles = this.bundleStructure.productRoles;
            return this.bundleStructure.productIds.map((productId, index) => {
                const product = productMap.get(productId);
                const rawRole = roles?.[index] || "INCLUDED";
                const role = (
                    rawRole === "TRIGGER" ||
                    rawRole === "REWARD" ||
                    rawRole === "OPTIONAL"
                        ? rawRole
                        : "INCLUDED"
                ) as BundleProduct["role"];

                return {
                    id: productId,
                    variantId: product?.variantId || "",
                    quantity: quantities?.[index] || 1,
                    role,
                    displayOrder: index,
                    isRequired: true,
                    title: product?.title || "Loading...",
                    price: product?.price || 0,
                    compareAtPrice: product?.compareAtPrice || 0,
                    featuredImage: product?.image || null,
                    handle: product?.handle || "",
                    available: product?.available ?? true,
                };
            });
        }

        /**
         * Fallback: Legacy bundle fetch.
         */
        private async loadBundleLegacy(): Promise<void> {
            try {
                const url = `/apps/radius-bundles/products?productId=${encodeURIComponent(this.productId)}&shop=${encodeURIComponent(this.shop)}&bundleId=${encodeURIComponent(this.bundleId)}`;
                const response = await fetch(url);

                if (!response.ok) {
                    showToast(`API error: ${response.status}`, "error");
                    return;
                }

                const data: BundleResponse = await response.json();

                if (!data.success || !data.bundles?.length) {
                    showToast("No bundles returned", "error");
                    return;
                }

                this.bundle =
                    data.bundles.find((b) => b.id === this.bundleId) ||
                    data.bundles[0];

                if (!this.bundle) {
                    showError(this.container, "Bundle not available");
                    return;
                }

                await this.fetchStorefrontPrices(this.bundle.products);
                this.renderProducts(this.bundle);
                updatePricing(this.bundle, this.getFixedContext());
                if (this.enableStockValidation)
                    validateStock(this.getFixedContext());
            } catch (error) {
                console.error("[RadiusBundle] Legacy fetch error:", error);
                showError(this.container, "Failed to load bundle");
            }
        }

        private getQuantityLabel(): string {
            return this.bundleStructure?.labels?.quantityLabel || "Qty:";
        }

        private isBxgyBundle(): boolean {
            const t = this.bundleStructure?.bundleType;
            return t === "BOGO" || t === "BUY_X_GET_Y";
        }

        private getBogoContext(): BogoContext {
            return {
                container: this.container,
                bundleStructure: this.bundleStructure,
                showImages: this.showImages,
                showPrices: this.showPrices,
                showComparePrices: this.showComparePrices,
                showQuantity: this.showQuantity,
                showSavings: this.showSavings,
                showSavingsBadge: this.showSavingsBadge,
                lazyLoadImages: this.lazyLoadImages,
                enableHyperLink: this.enableHyperLink,
                imagePosition: this.imagePosition,
                badgeStyle: this.badgeStyle,
                imageSize: this.imageSize,
                quantityLabel: this.getQuantityLabel(),
            };
        }

        private getFixedContext(): FixedContext {
            return {
                container: this.container,
                bundleStructure: this.bundleStructure,
                bundle: this.bundle,
                showImages: this.showImages,
                showPrices: this.showPrices,
                showComparePrices: this.showComparePrices,
                showQuantity: this.showQuantity,
                showSavings: this.showSavings,
                showSavingsBadge: this.showSavingsBadge,
                showFreeShipping: this.showFreeShipping,
                lazyLoadImages: this.lazyLoadImages,
                enableHyperLink: this.enableHyperLink,
                dividerStyle: this.dividerStyle,
                moreProductSettings: this.moreProductSettings,
                moreProductCount: this.moreProductCount,
                moreProductsText: this.moreProductsText,
                showLessText: this.showLessText,
                quantityLabel: this.getQuantityLabel(),
                isBxgy: this.isBxgyBundle(),
            };
        }

        private renderProducts(bundle: Bundle): void {
            const productsContainer = this.container.querySelector(
                "[data-bundle-products]",
            );

            if (!productsContainer) {
                return;
            }

            try {
                if (this.isBxgyBundle()) {
                    const layout = getLayout(this.container);
                    const ctx = this.getBogoContext();

                    if (layout === "sleek") {
                        renderBogoSleekProducts(bundle, productsContainer, ctx);
                    } else if (layout === "compact_grid") {
                        renderBogoCompactGridProducts(
                            bundle,
                            productsContainer,
                            ctx,
                        );
                    } else if (layout === "minimalist") {
                        renderBogoMinimalistProducts(
                            bundle,
                            productsContainer,
                            ctx,
                        );
                    } else if (layout === "classic_card") {
                        renderClassicCardProducts(
                            bundle,
                            productsContainer,
                            ctx,
                        );
                    } else if (layout === "checklist") {
                        renderBogoChecklistProducts(
                            bundle,
                            productsContainer,
                            ctx,
                        );
                    } else if (layout === "split_deal") {
                        renderSplitDealProducts(bundle, productsContainer, ctx);
                    } else {
                        renderBxgyProducts(bundle, productsContainer, ctx);
                    }

                    return;
                }

                const layout = getLayout(this.container);
                const ctx = this.getFixedContext();
                renderFixedProducts(
                    bundle,
                    productsContainer as HTMLElement,
                    layout,
                    ctx,
                );

                if (layout === "slider") {
                    setTimeout(() => this.initSliderInstance(), 0);
                }
            } catch {
                showError(this.container, "Failed to display bundle products");
            }
        }

        /**
         * Binds event listeners
         */
        private bindEvents(): void {
            // Add to cart button
            const addToCartBtn = this.container.querySelector(
                "[data-bundle-add-to-cart]",
            );

            if (addToCartBtn) {
                addToCartBtn.addEventListener("click", () =>
                    this.handleAddToCart(),
                );
            }

            // Slider navigation buttons
            const prevBtn = this.container.querySelector("[data-slider-prev]");
            const nextBtn = this.container.querySelector("[data-slider-next]");

            if (prevBtn) {
                prevBtn.addEventListener("click", () =>
                    this.slider?.slidePrev(),
                );
            }

            if (nextBtn) {
                nextBtn.addEventListener("click", () =>
                    this.slider?.slideNext(),
                );
            }

            // Pause autoplay on hover
            if (this.autoplay && getLayout(this.container) === "slider") {
                const sliderWrapper = this.container.querySelector(
                    ".radius-bundle__slider-wrapper",
                );

                if (sliderWrapper) {
                    sliderWrapper.addEventListener("mouseenter", () =>
                        this.slider?.stopAutoplay(),
                    );
                    sliderWrapper.addEventListener("mouseleave", () =>
                        this.slider?.startAutoplay(),
                    );
                }
            }
        }

        /**
         * Handles add to cart.
         */
        private async handleAddToCart(): Promise<void> {
            if (!this.bundle) {
                return;
            }

            const button = this.container.querySelector(
                "[data-bundle-add-to-cart]",
            ) as HTMLButtonElement;

            if (!button) {
                return;
            }

            button.classList.add("is-loading");
            button.disabled = true;

            const buttonTextEl = button.querySelector(
                "[data-button-text]",
            ) as HTMLElement;
            const originalText = buttonTextEl
                ? buttonTextEl.textContent || ""
                : button.textContent || "";
            const addingLabel =
                this.bundleStructure?.labels?.addingText ?? "Adding...";

            if (buttonTextEl) {
                buttonTextEl.textContent = addingLabel;
            }

            try {
                // Check max bundles per order limit
                if (this.maxBundlesPerOrder > 0) {
                    const currentCart = await fetch(
                        getLocalePath("/cart.js"),
                    ).then((r) => r.json());
                    const bundleCount = countBundlesInCart(
                        currentCart.items || [],
                    );

                    if (bundleCount >= this.maxBundlesPerOrder) {
                        const maxBundlesMsg = (
                            this.bundleStructure?.labels
                                ?.maxBundlesReachedText ??
                            "Maximum {count} bundle(s) per order allowed"
                        ).replace("{count}", String(this.maxBundlesPerOrder));
                        showToast(maxBundlesMsg, "error");
                        button.classList.remove("is-loading");
                        button.disabled = false;
                        return;
                    }
                }

                const validRoles: BundleProduct["role"][] = this.isBxgyBundle()
                    ? ["TRIGGER", "REWARD"]
                    : ["INCLUDED", "OPTIONAL"];
                const cartItems: CartAddItem[] = this.bundle.products
                    .filter((p) => validRoles.includes(p.role))
                    .filter((p) => p.variantId)
                    .map((p) => ({
                        id: extractNumericId(p.variantId),
                        quantity: p.quantity,
                        properties: {
                            _bundle_id: this.bundle!.id,
                            _bundle_name: this.bundle!.name,
                        },
                    }));

                if (cartItems.length === 0) {
                    showToast("No valid products to add to cart", "error");
                    return;
                }

                const addResponse = await fetch(getLocalePath("/cart/add.js"), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ items: cartItems }),
                });

                if (!addResponse.ok) {
                    const errorData = await addResponse
                        .json()
                        .catch(() => ({}));
                    showToast(
                        errorData.description ||
                            `Failed to add to cart: ${addResponse.status}`,
                        "error",
                    );
                    return;
                }

                const structure = this.bundleStructure || this.bundle;

                const newDiscount: DiscountConfig = {
                    bundleId: this.bundle.id,
                    bundleName: this.bundle.name,
                    discountType: structure.discountType || "PERCENTAGE",
                    discountValue: structure.discountValue || 0,
                    requiredLineCount: this.bundle.products.filter((p) =>
                        validRoles.includes(p.role),
                    ).length,
                    minOrderValue: structure.minOrderValue || 0,
                    maxDiscountAmount: structure.maxDiscountAmount || 0,
                    discountApplication:
                        structure.discountApplication || "bundle",
                    discountedProductIds: structure.discountedProductIds || [],
                    freeShipping: structure.freeShipping || false,
                };

                await enqueueCartAttributeWrite(this.bundle.id, newDiscount);

                showToast("Bundle added to cart!", "success");

                const totalValue = cartItems.reduce((sum, item) => {
                    const product = this.bundle?.products.find(
                        (p) => extractNumericId(p.variantId) === item.id,
                    );
                    return sum + (product?.price || 0) * item.quantity;
                }, 0);

                let discountValue = 0;
                if (newDiscount.discountType === "PERCENTAGE") {
                    discountValue =
                        (totalValue * newDiscount.discountValue) / 100;
                } else if (newDiscount.discountType === "FIXED_AMOUNT") {
                    discountValue = newDiscount.discountValue;
                }

                if (this.enableAnalytics) {
                    this.container.dispatchEvent(
                        new CustomEvent("bundle:addedToCart", {
                            detail: {
                                bundleId: this.bundleId,
                                productIds: cartItems.map((item) => item.id),
                                totalValue: totalValue,
                                discountValue: discountValue,
                                bundle: this.bundle,
                                cartItems,
                                discountConfig: newDiscount,
                            },
                            bubbles: true,
                        }),
                    );
                }

                // Update cart count in header
                await updateCartCount();

                // Handle redirect based on settings
                handleCartRedirect(
                    this.redirectAfterCart,
                    this.bundle,
                    this.lazyLoadImages,
                );
            } catch (error) {
                console.error("[RadiusBundle] Add to cart error:", error);
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "Failed to add bundle to cart";
                showToast(errorMessage, "error");
            } finally {
                button.classList.remove("is-loading");

                const addedLabel =
                    this.bundleStructure?.labels?.addedText ?? "Added!";
                if (buttonTextEl) {
                    buttonTextEl.textContent = addedLabel;
                }
                button.classList.add("is-added");

                setTimeout(() => {
                    if (buttonTextEl) {
                        buttonTextEl.textContent = originalText;
                    }
                    button.classList.remove("is-added");
                    button.disabled = false;
                }, 1500);
            }
        }

        destroy(): void {
            this.abortController.abort();
            this.buyNowObserver?.disconnect();
            this.viewObserver?.disconnect();
            this.slider?.destroy();
            if (this.buyNowTimeout) clearTimeout(this.buyNowTimeout);
            if (this.viewTimeout) clearTimeout(this.viewTimeout);
        }
    }

    /**
     * Renders theme-editor placeholders for products without bundles.
     * The placeholder div is output by Liquid when in design_mode.
     */
    function initPlaceholders(): void {
        const placeholders = document.querySelectorAll<HTMLElement>(
            ".radius-bundle-placeholder",
        );

        placeholders.forEach((el) => {
            if (el.childElementCount > 0) return;

            const title = document.createElement("div");
            title.className = "radius-bundle-placeholder__title";
            title.textContent = "Radius Bundles";

            const desc = document.createElement("div");
            desc.className = "radius-bundle-placeholder__desc";
            desc.textContent =
                "This widget displays only on products that are part of a bundle. Preview a bundled product to see the widget in action.";

            el.append(title, desc);
        });
    }

    /**
     * Initializes radius bundles
     */
    function initRadiusBundles(): void {
        const bundles = document.querySelectorAll<HTMLElement>(
            ".radius-bundle[data-bundle-id]",
        );

        bundles.forEach((container) => {
            try {
                new RadiusBundleWidget(container);
            } catch (error) {
                console.error(
                    "[RadiusBundle] Failed to initialize widget:",
                    error,
                );
            }
        });

        initPlaceholders();
    }

    // Auto-initialize
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initRadiusBundles);
    } else {
        initRadiusBundles();
    }

    (window as any).RadiusBundleWidget = RadiusBundleWidget;
})();
