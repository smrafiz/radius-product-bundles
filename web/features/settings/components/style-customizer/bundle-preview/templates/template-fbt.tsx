"use client";

import type { BundleTemplateProps } from "@/features/settings/types/template.types";
import {
    getCardRadius,
    getFontSize,
    getImageSize,
    getSpacing,
    getCardBgColor,
    useCustomizerStore,
} from "@/features/settings";

const FBT_PRODUCTS = [
    { name: "Main Product", price: "$30.00", checked: true },
    { name: "Goes Well With", price: "$20.00", checked: true },
    { name: "You May Like", price: "$15.00", checked: false },
] as const;

function FbtProductCard({
    name,
    price,
    checked,
    checkboxColor,
}: {
    name: string;
    price: string;
    checked: boolean;
    checkboxColor: string;
}) {
    const { styles } = useCustomizerStore();
    const imageSizePx = getImageSize(styles.imageSize);
    const cardRadius = getCardRadius(styles.cornerStyle);
    const fontSize = getFontSize(styles.bodySize);
    const gap = getSpacing(styles.spacing);
    const cardBackground = getCardBgColor(styles);

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                backgroundColor: cardBackground,
                borderRadius: cardRadius,
                fontSize,
                color: styles.textColor,
                border: styles.productCardBorder
                    ? `1px solid ${styles.borderColor}`
                    : "none",
                boxShadow: styles.productCardShadow
                    ? "0 4px 12px rgba(0,0,0,0.08)"
                    : "none",
                padding: gap,
                opacity: checked ? 1 : 0.5,
                transition: "opacity 0.15s",
                flex: "1 1 0",
                minWidth: 0,
            }}
        >
            <div
                style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "4px",
                    border: `2px solid ${checked ? checkboxColor : styles.borderColor}`,
                    backgroundColor: checked ? checkboxColor : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    alignSelf: "flex-start",
                }}
            >
                {checked && (
                    <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                    >
                        <path
                            d="M2 5L4 7L8 3"
                            stroke="#fff"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                )}
            </div>

            <div
                style={{
                    width: imageSizePx,
                    height: imageSizePx,
                    borderRadius: cardRadius,
                    backgroundColor: "#f3f4f6",
                    overflow: "hidden",
                    flexShrink: 0,
                }}
            >
                <img
                    src="/assets/product-image-placeholder.webp"
                    alt={name}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: styles.imageFit,
                    }}
                />
            </div>

            <div
                style={{
                    textAlign: "center",
                    width: "100%",
                }}
            >
                <div
                    style={{
                        fontWeight: 500,
                        marginBottom: "2px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}
                >
                    {name}
                </div>
                <div style={{ fontWeight: 600 }}>{price}</div>
            </div>
        </div>
    );
}

function Separator({
    style: sepStyle,
    primaryColor,
    borderColor,
}: {
    style: "plus" | "line" | "none";
    primaryColor: string;
    borderColor: string;
}) {
    if (sepStyle === "none") return null;

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                padding: "0 4px",
            }}
        >
            {sepStyle === "plus" ? (
                <div
                    style={{
                        fontSize: "20px",
                        fontWeight: 700,
                        color: primaryColor,
                        lineHeight: 1,
                    }}
                >
                    +
                </div>
            ) : (
                <div
                    style={{
                        width: "1px",
                        height: "40px",
                        backgroundColor: borderColor,
                    }}
                />
            )}
        </div>
    );
}

export function TemplateFbt({ activeLayout }: BundleTemplateProps) {
    const { styles } = useCustomizerStore();
    const gap = getSpacing(styles.spacing);
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
                        <Separator
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
