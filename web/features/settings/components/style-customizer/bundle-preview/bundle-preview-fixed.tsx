"use client";

import {
    BundleAddToCart,
    BundleCarousel,
    BundleCompact,
    BundleGrid,
    BundleHeader,
    BundleList,
    BundlePricing,
    CUSTOMIZER_LAYOUTS_MAPPING,
    getCardRadius,
    getShadow,
    getSpacing,
    useCustomizerStore,
    useEffectiveStyles,
} from "@/features/settings";

import "@/styles/components/bundle.css";

/**
 * Preview component for Fixed Bundle type.
 */
export function BundlePreviewFixed() {
    const { activeLayout, activeDevice, setActiveLayout } =
        useCustomizerStore();
    const styles = useEffectiveStyles();
    const padding = getSpacing(styles.spacing);

    function RenderLayout() {
        switch (activeLayout) {
            case "GRID":
                return <BundleGrid />;
            case "CAROUSEL":
                return <BundleCarousel />;
            case "COMPACT":
                return <BundleCompact />;
            case "LIST":
            default:
                return <BundleList />;
        }
    }

    return (
        <div className="md:flex border border-gray-200 rounded-xl overflow-hidden min-h-75">
            {/* LEFT: Layout Tabs */}
            <div className="md:w-64 border-r border-gray-200 bg-white">
                <s-stack padding="base">
                    <s-heading>Fixed Bundle Layout</s-heading>
                </s-stack>

                <s-stack gap="none">
                    {CUSTOMIZER_LAYOUTS_MAPPING.FIXED_BUNDLE.map(
                        ({ label, value }) => {
                            const isActive = activeLayout === value;

                            return (
                                <button
                                    key={value}
                                    onClick={() => setActiveLayout(value)}
                                    className={`text-left px-4 py-3 border-l-4 transition
                                        ${
                                            isActive
                                                ? "border-current bg-gray-50 font-semibold"
                                                : "border-transparent hover:bg-gray-50"
                                        }
                                    `}
                                    style={{
                                        color: isActive
                                            ? styles.primaryColor
                                            : undefined,
                                    }}
                                >
                                    {label}
                                </button>
                            );
                        },
                    )}
                </s-stack>
            </div>

            {/* RIGHT: Preview */}
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
                        activeDevice !== "desktop"
                            ? "1px solid #e1e3e5"
                            : "none",
                    borderRight:
                        activeDevice !== "desktop"
                            ? "1px solid #e1e3e5"
                            : "none",
                    overflow: "hidden",
                }}
            >
                <div className="radius-bundle-widget radius-bundle-widget--customizer">
                    <div
                        className="radius-bundle"
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
                            className="radius-bundle__inner"
                            style={{
                                backgroundColor: styles.backgroundColor,
                                color: styles.textColor,
                                borderRadius: getCardRadius(styles.cornerStyle),
                                padding: styles.spacing === "compact" ? "12px" : styles.spacing === "spacious" ? "28px" : "20px",
                                border: styles.showBorder
                                    ? `1px solid ${styles.borderColor}`
                                    : "none",
                                boxShadow: getShadow(styles.shadow),
                            }}
                        >
                            <BundleHeader />
                            <RenderLayout />
                            <BundlePricing />
                            <BundleAddToCart />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
