import "./scss/radius-bundles.scss";

/**
 * Radius Bundles - Analytics & Cart Management
 */

(function () {
    "use strict";

    /**
     * Radius Bundles Configuration Interface
     */
    interface RadiusBundlesConfig {
        shop: string;
        customerId: string;
        pageType: string;
        template: string;
        enableAnalytics: boolean;
        showSavingsBanner: boolean;
        activeBundles: Record<string, BundleMetafieldData> | null;
    }

    /**
     * Bundle Metafield Data Interface
     */
    interface BundleMetafieldData {
        status: string;
        discountType: string;
        discountValue: number;
        freeShipping: boolean;
        minOrderValue: number;
        maxDiscountAmount: number;
        discountApplication: string;
        discountedProductIds: string[];
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
        requiredLineCount: number;
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
        private readonly apiEndpoint: string = "/apps/bundles/analytics";

        constructor(config: RadiusBundlesConfig) {
            this.config = config;
        }

        public async track(
            eventType: AnalyticsEvent["type"],
            data: Partial<AnalyticsEvent> = {},
        ): Promise<void> {
            if (!this.config.enableAnalytics) {
                console.log("[RadiusBundles] Analytics disabled");
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
                console.log("[RadiusBundles] Tracked:", eventType, result);
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
                    console.log("[RadiusBundles] Cleared invalid bundle data");
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
                    const required = bundle.requiredLineCount || 1;
                    const hasItems = itemCount >= required;
                    const isActive = this.isBundleActive(bundle.bundleId);

                    if (!hasItems || !isActive) {
                        hasChanges = true;
                        if (!isActive) {
                            console.log(
                                "[RadiusBundles] Removed inactive bundle:",
                                bundle.bundleId,
                            );
                        }
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
                            console.log(
                                "[RadiusBundles] Synced settings for bundle:",
                                bundle.bundleId,
                            );
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
                    if (removed > 0) {
                        console.log(
                            "[RadiusBundles] Removed",
                            removed,
                            "bundle(s)",
                        );
                    }

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
            const response = await fetch("/cart.js");
            return response.json();
        }

        private async updateAttributes(
            attributes: Record<string, string>,
        ): Promise<void> {
            await fetch("/cart/update.js", {
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
            const originalFetch = window.fetch;

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
            document.addEventListener("cart:refresh", () => this.trigger());
            document.addEventListener("cart:updated", () => this.trigger());
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

            setTimeout(() => this.update(), 100);

            document.addEventListener("cart:updated", () => this.update());
            document.addEventListener("radiusBundles:cleanup", () =>
                this.update(),
            );

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
        }

        private async fetchCart(): Promise<CartResponse> {
            const response = await fetch("/cart.js");
            return response.json();
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

        private buildMessages(
            bundles: DiscountConfig[],
            itemCounts: Record<string, number>,
            highlightColor: string,
        ): string[] {
            const messages: string[] = [];

            bundles.forEach((bundle) => {
                const itemCount = itemCounts[bundle.bundleId] || 0;
                const required = bundle.requiredLineCount || 0;

                if (
                    itemCount >= required &&
                    required > 0 &&
                    this.cartCleanup.isBundleActive(bundle.bundleId)
                ) {
                    const name = bundle.bundleName || "this bundle";
                    const message = this.formatBundleHtml(
                        bundle,
                        name,
                        highlightColor,
                    );

                    if (message) {
                        messages.push(message);
                    }
                }
            });

            return messages;
        }

        private formatBundleHtml(
            bundle: DiscountConfig,
            name: string,
            highlightColor: string,
        ): string | null {
            const escapedName = this.escapeHtml(name);
            const hl = (text: string) =>
                `<strong style="color:${highlightColor}">${text}</strong>`;

            switch (bundle.discountType) {
                case "PERCENTAGE":
                    return `You're saving ${hl(bundle.discountValue + "%")} with ${escapedName}`;

                case "FIXED_AMOUNT":
                    return `You're saving ${hl("$" + bundle.discountValue.toFixed(2))} with ${escapedName}`;

                case "CUSTOM_PRICE":
                    return `Special price: ${hl("$" + bundle.discountValue.toFixed(2))} for ${escapedName}`;

                case "NO_DISCOUNT":
                    if (bundle.freeShipping) {
                        return `${escapedName} qualifies for ${hl("free shipping")}!`;
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

            let html =
                messages.length === 1
                    ? messages[0]
                    : `<ul class="radius-savings-banner__list">${messages
                          .map((m) => `<li>${m}</li>`)
                          .join("")}</ul>`;

            const hasFreeShipping = messages.some((m) =>
                m.includes("free shipping"),
            );
            if (
                hasFreeShipping &&
                !messages.some((m) => m.includes("Free shipping"))
            ) {
                html +=
                    '<div class="radius-savings-banner--free-shipping">🚚 Free shipping included!</div>';
            }

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
            }, 1500);
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
            console.log("[RadiusBundles] Initializing...", {
                shop: this.config.shop,
                pageType: this.config.pageType,
                analyticsEnabled: this.config.enableAnalytics,
            });

            if (this.config.enableAnalytics) {
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

            console.log("[RadiusBundles] Initialized successfully");
        }

        private attachBundleEventListeners(): void {
            document.addEventListener("bundle:viewed", (e: Event) => {
                const event = e as CustomEvent;
                const { bundleId, productId } = event.detail;

                // Create unique key (per bundle per page)
                const viewKey = `${bundleId}:${window.location.pathname}`;

                if (this.viewedBundles.has(viewKey)) {
                    console.log(
                        "[RadiusBundles] Bundle already viewed in this session:",
                        bundleId,
                    );
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
