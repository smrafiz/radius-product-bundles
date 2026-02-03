"use client";

import {
    BundleTemplateProps,
    getSpacing,
    ProductCard,
    SectionDivider,
    useCustomizerStore,
    VolumeTier,
    VolumeTiers,
} from "@/features/settings";

const VOLUME_TIERS: ReadonlyArray<VolumeTier> = [
    { qty: 2, discount: 10, price: "$27.00" },
    { qty: 5, discount: 20, price: "$24.00" },
    { qty: 10, discount: 30, price: "$21.00" },
];

export function TemplateVolume({ activeLayout }: BundleTemplateProps) {
    const { styles } = useCustomizerStore();
    const gap = getSpacing(styles.spacing);
    const highlightColor =
        styles.volumeTierHighlightColor || styles.primaryColor;

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap,
            }}
        >
            <ProductCard label="Volume Product" price="$30.00 each" />

            <SectionDivider
                label="Quantity Tiers"
                color={styles.textColor}
                borderColor={styles.borderColor}
                opacity={0.6}
            />

            <VolumeTiers tiers={VOLUME_TIERS} highlightColor={highlightColor} />
        </div>
    );
}
