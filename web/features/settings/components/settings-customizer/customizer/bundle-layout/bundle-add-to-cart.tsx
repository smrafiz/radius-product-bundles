"use client";

import {
    useBundleStore,
} from "@/features/bundles";

export function BundleAddToCart() {
    const { displaySettings } = useBundleStore();
    const styleData = displaySettings.style || {};

    const bg = styleData.buttonBgColor || "#303030";
    const text = styleData.buttonTextColor || "#ffffff";
    const hoverBg = styleData.buttonHoverBgColor || "#666666";
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
                    {displaySettings.cartButtonText || ""}
                </button>
            </div>
        </>
    );
}