"use client";

import type { WidgetLabels } from "@/shared";
import {
    BundleWidget,
    getCurrencySymbol,
    PreviewProduct,
    ROUTES,
    useShopSettings,
    WidgetAddToCart,
    WidgetCarousel,
    WidgetChecklist,
    WidgetClassicCard,
    WidgetCompact,
    WidgetCompactGrid,
    WidgetDisplayOptions,
    WidgetGrid,
    WidgetList,
    WidgetMinimalist,
    WidgetPricing,
    WidgetSleek,
    WidgetSplitDeal,
} from "@/shared";
import {
    BundlePreviewStatus,
    BundlePriority,
    DiscountApplication,
    DisplaySettings,
    formatPrice,
    useBundlePreviewPricing,
    useBundleStore,
    VolumeDiscountConfig,
} from "@/features/bundles";
import {
    CustomizerStyles,
    getCardRadius,
    getPadding,
    getShadow,
    useCustomizerModal,
    useCustomizerStore,
    useSettingsStore,
    VolumeCalculator,
    type VolumeLayoutTier,
    VolumePricingCards,
    VolumeSlider,
    VolumeTierList,
} from "@/features/settings";
import { useCallback, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useTranslations } from "@/lib/i18n/provider";
import { PREVIEW_LABELS } from "@/shared/constants/bundle-widget.constants";
import { RESPONSIVE_FIELDS } from "@/features/settings/configs/customizer.config";
import { BOGO_LAYOUT_VALUES } from "@/features/bundles/constants/bundle-details.constants";
import { DEFAULT_CUSTOMIZER_STYLES } from "@/features/settings/constants/defaults.constants";

import "@/styles/components/bundle.css";

function buildVolumeLayoutTiers(
    config: VolumeDiscountConfig,
    currencyCode: string | undefined,
    basePrice?: number,
): ReadonlyArray<VolumeLayoutTier> {
    return config.tiers.map((tier, index) => {
        const isLast = index === config.tiers.length - 1;

        let price = "";
        let comparePrice: string | undefined;
        let savings: string | undefined;

        if (config.discountType === "PERCENTAGE") {
            savings = `Save ${Math.round(tier.discount)}%`;
            if (basePrice && basePrice > 0) {
                const discountedPrice = basePrice * (1 - tier.discount / 100);
                price = formatPrice(Math.round(discountedPrice * 100) / 100, currencyCode);
                comparePrice = formatPrice(basePrice, currencyCode);
            } else {
                price = `${Math.round(tier.discount)}% off`;
            }
        } else {
            savings = `Save ${formatPrice(tier.discount, currencyCode)} off`;
            if (basePrice && basePrice > 0) {
                const discountedPrice = Math.max(0, basePrice - tier.discount);
                price = formatPrice(Math.round(discountedPrice * 100) / 100, currencyCode);
                comparePrice = formatPrice(basePrice, currencyCode);
            } else {
                price = `-${formatPrice(tier.discount, currencyCode)}`;
            }
        }

        const badge = tier.badge?.text
            ? { text: tier.badge.text, style: tier.badge.style }
            : undefined;

        const discountLabel = config.discountType === "PERCENTAGE"
            ? `${Math.round(tier.discount)}%`
            : formatPrice(tier.discount, currencyCode);

        const resolvedTitle = (tier.title || "")
            .replace("{quantity}", String(tier.minQuantity))
            .replace("{discount}", discountLabel);

        const resolvedSubtitle = (tier.subtitle || "")
            .replace("{quantity}", String(tier.minQuantity))
            .replace("{discount}", discountLabel);

        return {
            qty: tier.minQuantity,
            discount: tier.discount,
            price,
            comparePrice,
            savings,
            title: resolvedTitle || undefined,
            subtitle: resolvedSubtitle || undefined,
            badge,
            isDefault: !!tier.isDefault,
        };
    });
}

