"use client";

import { DEFAULT_LABELS, useCustomizerStore } from "@/features/settings";

export function BundleAddToCart() {
    const { styles } = useCustomizerStore();
    const styleData = styles;

    const bg =
        styleData.buttonBgColor && styleData.buttonBgColor !== ""
            ? styleData.buttonBgColor
            : styleData.primaryColor || "#333333";

    const hoverBg =
        styleData.buttonHoverBgColor && styleData.buttonHoverBgColor !== ""
            ? styleData.buttonHoverBgColor
            : styleData.secondaryColor || "#666666";

    const text = styleData.buttonTextColor || "#ffffff";
    const hoverText = styleData.buttonHoverTextColor || "#ffffff";
    const radius = styleData.buttonRadius ?? 8;
    const fontSize = styleData.buttonFontSize ?? 16;

    return (
        <>
            <style>
                {`
                .radius-bundle__add-to-cart {
                    background-color: ${bg};
                    color: ${text};
                    border-radius: ${radius}px;
                    font-size: ${fontSize}px;
                    transition: background-color 0.2s ease, color 0.2s ease;
                }

                .radius-bundle__add-to-cart:hover {
                    background-color: ${hoverBg};
                    color: ${hoverText};
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
