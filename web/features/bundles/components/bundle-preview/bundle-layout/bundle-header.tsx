"use client";

import {
    useBundleStore,
} from "@/features/bundles";

export function BundleHeader() {
    const { displaySettings } = useBundleStore();

    return (
        <div className="radius-bundle__header">
            <div className="radius-bundle__title-wrapper">
                <div className="radius-bundle__title">
                    {displaySettings.title || ""}
                </div>
            </div>
            {displaySettings.showSavingsBadge && (
                <div className="radius-bundle__actions">
                    <button className="radius-bundle__badge">
                        Save 50%
                    </button>
                </div>
            )}
        </div>
    );
}