function VolumeAddToCart({
    styles,
    cartButtonText,
    displayOptions,
}: {
    styles: CustomizerStyles;
    cartButtonText?: string;
    displayOptions: WidgetDisplayOptions;
}) {
    const t = useTranslations("Bundles.Creation.Preview");
    const bgColor = styles.buttonBgColor || styles.primaryColor;
    const isOutline = styles.buttonStyle === "outline";
    const isFullWidth = styles.buttonWidth === "full";
    const borderRadius = styles.cornerStyle === "modern" ? "8px" : "4px";

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginTop: "16px",
                justifyContent: isFullWidth ? "stretch" : "flex-start",
            }}
        >
            {displayOptions?.showQuantity && (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    border: `1px solid ${styles.borderColor || "#d1d5db"}`,
                    borderRadius,
                    overflow: "hidden",
                    flexShrink: 0,
                }}
            >
                <button
                    style={{
                        width: 36,
                        height: 42,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 16,
                        color: styles.textColor,
                    }}
                    aria-label={t("decreaseQuantity")}
                >
                    −
                </button>
                <span
                    style={{
                        width: 36,
                        height: 42,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        fontWeight: 500,
                        color: styles.textColor,
                        borderLeft: `1px solid ${styles.borderColor || "#d1d5db"}`,
                        borderRight: `1px solid ${styles.borderColor || "#d1d5db"}`,
                    }}
                >
                    1
                </span>
                <button
                    style={{
                        width: 36,
                        height: 42,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 16,
                        color: styles.textColor,
                    }}
                    aria-label={t("increaseQuantity")}
                >
                    +
                </button>
            </div>
                )}
            <button
                style={{
                    flex: isFullWidth ? 1 : undefined,
                    padding: "10px 24px",
                    fontSize: 14,
                    fontWeight: 600,
                    borderRadius,
                    cursor: "pointer",
                    transition: "opacity 0.2s ease",
                    backgroundColor: isOutline ? "transparent" : bgColor,
                    color: isOutline ? bgColor : "#ffffff",
                    border: isOutline ? `2px solid ${bgColor}` : "none",
                }}
            >
                {cartButtonText || PREVIEW_LABELS.addToCartText}
            </button>
        </div>
    );
}

function RenderVolumeLayout({
    layout,
    config,
    styles,
    currencyCode,
    firstProduct,
    displayOptions,
    labels,
}: {
    layout: DisplaySettings["layout"];
    config: VolumeDiscountConfig;
    styles: CustomizerStyles;
    currencyCode?: string;
    firstProduct?: PreviewProduct;
    displayOptions: WidgetDisplayOptions;
    labels?: WidgetLabels;
}) {
    const rawBasePrice = firstProduct?.compareAtPrice || firstProduct?.price;
    const numericBasePrice = rawBasePrice
        ? parseFloat(rawBasePrice.replace(/[^0-9.]/g, "")) || undefined
        : undefined;
    const tiers = buildVolumeLayoutTiers(config, currencyCode, numericBasePrice);
    const highlightColor = styles.primaryColor;
    const product = firstProduct
        ? {
              title: firstProduct.title,
              image: firstProduct.image,
              basePrice: rawBasePrice || firstProduct.price,
          }
        : undefined;

    const layoutProps = { tiers, product, highlightColor, styles, displayOptions, labels };

    switch (layout) {
        case "VOLUME_PRICING_CARDS":
            return <VolumePricingCards {...layoutProps} />;
        case "VOLUME_SLIDER":
            return <VolumeSlider {...layoutProps} />;
        case "VOLUME_CALCULATOR":
            return <VolumeCalculator {...layoutProps} />;
        case "VOLUME_TIER_LIST":
        default:
            return <VolumeTierList {...layoutProps} />;
    }
}

function useWidgetStyles(
    device: "desktop" | "tablet" | "mobile" = "mobile",
): CustomizerStyles {
    const serverData = useSettingsStore((s) => s.serverData);
    const bundleType = useBundleStore((s) => s.bundleData.type);

    return useMemo(() => {
        const globalStyles = serverData?.globalStyles as
            | Partial<CustomizerStyles>
            | undefined;
        const base = {
            ...DEFAULT_CUSTOMIZER_STYLES,
            ...globalStyles,
        };
        const typeOverride = bundleType
            ? base.bundleTypeOverrides?.[bundleType]
            : null;
        const withType = typeOverride ? { ...base, ...typeOverride } : base;
        if (device !== "desktop") {
            const deviceMap = globalStyles?.[device];
            if (deviceMap) {
                const filtered = Object.fromEntries(
                    Object.entries(deviceMap).filter(([k]) =>
                        RESPONSIVE_FIELDS.has(k),
                    ),
                );
                return { ...withType, ...filtered };
            }
        }
        return withType;
    }, [serverData, bundleType, device]);
}

