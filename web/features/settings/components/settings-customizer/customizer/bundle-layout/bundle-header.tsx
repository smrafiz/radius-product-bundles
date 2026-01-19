import {
    useBundleStore,
} from "@/features/bundles";

export function BundleHeader() {
    const { displaySettings } = useBundleStore();
    const styleData = displaySettings.style || {};

    const badgeBgColor =
        styleData.badgeBgColor && styleData.badgeBgColor !== ""
            ? styleData.badgeBgColor
            : styleData.primaryColor || "#333333";

    const headingColor =
        styleData.headingColor && styleData.headingColor !== ""
            ? styleData.headingColor
            : styleData.primaryColor || "#303030";

    return(
        <div className="radius-bundle__header">
            <div className="radius-bundle__title-wrapper">
                <div
                    className="radius-bundle__title"
                    style={{
                        fontSize: `${styleData.headingFontSize ?? 20}px`,
                        color: headingColor,
                        textTransform: styleData.headingTransform ?? "none",
                    }}
                >{styleData.headingLabel ?? "Bundle Offers"}</div>
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
                        backgroundColor: badgeBgColor,
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