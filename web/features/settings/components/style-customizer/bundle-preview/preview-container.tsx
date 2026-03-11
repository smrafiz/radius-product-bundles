"use client";

import {
    getCardRadius,
    getShadow,
    PreviewContainerProps,
} from "@/features/settings";

export function PreviewContainer({
    activeDevice,
    activeLayout,
    styles,
    isCartBanner,
    children,
}: PreviewContainerProps) {
    return (
        <div
            className="flex-1 p-4 bg-gray-50"
            style={{
                maxWidth:
                    activeDevice === "mobile"
                        ? "400px"
                        : activeDevice === "tablet"
                          ? "768px"
                          : "100%",
                margin: "0 auto",
                transition: "max-width 0.3s ease-in-out",
                borderLeft:
                    activeDevice !== "desktop" ? "1px solid #e1e3e5" : "none",
                borderRight:
                    activeDevice !== "desktop" ? "1px solid #e1e3e5" : "none",
                overflow: "hidden",
            }}
        >
            <div className="radius-bundle-widget radius-bundle-widget--customizer">
                <div
                    className={`radius-bundle${isCartBanner ? " radius-bundle--cart-banner" : ""}`}
                    style={{
                        maxWidth: styles.boxMaxWidth
                            ? `${styles.boxMaxWidth}px`
                            : undefined,
                        margin:
                            styles.boxAlignment === "left"
                                ? "0 auto 0 0"
                                : styles.boxAlignment === "right"
                                  ? "0 0 0 auto"
                                  : "0 auto",
                    }}
                >
                    <div
                        className={`radius-bundle__inner${activeLayout === "COMPACT_GRID" ? " compact-grid" : ""}`}
                        style={{
                            backgroundColor: styles.backgroundColor,
                            color: styles.textColor,
                            borderRadius: getCardRadius(styles.cornerStyle),
                            padding:
                                styles.spacing === "compact"
                                    ? "12px"
                                    : styles.spacing === "spacious"
                                      ? "28px"
                                      : "20px",
                            border: styles.showBorder
                                ? `1px solid ${styles.borderColor}`
                                : "none",
                            boxShadow: getShadow(styles.shadow),
                        }}
                    >
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
