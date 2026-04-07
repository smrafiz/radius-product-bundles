"use client";

import type { WidgetLabels } from "@/shared";
import {
    BundleWidget,
    getCurrencySymbol,
    PreviewProduct,
    ROUTES,
    useShopSettings,
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
} from "@/features/settings";
import { useCallback, useMemo } from "react";
import { BOGO_LAYOUT_VALUES } from "@/features/bundles/constants/bundle-details.constants";
import { DEFAULT_CUSTOMIZER_STYLES } from "@/features/settings/constants/defaults.constants";
import { PREVIEW_LABELS } from "@/shared/constants/bundle-widget.constants";

import { useTranslations } from "@/lib/i18n/provider";
import "@/styles/components/bundle.css";

function VolumePreviewWidget({ config }: { config: VolumeDiscountConfig }) {
    const { currencyCode } = useShopSettings();
    const currencySymbol = getCurrencySymbol(currencyCode);
    const suffix = config.discountType === "PERCENTAGE" ? "%" : currencySymbol;
    const position = config.discountType === "PERCENTAGE" ? "suffix" : "prefix";

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {config.tiers.map((tier, index) => {
                const isLast = index === config.tiers.length - 1;
                const nextMin = config.tiers[index + 1]?.minQuantity;
                const rangeLabel = isLast
                    ? config.openEnded
                        ? `${tier.minQuantity}+ units`
                        : `${tier.minQuantity} units`
                    : `${tier.minQuantity}–${(nextMin ?? 0) - 1} units`;
                const discountLabel = position === "suffix"
                    ? `${tier.discount}${suffix} off`
                    : `${suffix}${tier.discount} off`;

                return (
                    <div
                        key={index}
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "10px 14px",
                            borderRadius: 6,
                            border: "1px solid #e1e3e5",
                            background: tier.isDefault ? "#f0f7ff" : "#fff",
                        }}
                    >
                        <div>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>
                                {tier.title || rangeLabel}
                            </div>
                            <div style={{ fontSize: 12, color: "#6d7175" }}>
                                {rangeLabel}
                            </div>
                        </div>
                        <div style={{ fontWeight: 700, color: "#008060" }}>
                            {discountLabel}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function useWidgetStyles(): CustomizerStyles {
    const serverData = useSettingsStore((s) => s.serverData);
    const bundleType = useBundleStore((s) => s.bundleData.type);

    return useMemo(() => {
        const base = {
            ...DEFAULT_CUSTOMIZER_STYLES,
            ...(serverData?.globalStyles as Partial<CustomizerStyles>),
        };
        const typeOverride = bundleType
            ? base.bundleTypeOverrides?.[bundleType]
            : null;
        return typeOverride ? { ...base, ...typeOverride } : base;
    }, [serverData, bundleType]);
}

function usePreviewProducts(currencyCode?: string): PreviewProduct[] {
    const { selectedItems, bundleData } = useBundleStore();
    const isBxgy =
        bundleData.type === "BOGO" || bundleData.type === "BUY_X_GET_Y";

    return useMemo(() => {
        const discountType = bundleData.discountType;
        const discountValue = bundleData.discountValue ?? 0;

        if (isBxgy) {
            return selectedItems.map((item) => {
                const unitPrice = parseFloat(item.price) || 0;
                const isReward = item.role === "REWARD";
                let discountedUnitPrice = unitPrice;

                if (isReward && discountType && discountValue > 0) {
                    switch (discountType) {
                        case "PERCENTAGE":
                            discountedUnitPrice =
                                unitPrice * (1 - discountValue / 100);
                            break;
                        case "FIXED_AMOUNT":
                            discountedUnitPrice = Math.max(
                                0,
                                unitPrice - discountValue,
                            );
                            break;
                        case "CUSTOM_PRICE":
                            discountedUnitPrice = discountValue;
                            break;
                    }
                }

                discountedUnitPrice =
                    Math.round(discountedUnitPrice * 100) / 100;
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
                    role: item.role,
                };
            });
        }

        const applyToSpecific = bundleData.discountApplication === "products";
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
        currencyCode,
    ]);
}

function useWidgetDisplayOptions(): WidgetDisplayOptions {
    const { displaySettings } = useBundleStore();
    return {
        showImages: displaySettings.showImages,
        showPrices: displaySettings.showPrices,
        showComparePrices: displaySettings.showComparePrices,
        showQuantity: displaySettings.showQuantity,
        showSavingsBadge: displaySettings.showSavingsBadge,
        showSavings: displaySettings.showSavings,
        showFreeShipping: displaySettings.showFreeShipping,
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
    const { bundleData, selectedItems } = useBundleStore();

    if (labels.bogoBadgeText) return labels.bogoBadgeText;

    const triggerCount = selectedItems.filter(
        (i) => i.role === "TRIGGER",
    ).length;
    const rewardCount = selectedItems.filter((i) => i.role === "REWARD").length;
    const buy = triggerCount || (bundleData.buyQuantity ?? 1);
    const get = rewardCount || (bundleData.getQuantity ?? 1);
    const discountType = bundleData.discountType;
    const discountValue = bundleData.discountValue ?? 0;

    const buyWord = labels.bogoBuyText || "Buy";
    const getWord = labels.bogoGetText || "Get";
    const freeWord = labels.bogoFreeText || "Free";

    if (discountType === "PERCENTAGE" && discountValue === 100) {
        return `${buyWord} ${buy} ${getWord} ${get} ${freeWord}`;
    }
    if (discountType === "PERCENTAGE" && discountValue > 0) {
        return `${buyWord} ${buy} ${getWord} ${get} at ${discountValue}% Off`;
    }
    if (discountType === "FIXED_AMOUNT" && discountValue > 0) {
        return `${buyWord} ${buy} ${getWord} ${get} - $${discountValue} Off`;
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
    const layoutProps = { products, styles, displayOptions, bundleType, labels };

    // Default values if empty or undefined
    const safeTitle = title?.trim() ? title : "Bundle & Save";
    const safeButtonText = cartButtonText?.trim()
        ? cartButtonText
        : "Add Bundle to Cart";

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
    const { appWindowRef } = useCustomizerModal();
    const { displaySettings, bundleData } = useBundleStore();
    const { currencyCode } = useShopSettings();
    const isVolume = bundleData.type === "VOLUME_DISCOUNT";
    const volumeConfig = bundleData.volumeTiers as VolumeDiscountConfig | undefined;

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
                                    accessibility-label="Open desktop customizer"
                                    slot="secondary-actions"
                                    onClick={() => openCustomizer("desktop")}
                                >
                                    <s-icon type="desktop" />
                                </s-button>
                                <s-button
                                    interestFor="tooltip-tablet"
                                    accessibility-label="Open tablet customizer"
                                    slot="secondary-actions"
                                    onClick={() => openCustomizer("tablet")}
                                >
                                    <s-icon type="tablet" />
                                </s-button>
                                <s-button
                                    interestFor="tooltip-mobile"
                                    accessibility-label="Open mobile customizer"
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
                    {isVolume ? (
                        volumeConfig && volumeConfig.tiers.length > 0 ? (
                            <VolumePreviewWidget config={volumeConfig} />
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
                    ) : products.length === 0 ? (
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
                                                ta("cartButtonTextPlaceholder")
                                            }
                                            title={
                                                displaySettings.title ||
                                                ta("titlePlaceholder")
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
                </s-stack>
            </s-section>
        </div>
    );
}
