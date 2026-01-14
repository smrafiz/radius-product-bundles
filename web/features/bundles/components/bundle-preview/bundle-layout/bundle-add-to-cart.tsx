"use client";

import {
    useBundleStore,
} from "@/features/bundles";

export function BundleAddToCart() {
    const { selectedItems, displaySettings } = useBundleStore();
    const styleData = displaySettings.style || {};

    if (!selectedItems.length) {
        return null;
    }
    return (
        <div
            className="radius-bundle__actions"
            style={{
                fontSize: `${styleData.buttonFontSize ?? 16}px`,
            }}
        >
            <button
                className="radius-bundle__add-to-cart"
                style={{
                    backgroundColor: styleData.buttonBgColor || "#303030",
                    color: styleData.buttonTextColor || "#fff",
                    borderRadius: `${styleData.buttonRadius ?? 8}px`,
                }}
            >
                {displaySettings.cartButtonText || ""}
            </button>
        </div>
    );
}