function usePreviewProducts(currencyCode?: string): PreviewProduct[] {
    const { selectedItems, bundleData, variantDataMap } = useBundleStore(
        useShallow((s) => ({
            selectedItems: s.selectedItems,
            bundleData: s.bundleData,
            variantDataMap: s.variantDataMap,
        })),
    );
    const isBxgy =
        bundleData.type === "BOGO" || bundleData.type === "BUY_X_GET_Y";

    return useMemo(() => {
        const discountType = bundleData.discountType;
        const discountValue = bundleData.discountValue ?? 0;

        if (isBxgy) {
            const rows: PreviewProduct[] = [];
            for (const item of selectedItems) {
                const isReward = item.role === "REWARD";
                const vids = item.variantIds ?? [];
                // Check if this should expand into per-variant rows
                const firstVarData = variantDataMap[vids[0]];
                const isDefault =
                    vids.length === 1 &&
                    (firstVarData?.title === "Default Title" ||
                        firstVarData?.title === "Default");
                const shouldExpand = vids.length > 1 && !isDefault;

                const idsToRender = shouldExpand ? vids : [item.variantId || item.id];

                idsToRender.forEach((vid, vi) => {
                    const vData = variantDataMap[vid];
                    const unitPrice = parseFloat(
                        (shouldExpand && vData?.price) || item.price || "0",
                    ) || 0;
                    let dp = unitPrice;

                    if (isReward && discountType && discountValue > 0) {
                        switch (discountType) {
                            case "PERCENTAGE":
                                dp = unitPrice * (1 - discountValue / 100);
                                break;
                            case "FIXED_AMOUNT":
                                dp = Math.max(0, unitPrice - discountValue);
                                break;
                            case "CUSTOM_PRICE":
                                dp = discountValue;
                                break;
                        }
                    }

                    dp = Math.round(dp * 100) / 100;
                    const hasDiscount = dp < unitPrice;
                    const vTitle = vData?.title;
                    const isDef =
                        vTitle === "Default Title" || vTitle === "Default";
                    rows.push({
                        id: shouldExpand ? `${item.id}-v${vi}` : item.id,
                        title: item.title,
                        variantId: vid,
                        variantTitle: vTitle && !isDef ? vTitle : undefined,
                        image: (shouldExpand && vData?.image) || item.image,
                        price: formatPrice(dp, currencyCode),
                        compareAtPrice: hasDiscount
                            ? formatPrice(unitPrice, currencyCode)
                            : undefined,
                        quantity: item.quantity,
                        url: item.url,
                        role: item.role,
                    });
                });
            }
            return rows;
        }

        const applyToSpecific = bundleData.discountApplication === DiscountApplication.PRODUCTS;
        const discountedIds = new Set(bundleData.discountedProductIds ?? []);

        const totalBundlePrice = selectedItems.reduce(
            (sum, item) => sum + (parseFloat(item.price) || 0) * item.quantity,
            0,
        );

        return selectedItems.map((item) => {
            const unitPrice = parseFloat(item.price) || 0;
            let discountedUnitPrice = unitPrice;

            const shouldDiscount =
                !applyToSpecific || discountedIds.has(item.productId);

            if (
                shouldDiscount &&
                discountType &&
                discountValue > 0 &&
                totalBundlePrice > 0
            ) {
                const lineTotal = unitPrice * item.quantity;
                const proportion = lineTotal / totalBundlePrice;

                switch (discountType) {
                    case "PERCENTAGE":
                        discountedUnitPrice =
                            unitPrice * (1 - discountValue / 100);
                        break;
                    case "FIXED_AMOUNT": {
                        const lineDiscount = discountValue * proportion;
                        discountedUnitPrice = Math.max(
                            0,
                            unitPrice - lineDiscount / item.quantity,
                        );
                        break;
                    }
                    case "CUSTOM_PRICE": {
                        const linePrice = discountValue * proportion;
                        discountedUnitPrice = linePrice / item.quantity;
                        break;
                    }
                }
            }

            discountedUnitPrice = Math.round(discountedUnitPrice * 100) / 100;
            const hasDiscount = discountedUnitPrice < unitPrice;
            return {
                id: item.id,
                title: item.title,
                variantId: item.variantId,
                variantTitle: item.selectedVariant?.title,
                image: item.image,
                price: formatPrice(discountedUnitPrice, currencyCode),
                compareAtPrice: hasDiscount
                    ? formatPrice(unitPrice, currencyCode)
                    : undefined,
                quantity: item.quantity,
                url: item.url,
            };
        });
    }, [
        selectedItems,
        isBxgy,
        bundleData.discountType,
        bundleData.discountValue,
        bundleData.discountApplication,
        bundleData.discountedProductIds,
        bundleData.maxDiscountAmount,
        variantDataMap,
        currencyCode,
    ]);
}

