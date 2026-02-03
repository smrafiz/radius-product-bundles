"use client";

import {
    BundleTemplateProps,
    getSpacing,
    ProductCard,
    SectionDivider,
    SectionLabel,
    useCustomizerStore,
} from "@/features/settings";

export function TemplateBogo({ activeLayout }: BundleTemplateProps) {
    const { styles } = useCustomizerStore();
    const gap = getSpacing(styles.spacing);

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap,
            }}
        >
            <SectionLabel color={styles.textColor} opacity={0.7}>
                Buy These
            </SectionLabel>

            <div
                style={{
                    display: activeLayout === "GRID" ? "grid" : "flex",
                    gridTemplateColumns:
                        activeLayout === "GRID"
                            ? `repeat(${styles.gridColumns ?? 2}, 1fr)`
                            : undefined,
                    flexDirection:
                        activeLayout !== "GRID" ? "column" : undefined,
                    gap,
                }}
            >
                <ProductCard
                    label="Trigger Product A"
                    price="$300.33"
                    comparePrice="$600.00"
                />
                <ProductCard
                    label="Trigger Product B"
                    price="$300.33"
                    comparePrice="$600.00"
                />
            </div>

            <SectionDivider
                label="+"
                color={styles.primaryColor}
                borderColor={styles.borderColor}
            />

            <SectionLabel color={styles.bogoFreeTagColor}>
                Get These Free
            </SectionLabel>

            <ProductCard
                label="Reward Product"
                price="$0.00"
                badge={{
                    text: "FREE",
                    color: styles.bogoFreeTagColor || "#16a34a",
                }}
            />
        </div>
    );
}
