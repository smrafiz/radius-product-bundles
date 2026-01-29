import {
    DEFAULT_LABELS,
    getBadgeRadius,
    getHeadingFontSize,
    useCustomizerStore,
} from "@/features/settings";

export function BundleHeader() {
    const { styles } = useCustomizerStore();

    const headingFontSize = getHeadingFontSize(styles.headingSize);
    const badgeRadius = getBadgeRadius(styles.cornerStyle);

    const accentColor = styles.primaryColor || "#303030";
    const textColor = styles.textColor || "#333333";

    const isOutline = styles.badgeStyle === "outline";
    const isInline = styles.badgePosition === "inline";

    return (
        <div className="radius-bundle__header">
            <div className="radius-bundle__title-wrapper">
                <div
                    className="radius-bundle__title"
                    style={{
                        fontSize: headingFontSize,
                        color: textColor,
                        fontWeight: 600,
                    }}
                >
                    {DEFAULT_LABELS.headingLabel}
                </div>
            </div>

            {/* Savings Badge */}
            <div
                className="radius-bundle__actions"
                style={{
                    alignSelf: isInline ? "center" : undefined,
                }}
            >
                <span
                    className="radius-bundle__badge"
                    style={{
                        borderRadius: badgeRadius,
                        padding: "6px 10px",
                        fontSize: "14px",
                        fontWeight: 600,
                        backgroundColor: isOutline
                            ? "transparent"
                            : accentColor,
                        color: isOutline ? accentColor : "#ffffff",
                        border: isOutline ? `2px solid ${accentColor}` : "none",
                    }}
                >
                    Save 50%
                </span>
            </div>
        </div>
    );
}
