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
                gap,
            }}
        >
            {Array.from({ length: 4 }).map((_, index) => (
                <div key={index}>
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
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                padding: "8px 0",
                            }}
                        >
                            {styles.dividerStyle === "plus" ? (
                                <div
                                    style={{
                                        color: styles.primaryColor,
                                        fontSize: "20px",
                                        fontWeight: 600,
                                    }}
                                >
                                    +
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
