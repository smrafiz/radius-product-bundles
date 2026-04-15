"use client";

import {
    type BundleTemplateProps,
    getButtonBgColor,
    getButtonFontSize,
    getButtonPadding,
    getButtonRadius,
    useEffectiveStyles,
    usePreviewProducts,
    VolumeCalculator,
    VolumePricingCards,
    VolumeSlider,
    VolumeTierList,
} from "@/features/settings";
import type { CustomizerStyles } from "@/features/settings";
import { DEMO_TIERS } from "@/features/settings/constants/customizer.constants";
import { DEFAULT_DISPLAY_OPTIONS, PLACEHOLDER_PRODUCTS, PREVIEW_LABELS } from "@/shared/constants/bundle-widget.constants";

function VolumeFooter({ styles }: { styles: CustomizerStyles }) {
    const radius = getButtonRadius(styles.cornerStyle);
    const fontSize = getButtonFontSize(styles.buttonSize);
    const padding = getButtonPadding(styles.buttonSize);
    const bgColor = getButtonBgColor(styles);
    const isOutline = styles.buttonStyle === "outline";
    const isFullWidth = styles.buttonWidth === "full";
    const borderColor = styles.borderColor || "#d1d5db";

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
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    border: `1px solid ${borderColor}`,
                    borderRadius: radius,
                    overflow: "hidden",
                    flexShrink: 0,
                }}
            >
                <button
                    style={{
                        width: 32,
                        height: 36,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 16,
                        color: styles.textColor,
                    }}
                    aria-label="Decrease quantity"
                >
                    −
                </button>
                <span
                    style={{
                        width: 32,
                        height: 36,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        fontWeight: 500,
                        color: styles.textColor,
                        borderLeft: `1px solid ${borderColor}`,
                        borderRight: `1px solid ${borderColor}`,
                    }}
                >
                    1
                </span>
                <button
                    style={{
                        width: 32,
                        height: 36,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 16,
                        color: styles.textColor,
                    }}
                    aria-label="Increase quantity"
                >
                    +
                </button>
            </div>
            <button
                style={{
                    flex: isFullWidth ? 1 : undefined,
                    padding,
                    fontSize,
                    fontWeight: 600,
                    borderRadius: radius,
                    cursor: "pointer",
                    transition: "opacity 0.2s ease",
                    backgroundColor: isOutline ? "transparent" : bgColor,
                    color: isOutline ? bgColor : "#ffffff",
                    border: isOutline ? `2px solid ${bgColor}` : "none",
                }}
            >
                {PREVIEW_LABELS.addToCartText}
            </button>
        </div>
    );
}

export function TemplateVolume({ activeLayout }: BundleTemplateProps) {
    const styles = useEffectiveStyles();
    const highlightColor = styles.primaryColor;

    const products = usePreviewProducts({
        placeholderProducts: PLACEHOLDER_PRODUCTS,
        maxCount: 1,
    });

    const firstProduct = products[0];
    const productProp = firstProduct
        ? {
              title: firstProduct.title,
              image: firstProduct.image,
              basePrice: firstProduct.price,
          }
        : undefined;

    const layoutProps = {
        tiers: DEMO_TIERS,
        product: productProp,
        highlightColor,
        styles,
        displayOptions: DEFAULT_DISPLAY_OPTIONS,
    };

    const renderLayout = () => {
        switch (activeLayout) {
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
    };

    const showQtySelector =
        activeLayout !== "VOLUME_SLIDER" &&
        activeLayout !== "VOLUME_CALCULATOR";

    return (
        <>
            {renderLayout()}
            {showQtySelector && <VolumeFooter styles={styles} />}
        </>
    );
}