function useWidgetDisplayOptions(): WidgetDisplayOptions {
    const displaySettings = useBundleStore((s) => s.displaySettings);
    const freeShipping = useBundleStore((s) => s.bundleData.freeShipping);
    return {
        showImages: displaySettings.showImages,
        showPrices: displaySettings.showPrices,
        showComparePrices: displaySettings.showComparePrices,
        showQuantity: displaySettings.showQuantity,
        showSavingsBadge: displaySettings.showSavingsBadge,
        showSavings: displaySettings.showSavings,
        showFreeShipping: displaySettings.showFreeShipping && !!freeShipping,
        enableHyperLink: displaySettings.enableHyperLink,
    };
}

function useWidgetPricing(currencyCode?: string): WidgetPricing {
    const pricing = useBundlePreviewPricing();
    return {
        originalPrice: formatPrice(pricing.originalPrice, currencyCode),
        finalPrice: formatPrice(pricing.finalPrice, currencyCode),
        savingsAmount: formatPrice(pricing.discountAmount, currencyCode),
        savingsPercentage: pricing.savingsPercentage,
        hasDiscount: pricing.hasDiscount,
    };
}

function useWidgetLabels(): WidgetLabels {
    const serverData = useSettingsStore((s) => s.serverData);
    const savedLabels = serverData?.labels as
        | Record<string, string>
        | undefined;
    return useMemo(
        () => ({
            ...PREVIEW_LABELS,
            ...Object.fromEntries(
                Object.entries(savedLabels ?? {}).filter(
                    ([, val]) => val !== "",
                ),
            ),
        }),
        [savedLabels],
    );
}

function useBadgeText(labels: WidgetLabels): string {
    const t = useTranslations("Bundles.Creation.Preview");
    const { bundleData, selectedItems, variantDataMap } = useBundleStore(
        useShallow((s) => ({
            bundleData: s.bundleData,
            selectedItems: s.selectedItems,
            variantDataMap: s.variantDataMap,
        })),
    );
    const { currencyCode } = useShopSettings();
    const currencySymbol = getCurrencySymbol(currencyCode);

    if (labels.bogoBadgeText) return labels.bogoBadgeText;

    const countExpanded = (role: string) =>
        selectedItems
            .filter((i) => i.role === role)
            .reduce((sum, i) => {
                const vids = i.variantIds ?? [];
                const firstTitle = variantDataMap[vids[0]]?.title;
                const isDefault =
                    vids.length === 1 &&
                    (firstTitle === "Default Title" ||
                        firstTitle === "Default");
                const variantCount = vids.length > 1 && !isDefault ? vids.length : 1;
                return sum + variantCount * (i.quantity ?? 1);
            }, 0);
    const triggerCount = countExpanded("TRIGGER");
    const rewardCount = countExpanded("REWARD");
    const buy = triggerCount || (bundleData.buyQuantity ?? 1);
    const get = rewardCount || (bundleData.getQuantity ?? 1);
    const discountType = bundleData.discountType;
    const discountValue = bundleData.discountValue ?? 0;

    const buyWord = labels.bogoBuyText || t("bogoBuyFallback");
    const getWord = labels.bogoGetText || t("bogoGetFallback");
    const freeWord = labels.bogoFreeText || t("bogoFreeFallback");

    if (discountType === "PERCENTAGE" && discountValue === 100) {
        return `${buyWord} ${buy} ${getWord} ${get} ${freeWord}`;
    }
    if (discountType === "PERCENTAGE" && discountValue > 0) {
        return `${buyWord} ${buy} ${getWord} ${get} at ${discountValue}% Off`;
    }
    if (discountType === "FIXED_AMOUNT" && discountValue > 0) {
        return `${buyWord} ${buy} ${getWord} ${get} - ${currencySymbol}${discountValue} Off`;
    }
    return `${buyWord} ${buy} ${getWord} ${get}`;
}

