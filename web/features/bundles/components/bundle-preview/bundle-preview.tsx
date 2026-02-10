"use client";

import {
    BundlePreviewStatus,
    BundlePriority,
    calculateDiscountedPrice,
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
    useSettingsStore,
} from "@/features/settings";
import {
    BundleWidget,
    PreviewProduct,
    WidgetCarousel,
    WidgetCompact,
    WidgetDisplayOptions,
    WidgetGrid,
    WidgetList,
    WidgetPricing,
} from "@/shared";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_CUSTOMIZER_STYLES } from "@/features/settings/constants/defaults.constants";

import "@/styles/components/bundle.css";

function useWidgetStyles(): CustomizerStyles {
    const settings = useSettingsStore.getState().getEffectiveData();
    return {
        ...DEFAULT_CUSTOMIZER_STYLES,
        ...(settings.globalStyles as Partial<CustomizerStyles>),
    };
}

function usePreviewProducts(): PreviewProduct[] {
    const { selectedItems, bundleData } = useBundleStore();

    return useMemo(
        () =>
            selectedItems.map((item) => {
                const originalPrice = parseFloat(item.price) * item.quantity;
                const discountedPrice = calculateDiscountedPrice(
                    originalPrice,
                    bundleData.discountType,
                    bundleData.discountValue,
                    bundleData.maxDiscountAmount,
                );
                return {
                    id: item.id,
                    title: item.title,
                    image: item.image,
                    price: formatPrice(discountedPrice),
                    compareAtPrice:
                        discountedPrice < originalPrice
                            ? formatPrice(originalPrice)
                            : undefined,
                    quantity: item.quantity,
                    url: item.url,
                };
            }),
        [
            selectedItems,
            bundleData.discountType,
            bundleData.discountValue,
            bundleData.maxDiscountAmount,
        ],
    );
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

function useWidgetPricing(): WidgetPricing {
    const pricing = useBundlePreviewPricing();
    return {
        originalPrice: formatPrice(pricing.originalPrice),
        finalPrice: formatPrice(pricing.finalPrice),
        savingsAmount: formatPrice(pricing.discountAmount),
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
    const router = useRouter();
    const { displaySettings } = useBundleStore();
    const styles = useWidgetStyles();
    const products = usePreviewProducts();
    const displayOptions = useWidgetDisplayOptions();
    const pricing = useWidgetPricing();

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
                            <s-button
                                variant="tertiary"
                                onClick={() => router.push("/settings")}
                            >
                                Customization
                            </s-button>
                            <s-tooltip id="customization-tooltip">
                                <s-text>
                                    Customize bundle display settings, colors,
                                    and styling to match your store's branding.
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
