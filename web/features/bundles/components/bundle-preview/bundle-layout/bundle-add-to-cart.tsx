"use client";

import {
    useBundleStore,
} from "@/features/bundles";

export function BundleAddToCart() {
    const { displaySettings } = useBundleStore();
    const styleData = displaySettings.style || {};
    return (
        <div
            className="radius-bundle__actions"
            style={{
                fontSize: `${styleData.productFontSize ?? 16}px`,
            }}
        >
            <button
                className="radius-bundle__add-to-cart"
                style={
                    (styleData.buttonStyleEnabled ?? true)
                        ? {
                            backgroundColor: styleData.buttonBgColor || "#303030",
                            color: styleData.buttonTextColor || "#fff",
                            borderRadius: `${styleData.buttonRadius ?? 8}px`,
                        }
                        : undefined
                }
            >
                {displaySettings.cartButtonText || ""}
            </button>
        </div>
    );
}