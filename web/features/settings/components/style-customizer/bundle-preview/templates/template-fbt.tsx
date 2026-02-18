"use client";

import {
    BundleTemplateProps,
    useCustomizerStore,
} from "@/features/settings";
import { FbtProductCard } from "../../bundle-layout/cards/fbt-product-card";
import { FbtSeparator } from "../../bundle-layout/elements/fbt-separator";

const FBT_PRODUCTS: ReadonlyArray<{
    name: string;
    price: string;
    checked: boolean;
}> = [
    { name: "Main Product", price: "$30.00", checked: true },
    { name: "Goes Well With", price: "$20.00", checked: true },
    { name: "You May Like", price: "$15.00", checked: false },
];

export function TemplateFbt({ activeLayout }: BundleTemplateProps) {
    const { styles } = useCustomizerStore();
    const checkboxColor = styles.fbtCheckboxColor || styles.primaryColor;
    const separatorStyle = styles.fbtSeparatorStyle || "plus";

    return (
        <div
            style={{
                display: "flex",
                alignItems: "stretch",
                gap: "8px",
                flexWrap: "wrap",
                justifyContent: "center",
            }}
        >
            {FBT_PRODUCTS.map((product, i) => (
                <div
                    key={i}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        flex: "1 1 0",
                        minWidth: 0,
                    }}
                >
                    {i > 0 && (
                        <FbtSeparator
                            style={separatorStyle}
                            primaryColor={styles.primaryColor}
                            borderColor={styles.borderColor}
                        />
                    )}
                    <FbtProductCard
                        name={product.name}
                        price={product.price}
                        checked={product.checked}
                        checkboxColor={checkboxColor}
                    />
                </div>
            ))}
        </div>
    );
}
