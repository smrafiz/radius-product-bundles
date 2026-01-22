"use client";

import { useBundleStore } from "@/features/bundles";

export function BundleAddToCart() {
    const { selectedItems, displaySettings } = useBundleStore();

    if (!selectedItems.length) {
        return null;
    }
    return (
        <div className="radius-bundle__actions">
            <button className="radius-bundle__add-to-cart">
                {displaySettings.cartButtonText || ""}
            </button>
        </div>
    );
}
