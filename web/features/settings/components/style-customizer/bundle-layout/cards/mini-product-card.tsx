"use client";

import {
    getCardRadius,
    getFontSize,
    getImageSize,
    getCardBgColor,
    useCustomizerStore,
    MiniProductCardProps,
} from "@/features/settings";

export function MiniProductCard({
    isFree,
    freeTagColor,
}: MiniProductCardProps) {
    const { styles } = useCustomizerStore();
    const imageSizePx = getImageSize(styles.imageSize);
    const cardRadius = getCardRadius(styles.cornerStyle);
    const fontSize = getFontSize(styles.bodySize);
    const cardBackground = getCardBgColor(styles);

    const imgSize = `${Math.max(parseInt(imageSizePx) - 20, 40)}px`;
    const bodyFontSize = `${Math.max(parseInt(fontSize) - 1, 12)}px`;

    return (
        <div
            style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: cardBackground,
                borderRadius: cardRadius,
                fontSize: bodyFontSize,
                color: styles.textColor,
                border: styles.productCardBorder
                    ? `1px solid ${styles.borderColor}`
                    : "none",
                padding: "8px",
            }}
        >
            {isFree && (
                <div
                    style={{
                        position: "absolute",
                        top: "4px",
                        right: "4px",
                        backgroundColor: freeTagColor || "#16a34a",
                        color: "#fff",
                        fontSize: "9px",
                        fontWeight: 700,
                        padding: "1px 6px",
                        borderRadius: "3px",
                        textTransform: "uppercase",
                    }}
                >
                    FREE
                </div>
            )}
            <div
                style={{
                    width: imgSize,
                    height: imgSize,
                    borderRadius: cardRadius,
                    flexShrink: 0,
                    backgroundColor: "#f3f4f6",
                    overflow: "hidden",
                }}
            >
                <img
                    src="/assets/product-image-placeholder.webp"
                    alt="Product"
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: styles.imageFit,
                    }}
                />
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>Product</div>
                <div style={{ opacity: 0.7, fontSize: "0.9em" }}>
                    {isFree ? "$0.00" : "$30.00"}
                </div>
            </div>
        </div>
    );
}
