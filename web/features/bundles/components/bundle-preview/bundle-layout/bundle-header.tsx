"use client";

import { useBundlePreviewPricing, useBundleStore } from "@/features/bundles";

/**
 * Bundle header component with title and savings badge
 */
export function BundleHeader() {
    const { displaySettings } = useBundleStore();
    const { savingsPercentage, hasDiscount } = useBundlePreviewPricing();

    return (
        <div className="radius-bundle__header">
            <div className="radius-bundle__title-wrapper">
                <div className="radius-bundle__title">
                    {displaySettings.title || ""}
                </div>
            </div>
            {displaySettings.showSavingsBadge && hasDiscount && (
                <div className="radius-bundle__actions">
                    <button className="radius-bundle__badge">
                        Save {savingsPercentage}%
                    </button>
                </div>
            )}
        </div>
    );
}
