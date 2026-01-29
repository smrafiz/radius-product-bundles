import { DEFAULT_LABELS, useCustomizerStore } from "@/features/settings";

export function BundleHeader() {
    const { styles } = useCustomizerStore();
    const styleData = styles;

    const badgeBgColor =
        styleData.badgeBgColor && styleData.badgeBgColor !== ""
            ? styleData.badgeBgColor
            : styleData.primaryColor || "#333333";

    const headingColor =
        styleData.headingColor && styleData.headingColor !== ""
            ? styleData.headingColor
            : styleData.primaryColor || "#303030";

    return (
        <div className="radius-bundle__header">
            <div className="radius-bundle__title-wrapper">
                <div
                    className="radius-bundle__title"
                    style={{
                        fontSize: `${styleData.headingFontSize ?? 20}px`,
                        color: headingColor,
                        textTransform: styleData.headingTransform ?? "none",
                    }}
                >
                    {DEFAULT_LABELS.headingLabel}
                </div>
            </div>
            {(
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
    );
}
