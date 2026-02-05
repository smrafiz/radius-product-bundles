"use client";

import {
    getSpacing,
    ProductCard,
    useCustomizerStore,
} from "@/features/settings";

export function BundleGrid() {
    const { styles } = useCustomizerStore();
    const gap = getSpacing(styles.spacing);

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: `repeat(${styles.gridColumns ?? 3}, minmax(0, 1fr))`,
                gap,
            }}
        >
            {Array.from({ length: 4 }).map((_, i) => (
                <ProductCard
                    key={i}
                    variant="vertical"
                    label="Bundle product"
                    price="$300.33"
                    comparePrice="$600.00"
                />
            ))}
        </div>
    );
}
