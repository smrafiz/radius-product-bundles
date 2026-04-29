import "./scss/radius-bundles.scss";

/**
 * Radius Bundles - Analytics & Cart Management
 */

(function () {
    "use strict";

    /**
     * Gets locale-aware path using Shopify's routes API
     * Handles multi-language stores where paths need locale prefix (e.g., /fr/cart)
     */
    function getLocalePath(path: string): string {
        const root = (window as any).Shopify?.routes?.root || "/";
        return `${root}${path.replace(/^\//, "")}`;
    }

    /**
     * Radius Bundles Configuration Interface
     */
    interface RadiusBundlesConfig {
        shop: string;
        customerId: string;
        pageType: string;
        template: string;
        currentProductId: string;
        enableAnalytics: boolean;
        showSavingsBanner: boolean;
        activeBundles: Record<string, BundleMetafieldData> | null;
        bannerIcon?: string;
        bannerLabels?: {
            savingText: string;
            customPriceText: string;
            freeShippingQualifyText: string;
            freeShippingText: string;
        };
    }

    /**
     * Bundle Metafield Data Interface
     */
    interface BundleMetafieldData {
        status: string;
        bundleType?: string;
        discountType: string;
        discountValue: number;
        freeShipping: boolean;
        minOrderValue: number;
        maxDiscountAmount: number;
        discountApplication: string;
        discountedProductIds: string[];
        productCount?: number;
        productIds: string[];
        volumeTiers?: {
            discountType: string;
            openEnded?: boolean;
            tiers: Array<{ minQuantity: number; discount: number }>;
        };
    }

    /**
     * Analytics Event Interface
     */
    interface AnalyticsEvent {
        type: "bundle_view" | "bundle_add_to_cart" | "page_view";
        bundleId?: string;
        productId?: string;
        customerId?: string | null;
        productIds?: string[];
        totalValue?: number;
        discountValue?: number;
        pageType?: string;
        template?: string;
        url?: string;
        timestamp: string;
    }

    /**
     * Cart Response Interface
     */
    interface CartResponse {
        token: string;
        item_count: number;
        items: CartItem[];
        attributes: Record<string, string>;
    }

    /**
     * Cart Item Interface
     */
    interface CartItem {
        id: string;
        quantity: number;
        properties?: Record<string, string>;
    }

    /**
     * Discount Config Interface
     */
    interface DiscountConfig {
        bundleId: string;
        bundleName: string;
        discountType: string;
        discountValue: number;
        minOrderValue: number;
        maxDiscountAmount: number;
        discountApplication: string;
        discountedProductIds: string[];
        freeShipping: boolean;
    }

    /**
     * Analytics Class
     */
    class Analytics {
        private readonly config: RadiusBundlesConfig;
        private readonly apiEndpoint: string = "/apps/radius-bundles/analytics";

        constructor(config: RadiusBundlesConfig) {
            this.config = config;
        }

        public async track(
            eventType: AnalyticsEvent["type"],
            data: Partial<AnalyticsEvent> = {},
        ): Promise<void> {
            if (!this.config.enableAnalytics) {
                return;
            }

            if ((window as any).Shopify?.designMode) {
                return;
            }

            if (!this.config.shop) {
                console.error("[RadiusBundles] Missing shop configuration");
                return;
            }

            const payload: AnalyticsEvent = {
                type: eventType,
                customerId: this.config.customerId || null,
                timestamp: new Date().toISOString(),
                ...data,
            };

            try {
                const url = `${this.apiEndpoint}?shop=${encodeURIComponent(this.config.shop)}`;

                const response = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    const error = await response.json();
                    console.error("[RadiusBundles] Tracking failed:", error);
                    return;
                }

                const result = await response.json();
            } catch (error) {
                console.error("[RadiusBundles] Tracking error:", error);
            }
        }

        public trackBundleView(
            bundleId: string,
            productId: string | null = null,
        ): void {
            void this.track("bundle_view", {
                bundleId,
                productId: productId || undefined,
                pageType: this.config.pageType,
                url: window.location.href,
            });
        }

        public trackAddToCart(
            bundleId: string,
            bundleData: {
                productIds?: string[];
                totalValue?: number;
                discountValue?: number;
            } = {},
        ): void {
            void this.track("bundle_add_to_cart", {
                bundleId,
                productIds: bundleData.productIds || [],
                totalValue: bundleData.totalValue || 0,
                discountValue: bundleData.discountValue || 0,
            });
        }

        public trackPageView(): void {
            void this.track("page_view", {
                pageType: this.config.pageType,
                template: this.config.template,
                url: window.location.href,
            });
        }
    }

    /**
     * Cart Cleanup Class
     */
    class CartCleanup {
        private readonly config: RadiusBundlesConfig;
        private isRunning: boolean = false;
        private debounceTimer: number | null = null;
        private readonly debounceDelay: number = 500;
        private originalFetch: typeof window.fetch | null = null;
        private boundTrigger: (() => void) | null = null;

        constructor(config: RadiusBundlesConfig) {
            this.config = config;
        }

        public init(): void {
            this.interceptFetch();
            this.attachEventListeners();
            setTimeout(() => this.cleanup(), this.debounceDelay);
        }

        public isBundleActive(bundleId: string): boolean {
            const activeBundles = this.config.activeBundles;
            if (!activeBundles) return true;

            const bundle = activeBundles[bundleId];
            return bundle && bundle.status === "ACTIVE";
        }

        public getBundleSettings(bundleId: string): BundleMetafieldData | null {
            const activeBundles = this.config.activeBundles;
            if (!activeBundles) return null;

            return activeBundles[bundleId] || null;
        }

        public async cleanup(): Promise<void> {
            if (this.isRunning) return;
            this.isRunning = true;

            try {
                const cart = await this.fetchCart();

                if (!cart.attributes?._radiusDiscounts) {
                    this.isRunning = false;
                    return;
                }

                let bundles: DiscountConfig[];
                try {
                    bundles = JSON.parse(cart.attributes._radiusDiscounts);
                } catch {
                    await this.updateAttributes({ _radiusDiscounts: "" });
                    this.isRunning = false;
                    return;
                }

                if (!Array.isArray(bundles) || bundles.length === 0) {
                    this.isRunning = false;
                    return;
                }

                const bundleItemCounts = this.countBundleItems(cart.items);

                let hasChanges = false;
                const validBundles: DiscountConfig[] = [];

                for (const bundle of bundles) {
                    const itemCount = bundleItemCounts[bundle.bundleId] || 0;
                    const settings = this.getBundleSettings(bundle.bundleId);
                    const expectedCount = settings?.productCount || 1;
                    const hasItems = itemCount >= expectedCount;
                    const isActive = this.isBundleActive(bundle.bundleId);

                    if (!hasItems || !isActive) {
                        hasChanges = true;
                        continue;
                    }

                    const latestSettings = this.getBundleSettings(
                        bundle.bundleId,
                    );

                    if (latestSettings) {
                        const settingsChanged = this.hasSettingsChanged(
                            bundle,
                            latestSettings,
                        );

                        if (settingsChanged) {
                            hasChanges = true;
                        }

                        validBundles.push({
                            ...bundle,
                            discountType: latestSettings.discountType,
                            discountValue: latestSettings.discountValue,
                            freeShipping: latestSettings.freeShipping,
                            minOrderValue: latestSettings.minOrderValue,
                            maxDiscountAmount: latestSettings.maxDiscountAmount,
                            discountApplication:
                                latestSettings.discountApplication,
                            discountedProductIds:
                                latestSettings.discountedProductIds,
                        });
                    } else {
                        validBundles.push(bundle);
                    }
                }

                if (hasChanges || validBundles.length !== bundles.length) {
                    const value =
                        validBundles.length > 0
                            ? JSON.stringify(validBundles)
                            : "";

                    await this.updateAttributes({ _radiusDiscounts: value });

                    const removed = bundles.length - validBundles.length;

                    this.dispatchCleanupEvent(
                        removed,
                        validBundles.length,
                        hasChanges,
                    );
                }
            } catch (error) {
                console.error("[RadiusBundles] Cleanup error:", error);
            } finally {
                this.isRunning = false;
            }
        }

        public trigger(): void {
            if (this.debounceTimer !== null) {
                clearTimeout(this.debounceTimer);
            }
            this.debounceTimer = window.setTimeout(
                () => this.cleanup(),
                this.debounceDelay,
            );
        }

        private async fetchCart(): Promise<CartResponse> {
            const response = await fetch(getLocalePath("/cart.js"));
            return response.json();
        }

        private async updateAttributes(
            attributes: Record<string, string>,
        ): Promise<void> {
            await fetch(getLocalePath("/cart/update.js"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ attributes }),
            });
        }

        private countBundleItems(items: CartItem[]): Record<string, number> {
            const counts: Record<string, number> = {};

            items.forEach((item) => {
                const bundleId = item.properties?._bundle_id;
                if (bundleId) {
                    counts[bundleId] = (counts[bundleId] || 0) + 1;
                }
            });

            return counts;
        }

        private hasSettingsChanged(
            bundle: DiscountConfig,
            latest: BundleMetafieldData,
        ): boolean {
            return (
                bundle.discountType !== latest.discountType ||
                bundle.discountValue !== latest.discountValue ||
                bundle.freeShipping !== latest.freeShipping ||
                bundle.minOrderValue !== latest.minOrderValue ||
                bundle.maxDiscountAmount !== latest.maxDiscountAmount
            );
        }

        private dispatchCleanupEvent(
            removed: number,
            remaining: number,
            synced: boolean,
        ): void {
            document.dispatchEvent(
                new CustomEvent("radiusBundles:cleanup", {
                    detail: { removed, remaining, synced },
                }),
            );
        }

        private interceptFetch(): void {
            this.originalFetch = window.fetch;
            const originalFetch = this.originalFetch;

            window.fetch = (
                input: RequestInfo | URL,
                init?: RequestInit,
            ): Promise<Response> => {
                const result = originalFetch.call(window, input, init);
                const url =
                    typeof input === "string"
                        ? input
                        : input instanceof URL
                          ? input.href
                          : (input as Request).url;
                const method = init?.method || "GET";

                if (
                    method === "POST" &&
                    (url.includes("/cart/change") ||
                        url.includes("/cart/update") ||
                        url.includes("/cart/clear"))
                ) {
                    result.then(() => this.trigger()).catch(() => {});
                }

                return result;
            };
        }

        private attachEventListeners(): void {
            this.boundTrigger = () => this.trigger();
            document.addEventListener("cart:refresh", this.boundTrigger);
            document.addEventListener("cart:updated", this.boundTrigger);
        }

        public destroy(): void {
            if (this.debounceTimer !== null) {
                clearTimeout(this.debounceTimer);
                this.debounceTimer = null;
            }
            if (this.originalFetch) {
                window.fetch = this.originalFetch;
                this.originalFetch = null;
            }
            if (this.boundTrigger) {
                document.removeEventListener("cart:refresh", this.boundTrigger);
                document.removeEventListener("cart:updated", this.boundTrigger);
                this.boundTrigger = null;
            }
        }
    }

    /**
     * Savings Banner Class
     */
    class SavingsBanner {
        private readonly config: RadiusBundlesConfig;
        private readonly cartCleanup: CartCleanup;
        private pollInterval: number | null = null;
        private lastCartToken: string | null = null;
        private lastItemCount: number | null = null;
        private boundUpdate: (() => void) | null = null;
        private boundCartChange: (() => void) | null = null;

        constructor(config: RadiusBundlesConfig, cartCleanup: CartCleanup) {
            this.config = config;
            this.cartCleanup = cartCleanup;
        }

        public init(): void {
            if (
                this.config.pageType !== "cart" ||
                !this.config.showSavingsBanner
            ) {
                return;
            }

            this.boundUpdate = () => this.update();
            this.boundCartChange = () => this.update();

            setTimeout(() => this.update(), 100);

            document.addEventListener("cart:updated", this.boundUpdate);
            document.addEventListener(
                "radiusBundles:cleanup",
                this.boundUpdate,
            );
            document.addEventListener("cart:change", this.boundCartChange);

            this.startPolling();
        }

        public async update(): Promise<void> {
            const container = document.getElementById("radius-bundle-savings");
            if (!container) return;

            try {
                const cart = await this.fetchCart();
                const bundlesRaw = cart.attributes?._radiusDiscounts;

                if (!bundlesRaw) {
                    this.hideBanner(container);
                    return;
                }

                let bundles: DiscountConfig[];
                try {
                    bundles = JSON.parse(bundlesRaw);
                } catch {
                    this.hideBanner(container);
                    return;
                }

                if (!bundles || bundles.length === 0) {
                    this.hideBanner(container);
                    return;
                }

                const bundleItemCounts = this.countBundleItems(cart.items);
                const highlightColor =
                    container.dataset.highlightColor || "#303030";
                const messages = this.buildMessages(
                    bundles,
                    bundleItemCounts,
                    highlightColor,
                );

                if (messages.length > 0) {
                    this.showBanner(container, messages);
                } else {
                    this.hideBanner(container);
                }
            } catch (error) {
                console.error("[RadiusBundles] Banner error:", error);
            }
        }

        public destroy(): void {
            if (this.pollInterval !== null) {
                clearInterval(this.pollInterval);
                this.pollInterval = null;
            }
            if (this.boundUpdate) {
                document.removeEventListener("cart:updated", this.boundUpdate);
                document.removeEventListener(
                    "radiusBundles:cleanup",
                    this.boundUpdate,
                );
                this.boundUpdate = null;
            }
            if (this.boundCartChange) {
                document.removeEventListener(
                    "cart:change",
                    this.boundCartChange,
                );
                this.boundCartChange = null;
            }
        }

        private async fetchCart(): Promise<CartResponse> {
            const response = await fetch(getLocalePath("/cart.js"));
            return response.json();
        }

        private countBundleItems(
            items: CartItem[],
        ): Record<string, { lines: number; totalQty: number }> {
            const counts: Record<string, { lines: number; totalQty: number }> = {};

            items.forEach((item) => {
                const bundleId = item.properties?._bundle_id;
                if (bundleId) {
                    if (!counts[bundleId]) {
                        counts[bundleId] = { lines: 0, totalQty: 0 };
                    }
                    counts[bundleId].lines += 1;
                    counts[bundleId].totalQty += item.quantity || 0;
                }
            });

            return counts;
        }

        private buildMessages(
            bundles: DiscountConfig[],
            itemCounts: Record<string, { lines: number; totalQty: number }>,
            highlightColor: string,
        ): string[] {
            const messages: string[] = [];

            bundles.forEach((bundle) => {
                const counts = itemCounts[bundle.bundleId] || {
                    lines: 0,
                    totalQty: 0,
                };
                const settings = this.cartCleanup.getBundleSettings(bundle.bundleId);
                const isVolume = settings?.bundleType === "VOLUME_DISCOUNT";
                const expectedCount = settings?.productCount || 1;
                const passesGate = isVolume
                    ? counts.totalQty >= 1
                    : counts.lines >= expectedCount;

                if (
                    passesGate &&
                    this.cartCleanup.isBundleActive(bundle.bundleId)
                ) {
                    const name = bundle.bundleName || "this bundle";
                    const message = this.formatBundleHtml(
                        bundle,
                        name,
                        highlightColor,
                        isVolume ? counts.totalQty : counts.lines,
                        settings,
                    );

                    if (message) {
                        messages.push(message);
                    }
                }
            });

            return messages;
        }

        private formatMoney(amount: number): string {
            const cents = Math.round(amount * 100);
            if (typeof (window as any).Shopify?.formatMoney === "function") {
                return (window as any).Shopify.formatMoney(cents);
            }
            const currency = (window as any).Shopify?.currency?.active || "USD";
            const locale = (window as any).Shopify?.locale || "en";
            try {
                return new Intl.NumberFormat(locale, {
                    style: "currency",
                    currency,
                    currencyDisplay: "narrowSymbol",
                }).format(amount);
            } catch {
                return `${currency} ${amount.toFixed(2)}`;
            }
        }

        private formatBundleHtml(
            bundle: DiscountConfig,
            name: string,
            highlightColor: string,
            itemCount?: number,
            settings?: BundleMetafieldData | null,
        ): string | null {
            const hl = (text: string) =>
                `<strong style="color:${highlightColor}">${text}</strong>`;

            const labels = this.config.bannerLabels;

            // For volume discounts, resolve the active tier
            if (settings?.bundleType === "VOLUME_DISCOUNT" && settings.volumeTiers) {
                const volConfig = typeof settings.volumeTiers === "string"
                    ? JSON.parse(settings.volumeTiers as string)
                    : settings.volumeTiers;
                const tiers = volConfig?.tiers as Array<{ minQuantity: number; discount: number }>;
                if (tiers?.length && itemCount) {
                    const activeTier = [...tiers]
                        .sort((a, b) => b.minQuantity - a.minQuantity)
                        .find((t) => itemCount >= t.minQuantity);
                    if (activeTier) {
                        const discountType = volConfig.discountType || bundle.discountType;
                        const template = labels?.savingText || "You're saving {discount} with {name}";
                        const discountText = discountType === "PERCENTAGE"
                            ? activeTier.discount + "%"
                            : this.formatMoney(activeTier.discount);
                        return template
                            .replace("{discount}", hl(discountText))
                            .replace("{name}", name);
                    }
                }
            }

            switch (bundle.discountType) {
                case "PERCENTAGE": {
                    const template =
                        labels?.savingText ||
                        "You're saving {discount} with {name}";
                    return template
                        .replace("{discount}", hl(bundle.discountValue + "%"))
                        .replace("{name}", name);
                }

                case "FIXED_AMOUNT": {
                    const template =
                        labels?.savingText ||
                        "You're saving {discount} with {name}";
                    return template
                        .replace(
                            "{discount}",
                            hl(this.formatMoney(bundle.discountValue)),
                        )
                        .replace("{name}", name);
                }

                case "CUSTOM_PRICE": {
                    const template =
                        labels?.customPriceText ||
                        "Special price: {price} for {name}";
                    return template
                        .replace(
                            "{price}",
                            hl(this.formatMoney(bundle.discountValue)),
                        )
                        .replace("{name}", name);
                }

                case "NO_DISCOUNT":
                    if (bundle.freeShipping) {
                        const template =
                            labels?.freeShippingQualifyText ||
                            "{name} qualifies for free shipping!";
                        return template.replace("{name}", name);
                    }
                    return null;

                default:
                    return null;
            }
        }

        private showBanner(container: HTMLElement, messages: string[]): void {
            const contentEl = container.querySelector(
                ".radius-savings-banner__content",
            );
            if (!contentEl) return;

            // Get the icon from config
            const icon = this.config.bannerIcon || "";

            let html: string;

            html = `<ul class="radius-savings-banner__list">${messages
                .map(
                    (m) =>
                        `<li>${icon ? `<span class="radius-savings-banner__list-icon">${icon}</span>` : ""}${m}</li>`,
                )
                .join("")}</ul>`;

            contentEl.innerHTML = html;
            container.style.display = "block";

            this.moveToCartForm(container);
        }

        private hideBanner(container: HTMLElement): void {
            container.style.display = "none";
        }

        private moveToCartForm(container: HTMLElement): void {
            const form =
                document.querySelector("form#cart") ||
                document.querySelector(".cart__contents") ||
                document.querySelector('#MainContent form[action="/cart"]');

            if (form && container.parentNode !== form) {
                form.insertBefore(container, form.firstChild);
            }
        }

        private startPolling(): void {
            this.pollInterval = window.setInterval(async () => {
                try {
                    const cart = await this.fetchCart();
                    if (
                        cart.token !== this.lastCartToken ||
                        cart.item_count !== this.lastItemCount
                    ) {
                        this.lastCartToken = cart.token;
                        this.lastItemCount = cart.item_count;
                        void this.update();
                    }
                } catch {
                    // Silently fail
                }
            }, 10000);
        }

        private escapeHtml(text: string): string {
            const div = document.createElement("div");
            div.textContent = text;
            return div.innerHTML;
        }
    }

    /**
     * Radius Bundles Manager Class
     */
    class RadiusBundlesManager {
        private readonly config: RadiusBundlesConfig;
        private readonly analytics: Analytics;
        private readonly cartCleanup: CartCleanup;
        private readonly savingsBanner: SavingsBanner;
        private viewedBundles: Set<string> = new Set();

        constructor(config: RadiusBundlesConfig) {
            this.config = config;
            this.analytics = new Analytics(config);
            this.cartCleanup = new CartCleanup(config);
            this.savingsBanner = new SavingsBanner(config, this.cartCleanup);
        }

        public init(): void {
            if (this.config.enableAnalytics && this.isAnalyticsRelevantPage()) {
                if (document.readyState === "loading") {
                    document.addEventListener("DOMContentLoaded", () => {
                        this.analytics.trackPageView();
                    });
                } else {
                    this.analytics.trackPageView();
                }
            }

            this.cartCleanup.init();
            this.savingsBanner.init();
            this.attachBundleEventListeners();

            // Export for external access
            if (!(window as any).RadiusBundles) {
                (window as any).RadiusBundles = { config: this.config };
            }
            (window as any).RadiusBundles.analytics = this.analytics;
            (window as any).RadiusBundles.cartCleanup = this.cartCleanup;
            (window as any).RadiusBundles.savingsBanner = this.savingsBanner;
        }

        public destroy(): void {
            this.cartCleanup.destroy();
            this.savingsBanner.destroy();
        }

        private isAnalyticsRelevantPage(): boolean {
            const pageType = this.config.pageType;

            if (pageType === "cart") {
                return true;
            }

            if (pageType === "product") {
                const productId = this.config.currentProductId;

                if (!productId || !this.config.activeBundles) {
                    return false;
                }

                const gid = `gid://shopify/Product/${productId}`;
                return Object.values(this.config.activeBundles).some(
                    (bundle) =>
                        bundle.productIds?.includes(productId) ||
                        bundle.productIds?.includes(gid),
                );
            }

            return false;
        }

        private attachBundleEventListeners(): void {
            document.addEventListener("bundle:viewed", (e: Event) => {
                const event = e as CustomEvent;
                const { bundleId, productId } = event.detail;

                // Create unique key (per bundle per page)
                const viewKey = `${bundleId}:${window.location.pathname}`;

                if (this.viewedBundles.has(viewKey)) {
                    return;
                }

                this.viewedBundles.add(viewKey);

                this.analytics.trackBundleView(bundleId, productId);
            });

            document.addEventListener("bundle:addedToCart", (e: Event) => {
                const event = e as CustomEvent;
                this.analytics.trackAddToCart(
                    event.detail.bundleId,
                    event.detail,
                );
            });
        }
    }

    /**
     * Initializes Radius Bundles
     */
    function initRadiusBundles(): void {
        const config = (window as any).RadiusBundles?.config;

        if (!config) {
            console.error("[RadiusBundles] Configuration not found");
            return;
        }

        const manager = new RadiusBundlesManager(config);
        manager.init();
    }

    // Auto-initialize
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initRadiusBundles);
    } else {
        initRadiusBundles();
    }
})();
