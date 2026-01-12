"use client";

import {
    useBundleStore,
} from "@/features/bundles";

export function BundleHeader() {
    const { displaySettings } = useBundleStore();
    const styleData = displaySettings.style || {};

    return (
        <div className="radius-bundle__header">
            <div className="radius-bundle__title-wrapper">
                <div
                    className="font-semibold text-xl"
                    style={{
                        textAlign: styleData.titleAlignment || "left",
                    }}
                >{displaySettings.title || ""}</div>
            </div>
            {displaySettings.showSavingsBadge && (
                <div className="radius-bundle__badge">Save 50%</div>
            )}
        </div>
    );
}