function RenderLayout({
    layout,
    products,
    styles,
    displayOptions,
    pricing,
    cartButtonText,
    title,
    subtitle,
    badgeText,
    labels,
    activeDevice,
    bundleType,
}: {
    layout: DisplaySettings["layout"];
    products: PreviewProduct[];
    styles: CustomizerStyles;
    displayOptions: WidgetDisplayOptions;
    pricing?: WidgetPricing;
    cartButtonText?: string;
    title?: string;
    subtitle?: string;
    badgeText?: string;
    labels?: WidgetLabels;
    activeDevice?: "desktop" | "tablet" | "mobile";
    bundleType?: string;
}) {
    const t = useTranslations("Bundles.Creation.Preview");
    const layoutProps = {
        products,
        styles,
        displayOptions,
        bundleType,
        labels,
    };

    // Default values if empty or undefined
    const safeTitle = title?.trim() ? title : t("defaultTitle");
    const safeButtonText = cartButtonText?.trim()
        ? cartButtonText
        : t("defaultAddToCart");

    switch (layout) {
        case "GRID":
            return <WidgetGrid {...layoutProps} />;

        case "LIST":
            return <WidgetList {...layoutProps} />;

        case "CAROUSEL":
            return <WidgetCarousel {...layoutProps} />;

        case "COMPACT":
            return <WidgetCompact {...layoutProps} />;

        case "SLEEK":
            return (
                <WidgetSleek
                    {...layoutProps}
                    pricing={pricing}
                    cartButtonText={safeButtonText}
                    title={safeTitle}
                    subtitle={subtitle}
                    labels={labels}
                />
            );

        case "COMPACT_GRID":
            return (
                <WidgetCompactGrid
                    {...layoutProps}
                    pricing={pricing}
                    cartButtonText={safeButtonText}
                    title={safeTitle}
                    badgeText={badgeText}
                    labels={labels}
                    activeDevice={activeDevice}
                />
            );

        case "MINIMALIST":
            return (
                <WidgetMinimalist
                    {...layoutProps}
                    pricing={pricing}
                    cartButtonText={safeButtonText}
                    title={safeTitle}
                    subtitle={subtitle}
                    badgeText={badgeText}
                    labels={labels}
                    activeDevice={activeDevice}
                />
            );

        case "CHECKLIST":
            return (
                <WidgetChecklist
                    {...layoutProps}
                    pricing={pricing}
                    cartButtonText={safeButtonText}
                    title={safeTitle}
                    subtitle={subtitle}
                    labels={labels}
                />
            );

        case "SPLIT_DEAL":
            return (
                <WidgetSplitDeal
                    {...layoutProps}
                    pricing={pricing}
                    cartButtonText={safeButtonText}
                    title={safeTitle}
                    subtitle={subtitle}
                    badgeText={badgeText}
                    labels={labels}
                    activeDevice={activeDevice}
                />
            );

        case "CLASSIC_CARD":
            return (
                <WidgetClassicCard
                    {...layoutProps}
                    pricing={pricing}
                    cartButtonText={safeButtonText}
                    title={safeTitle}
                    subtitle={subtitle}
                    badgeText={badgeText}
                    labels={labels}
                    activeDevice={activeDevice}
                />
            );

        default:
            return <WidgetGrid {...layoutProps} />;
    }
}

