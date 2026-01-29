"use client";

import {
    DEFAULT_LABELS,
    getButtonFontSize,
    getButtonPadding,
    getButtonRadius,
    useCustomizerStore,
} from "@/features/settings";

export function BundleAddToCart() {
    const { styles } = useCustomizerStore();

    const radius = getButtonRadius(styles.cornerStyle);
    const fontSize = getButtonFontSize(styles.buttonSize);
    const padding = getButtonPadding(styles.buttonSize);

    const bgColor =
        styles.buttonBgColor && styles.buttonBgColor !== ""
            ? styles.buttonBgColor
            : styles.primaryColor || "#303030";

    const textColor = "#ffffff";

    const isOutline = styles.buttonStyle === "outline";
    const isFullWidth = styles.buttonWidth === "full";

    return (
        <>
            <style>
                {`
                .radius-bundle__add-to-cart {
                    display: inline-flex;
                    justify-content: center;
                    align-items: center;
                    width: ${isFullWidth ? "100%" : "auto"};
                    padding: ${padding};
                    font-size: ${fontSize};
                    font-weight: 600;
                    border-radius: ${radius};
                    cursor: pointer;
                    transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
                    ${
                        isOutline
                            ? `
                        background: transparent;
                        color: ${bgColor};
                        border: 2px solid ${bgColor};
                    `
                            : `
                        background: ${bgColor};
                        color: ${textColor};
                        border: none;
                    `
                    }
                }

                .radius-bundle__add-to-cart:hover {
                    opacity: 0.9;
                }
            `}
            </style>

            <div className="radius-bundle__actions">
                <button className="radius-bundle__add-to-cart">
                    {DEFAULT_LABELS.addToCartText}
                </button>
            </div>
        </>
    );
}
