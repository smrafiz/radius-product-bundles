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
                >List {displaySettings.title || ""}</div>
            </div>
            {displaySettings.showSavingsBadge && (
                <div className="radius-bundle__badge radius-bundle__badge--skeleton radius-bundle__badge--visible">Save 50%</div>
            )}
        </div>
    );
}