export function BundlePreview() {
    const t = useTranslations("Bundles.Creation.Preview");
    const ta = useTranslations("Bundles.Creation.Appearance");
    const { appWindowRef, isSyncing } = useCustomizerModal();
    const { displaySettings, bundleData } = useBundleStore(
        useShallow((s) => ({
            displaySettings: s.displaySettings,
            bundleData: s.bundleData,
        })),
    );
    const { currencyCode } = useShopSettings();
    const isVolume = bundleData.type === "VOLUME_DISCOUNT";
    const volumeConfig = bundleData.volumeTiers as
        | VolumeDiscountConfig
        | undefined;

    const { setCustomizerSource } = useCustomizerStore();
    const styles = useWidgetStyles();
    const products = usePreviewProducts(currencyCode);
    const displayOptions = useWidgetDisplayOptions();

    const openCustomizer = useCallback(
        (device: "desktop" | "tablet" | "mobile") => {
            const appWindow = appWindowRef.current as any;
            if (!appWindow) {
                return;
            }

            const simplifiedProducts = products.map((p) => ({
                id: p.id,
                title: p.title,
                image: p.image,
                price: p.price,
                quantity: p.quantity,
                variantTitle: p.variantTitle,
                ...(p.role && { role: p.role }),
            }));
            const productsParam = encodeURIComponent(
                JSON.stringify(simplifiedProducts),
            );

            const baseUrl = bundleData.type
                ? `${ROUTES.CUSTOMIZER}?bundleType=${bundleData.type}&layout=${displaySettings.layout}&device=${device}&source=bundle-preview`
                : `${ROUTES.CUSTOMIZER}?source=bundle-preview`;

            appWindow.src = `${baseUrl}&products=${productsParam}`;
            appWindow.show?.();
        },
        [appWindowRef, bundleData.type, displaySettings.layout, products],
    );

    const customizerSrc = bundleData.type
        ? `${ROUTES.CUSTOMIZER}?bundleType=${bundleData.type}&layout=${displaySettings.layout}`
        : ROUTES.CUSTOMIZER;
    const pricing = useWidgetPricing(currencyCode);

    const labels = useWidgetLabels();
    const badgeText = useBadgeText(labels);
    const borderRadius = getCardRadius(styles.cornerStyle);
    const shadow = getShadow(styles.shadow);
    const padding = getPadding(styles.spacing);

    return (
        <div className="flex flex-col gap-4">
            <BundlePreviewStatus />
            <BundlePriority />

            <s-section>
                <s-stack>
                    <s-stack
                        direction="inline"
                        justifyContent="space-between"
                        alignItems="center"
                        paddingBlockEnd="base"
                    >
                        <s-heading>{t("heading")}</s-heading>
                        <s-stack
                            direction="inline"
                            alignItems="center"
                            gap="small"
                        >
                            <s-app-window
                                ref={appWindowRef}
                                id="rtpb-preview-window"
                                src={customizerSrc}
                            />
                            <s-tooltip id="tooltip-desktop">
                                <s-text>{t("customizerDesktop")}</s-text>
                            </s-tooltip>

                            <s-tooltip id="tooltip-tablet">
                                <s-text>{t("customizerTablet")}</s-text>
                            </s-tooltip>

                            <s-tooltip id="tooltip-mobile">
                                <s-text>{t("customizerMobile")}</s-text>
                            </s-tooltip>

                            <s-button-group gap="none">
                                <s-button
                                    interestFor="tooltip-desktop"
                                    accessibility-label={t("customizerDesktopLabel")}
                                    slot="secondary-actions"
                                    onClick={() => openCustomizer("desktop")}
                                >
                                    <s-icon type="desktop" />
                                </s-button>
                                <s-button
                                    interestFor="tooltip-tablet"
                                    accessibility-label={t("customizerTabletLabel")}
                                    slot="secondary-actions"
                                    onClick={() => openCustomizer("tablet")}
                                >
                                    <s-icon type="tablet" />
                                </s-button>
                                <s-button
                                    interestFor="tooltip-mobile"
                                    accessibility-label={t("customizerMobileLabel")}
                                    slot="secondary-actions"
                                    onClick={() => openCustomizer("mobile")}
                                >
                                    <s-icon type="mobile" tone="info" />
                                </s-button>
                            </s-button-group>

                            <s-tooltip id="customization-tooltip">
                                <s-text>{t("globalCustomizerTooltip")}</s-text>
                            </s-tooltip>
                            <s-icon
                                tone="neutral"
                                type="info"
                                interestFor="customization-tooltip"
                            />
                        </s-stack>
                    </s-stack>
                    <div style={{ position: "relative" }}>
                    {isSyncing ? (
                        <div
                            style={{
                                position: "absolute",
                                inset: -16,
                                zIndex: 20,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "rgba(255, 255, 255, 0.7)",
                                borderRadius: 8,
                                transition: "opacity 0.2s",
                            }}
                        >
                            <s-spinner size="large" />
                        </div>
                    ) : null}
                    {products.length === 0 ? (
                        <div
                            style={{
                                minHeight: 200,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: styles.textColor,
                                fontSize: 14,
                            }}
                        >
                            {t("emptyState")}
                        </div>
                    ) : isVolume ? (
                        volumeConfig && volumeConfig.tiers.length > 0 ? (
                            <div className="radius-bundle-widget">
                                <div className="radius-bundle">
                                    <div
                                        className="radius-bundle__inner"
                                        style={{
                                            position: "relative",
                                            backgroundColor:
                                                styles.backgroundColor,
                                            borderRadius,
                                            borderStyle: styles.showBorder
                                                ? "solid"
                                                : "none",
                                            borderWidth: styles.showBorder
                                                ? "1px"
                                                : 0,
                                            borderColor: styles.borderColor,
                                            boxShadow: shadow,
                                            padding,
                                            marginInlineStart: styles.showBorder
                                                ? "-17px"
                                                : "-16px",
                                            marginInlineEnd: styles.showBorder
                                                ? "-17px"
                                                : "-16px",
                                            marginBlockEnd: styles.showBorder
                                                ? "-17px"
                                                : "-16px",
                                        }}
                                    >
                                        <BundleWidget
                                            styles={styles}
                                            displayOptions={displayOptions}
                                            pricing={pricing}
                                            title={displaySettings.title}
                                            subtitle={displaySettings.subtitle}
                                            labels={labels}
                                            hideFooter
                                            hidePricing
                                        >
                                            <RenderVolumeLayout
                                                layout={displaySettings.layout}
                                                config={volumeConfig}
                                                styles={styles}
                                                currencyCode={currencyCode}
                                                firstProduct={products[0]}
                                                displayOptions={displayOptions}
                                                labels={labels}
                                            />
                                        </BundleWidget>
                                        {displaySettings.layout === "VOLUME_SLIDER" ||
                                        displaySettings.layout === "VOLUME_CALCULATOR" ? (
                                            <WidgetAddToCart
                                                styles={styles}
                                                cartButtonText={
                                                    displaySettings.cartButtonText ||
                                                    PREVIEW_LABELS.addToCartText
                                                }
                                            />
                                        ) : (
                                            <VolumeAddToCart
                                                styles={styles}
                                                displayOptions={displayOptions}
                                                cartButtonText={
                                                    displaySettings.cartButtonText
                                                }
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div
                                style={{
                                    minHeight: 120,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: styles.textColor,
                                    fontSize: 14,
                                }}
                            >
                                Configure discount tiers to see a preview.
                            </div>
                        )
                    ) : (
                        <div className="radius-bundle-widget">
                            <div className="radius-bundle">
                                <div
                                    className="radius-bundle__inner"
                                    style={{
                                        position: "relative",
                                        backgroundColor: styles.backgroundColor,
                                        borderRadius,
                                        borderStyle: styles.showBorder
                                            ? "solid"
                                            : "none",
                                        borderWidth: styles.showBorder
                                            ? "1px"
                                            : 0,
                                        borderColor: styles.borderColor,
                                        boxShadow: shadow,
                                        padding,
                                        marginInlineStart: styles.showBorder
                                            ? "-17px"
                                            : "-16px",
                                        marginInlineEnd: styles.showBorder
                                            ? "-17px"
                                            : "-16px",
                                        marginBlockEnd: styles.showBorder
                                            ? "-17px"
                                            : "-16px",
                                    }}
                                >
                                    <BundleWidget
                                        styles={styles}
                                        displayOptions={displayOptions}
                                        pricing={pricing}
                                        title={displaySettings.title}
                                        subtitle={displaySettings.subtitle}
                                        cartButtonText={
                                            displaySettings.cartButtonText
                                        }
                                        labels={labels}
                                        hideFooter={BOGO_LAYOUT_VALUES.includes(
                                            displaySettings.layout,
                                        )}
                                        hideHeader={BOGO_LAYOUT_VALUES.includes(
                                            displaySettings.layout,
                                        )}
                                        hideOriginalPrice={
                                            displaySettings.layout ===
                                                "COMPACT" &&
                                            bundleData.type === "FIXED_BUNDLE"
                                        }
                                    >
                                        <RenderLayout
                                            layout={displaySettings.layout}
                                            products={products}
                                            styles={styles}
                                            displayOptions={displayOptions}
                                            pricing={pricing}
                                            cartButtonText={
                                                displaySettings.cartButtonText ||
                                                PREVIEW_LABELS.addToCartText
                                            }
                                            title={
                                                displaySettings.title ||
                                                PREVIEW_LABELS.headingLabel
                                            }
                                            subtitle={displaySettings.subtitle}
                                            badgeText={badgeText}
                                            labels={labels}
                                            activeDevice="mobile"
                                            bundleType={bundleData.type}
                                        />
                                    </BundleWidget>
                                </div>
                            </div>
                        </div>
                    )}
                    </div>
                </s-stack>
            </s-section>
        </div>
    );
}
