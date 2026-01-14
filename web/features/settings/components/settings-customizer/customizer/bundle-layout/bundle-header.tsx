import {
    useBundleStore,
} from "@/features/bundles";

export function BundleHeader() {
    const { displaySettings } = useBundleStore();
    const styleData = displaySettings.style || {};

    return(
        <div className="radius-bundle__header">
            <div className="radius-bundle__title-wrapper">
                <div
                    className="radius-bundle__title"
                    style={{
                        fontSize: `${styleData.headingFontSize ?? 20}px`,
                        color: styleData.headingColor || "#303030",
                    }}
                >{displaySettings.title || ""}</div>
            </div>
            {displaySettings.showSavingsBadge && (
            <div
                className="radius-bundle__actions"
                style={{
                    fontSize: `${styleData.badgeFontSize ?? 16}px`,
                }}
            >
                <button
                    className="radius-bundle__badge"
                    style={{
                        backgroundColor: styleData.badgeBgColor || "#22c55e",
                        color: styleData.badgeTextColor || "#ffffff",
                        borderRadius: `${styleData.badgeRadius ?? 8}px`,
                    }}
                >
                    Save 50%
                </button>
            </div>
            )}
        </div>
    )
}