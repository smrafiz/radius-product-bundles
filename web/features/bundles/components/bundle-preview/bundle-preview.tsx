"use client";

import {
    BundlePreviewStatus,
    BundlePriority,
    DisplaySettings,
    formatPrice,
    useBundlePreviewPricing,
    useBundleStore,
} from "@/features/bundles";
import {
    CustomizerStyles,
    getCardRadius,
    getPadding,
    getShadow,
    useCustomizerModal,
    useSettingsStore,
} from "@/features/settings";
import {
    BundleWidget,
    PreviewProduct,
    ROUTES,
    useShopSettings,
    WidgetCarousel,
    WidgetCompact,
    WidgetDisplayOptions,
    WidgetGrid,
    WidgetList,
    WidgetPricing,
} from "@/shared";
import { useMemo } from "react";
import { DEFAULT_CUSTOMIZER_STYLES } from "@/features/settings/constants/defaults.constants";

import "@/styles/components/bundle.css";

function useWidgetStyles(): CustomizerStyles {
    const serverData = useSettingsStore((s) => s.serverData);

    return useMemo(
        () => ({
            ...DEFAULT_CUSTOMIZER_STYLES,
            ...(serverData?.globalStyles as Partial<CustomizerStyles>),
        }),
        [serverData],
    );
}

function usePreviewProducts(currencyCode?: string): PreviewProduct[] {
    const { selectedItems, bundleData } = useBundleStore();
    const isBxgy = bundleData.type === "BOGO" || bundleData.type === "BUY_X_GET_Y";

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
                            discountedUnitPrice = unitPrice * (1 - discountValue / 100);
                            break;
                        case "FIXED_AMOUNT":
                            discountedUnitPrice = Math.max(0, unitPrice - discountValue);
                            break;
                        case "CUSTOM_PRICE":
                            discountedUnitPrice = discountValue;
                            break;
                    }
                }

                discountedUnitPrice = Math.round(discountedUnitPrice * 100) / 100;
                const hasDiscount = discountedUnitPrice < unitPrice;
                return {
                    id: item.id,
                    title: item.title,
                    image: item.image,
                    price: formatPrice(discountedUnitPrice, currencyCode),
                    compareAtPrice: hasDiscount
                        ? formatPrice(unitPrice, currencyCode)
                        : undefined,
                    quantity: item.quantity,
                    url: item.url,
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

function RenderLayout({
    layout,
    products,
    styles,
    displayOptions,
}: {
    layout: DisplaySettings["layout"];
    products: PreviewProduct[];
    styles: CustomizerStyles;
    displayOptions: WidgetDisplayOptions;
}) {
    const layoutProps = { products, styles, displayOptions };

    switch (layout) {
        case "GRID":
            return <WidgetGrid {...layoutProps} />;
        case "LIST":
            return <WidgetList {...layoutProps} />;
        case "CAROUSEL":
            return <WidgetCarousel {...layoutProps} />;
        case "COMPACT":
            return <WidgetCompact {...layoutProps} />;
        default:
            return <WidgetGrid {...layoutProps} />;
    }
}

export function BundlePreview() {
    const { appWindowRef } = useCustomizerModal();
    const { displaySettings, bundleData } = useBundleStore();
    const { currencyCode } = useShopSettings();
    const customizerSrc = bundleData.type
        ? `${ROUTES.CUSTOMIZER}?bundleType=${bundleData.type}`
        : ROUTES.CUSTOMIZER;
    const styles = useWidgetStyles();
    const products = usePreviewProducts(currencyCode);
    const displayOptions = useWidgetDisplayOptions();
    const pricing = useWidgetPricing(currencyCode);

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
                        paddingBlockEnd="small-200"
                    >
                        <s-heading>Preview</s-heading>
                        <s-stack
                            direction="inline"
                            alignItems="center"
                            gap="small-500"
                        >
                            <s-app-window
                                ref={appWindowRef}
                                id="rtpb-preview-window"
                                src={customizerSrc}
                            />
                            <s-button
                                variant="tertiary"
                                command="--show"
                                commandFor="rtpb-preview-window"
                            >
                                Global customizer
                            </s-button>
                            <s-tooltip id="customization-tooltip">
                                <s-text>
                                    Use the global customization settings to
                                    style your bundle display, including colors
                                    and visual elements, to align with your
                                    store’s branding.
                                </s-text>
                            </s-tooltip>
                            <s-icon
                                tone="neutral"
                                type="info"
                                interestFor="customization-tooltip"
                            />
                        </s-stack>
                    </s-stack>
                    <div className="radius-bundle-widget">
                        <div className="radius-bundle">
                            <div
                                className="radius-bundle__inner"
                                style={{
                                    backgroundColor: styles.backgroundColor,
                                    borderRadius,
                                    borderStyle: styles.showBorder
                                        ? "solid"
                                        : "none",
                                    borderWidth: styles.showBorder ? "1px" : 0,
                                    borderColor: styles.borderColor,
                                    boxShadow: shadow,
                                    padding,
                                    marginLeft: styles.showBorder
                                        ? "-17px"
                                        : "-16px",
                                    marginRight: styles.showBorder
                                        ? "-17px"
                                        : "-16px",
                                    marginBottom: styles.showBorder
                                        ? "-17px"
                                        : "-16px",
                                }}
                            >
                                <BundleWidget
                                    styles={styles}
                                    displayOptions={displayOptions}
                                    pricing={pricing}
                                    title={displaySettings.title}
                                    cartButtonText={
                                        displaySettings.cartButtonText
                                    }
                                >
                                    <RenderLayout
                                        layout={displaySettings.layout}
                                        products={products}
                                        styles={styles}
                                        displayOptions={displayOptions}
                                    />
                                </BundleWidget>
                            </div>
                        </div>
                    </div>
                </s-stack>
            </s-section>
        </div>
    );
}
