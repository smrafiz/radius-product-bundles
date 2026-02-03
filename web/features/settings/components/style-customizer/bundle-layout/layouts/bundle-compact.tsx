"use client";

import {
    getSpacing,
    ProductCard,
    useCustomizerStore,
} from "@/features/settings";

export function BundleCompact() {
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
            {Array.from({ length: 3 }).map((_, i) => (
                <ProductCard
                    key={i}
                    showCardStyle={false}
                    label="Bundle product"
                    price="$300.33"
                    comparePrice="$600.00"
                />
            ))}
        </div>
    );
}
