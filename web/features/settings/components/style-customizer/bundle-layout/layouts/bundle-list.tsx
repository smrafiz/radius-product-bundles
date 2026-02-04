"use client";

import {
    getSpacing,
    ProductCard,
    useCustomizerStore,
} from "@/features/settings";

export function BundleList() {
    const { styles } = useCustomizerStore();
    const gap = getSpacing(styles.spacing);
    const showDivider = styles.dividerStyle !== "none";

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: `calc( ${gap} + 8px)`,
            }}
        >
            {Array.from({ length: 4 }).map((_, index) => (
                <div className="relative" key={index}>
                    <ProductCard
                        variant={
                            styles.imagePosition === "top"
                                ? "vertical"
                                : "horizontal"
                        }
                        label="Bundle product"
                        price="$300.33"
                        comparePrice="$600.00"
                    />

                    {showDivider && index < 3 && (
                        <div className="radius-bundle__divider"
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                paddingTop: `calc(${gap} + 8px)`,
                            }}
                        >
                            {styles.dividerStyle === "plus" ? (
                                <div className="flex justify-center"
                                    style={{
                                        fontSize: "20px",
                                        fontWeight: 600,
                                    }}
                                >
                                    <div
                                        className="divider-position"
                                        style={{
                                            backgroundColor: styles.primaryColor,
                                            color: "#fff",
                                            bottom: `calc(-1 * ${gap} / 2 - 8px)`,
                                            marginBottom: `calc( ${gap} / 2 - 4px)`,
                                        }}
                                    >+</div>
                                </div>
                            ) : (
                                <div
                                    style={{
                                        width: "100%",
                                        height: "1px",
                                        backgroundColor: styles.borderColor,
                                    }}
                                />
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
