"use client";

import {
    CORNER_STYLE_VALUES,
    SHADOW_VALUES,
    SPACING_VALUES,
    TEXT_SIZE_VALUES,
} from "@/features/settings/constants/defaults.constants";
import { BundleTemplateProps, useEffectiveStyles } from "@/features/settings";

function TagIcon({ color }: { color: string }) {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
            style={{ flexShrink: 0 }}
        >
            <path
                d="M2 4a2 2 0 0 1 2-2h4.586a2 2 0 0 1 1.414.586l7 7a2 2 0 0 1 0 2.828l-4.586 4.586a2 2 0 0 1-2.828 0l-7-7A2 2 0 0 1 2 8.586V4Zm4.5 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
                fill={color}
            />
        </svg>
    );
}

function PercentIcon({ color }: { color: string }) {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
            style={{ flexShrink: 0 }}
        >
            <circle
                cx="6.5"
                cy="6.5"
                r="2.5"
                stroke={color}
                strokeWidth="1.5"
                fill="none"
            />
            <circle
                cx="13.5"
                cy="13.5"
                r="2.5"
                stroke={color}
                strokeWidth="1.5"
                fill="none"
            />
            <line
                x1="15"
                y1="5"
                x2="5"
                y2="15"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
}

function GiftIcon({ color }: { color: string }) {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
            style={{ flexShrink: 0 }}
        >
            <rect
                x="2"
                y="8"
                width="16"
                height="4"
                rx="1"
                stroke={color}
                strokeWidth="1.5"
                fill="none"
            />
            <rect
                x="4"
                y="12"
                width="12"
                height="6"
                rx="1"
                stroke={color}
                strokeWidth="1.5"
                fill="none"
            />
            <line
                x1="10"
                y1="8"
                x2="10"
                y2="18"
                stroke={color}
                strokeWidth="1.5"
            />
            <path
                d="M10 8C10 8 10 4 7 3C4 2 4 5 5.5 6C7 7 10 8 10 8Z"
                stroke={color}
                strokeWidth="1.3"
                fill="none"
            />
            <path
                d="M10 8C10 8 10 4 13 3C16 2 16 5 14.5 6C13 7 10 8 10 8Z"
                stroke={color}
                strokeWidth="1.3"
                fill="none"
            />
        </svg>
    );
}

function SparkleIcon({ color }: { color: string }) {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
            style={{ flexShrink: 0 }}
        >
            <path
                d="M10 1L11.8 7.2H18.2L13.2 11L15 17.2L10 13.4L5 17.2L6.8 11L1.8 7.2H8.2L10 1Z"
                fill={color}
            />
        </svg>
    );
}

function FireIcon({ color }: { color: string }) {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
            style={{ flexShrink: 0 }}
        >
            <path
                d="M10 1C10 1 5 7 5 12a5 5 0 0 0 10 0c0-5-5-11-5-11Zm0 14a2 2 0 0 1-2-2c0-1.5 2-4 2-4s2 2.5 2 4a2 2 0 0 1-2 2Z"
                fill={color}
            />
        </svg>
    );
}

function CheckIcon({ color }: { color: string }) {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
            style={{ flexShrink: 0 }}
        >
            <circle
                cx="10"
                cy="10"
                r="8"
                stroke={color}
                strokeWidth="1.5"
                fill="none"
            />
            <path
                d="M6 10l3 3 5-6"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
        </svg>
    );
}

function BannerIcon({ iconType, color }: { iconType: string; color: string }) {
    switch (iconType) {
        case "tag":
            return <TagIcon color={color} />;
        case "percent":
            return <PercentIcon color={color} />;
        case "gift":
            return <GiftIcon color={color} />;
        case "sparkle":
            return <SparkleIcon color={color} />;
        case "fire":
            return <FireIcon color={color} />;
        case "check":
            return <CheckIcon color={color} />;
        default:
            return null;
    }
}

export function TemplateCartBanner({ activeLayout }: BundleTemplateProps) {
    const styles = useEffectiveStyles();

    const textColor = styles.cartBannerTextColor || "#333333";
    const bgColor = styles.cartBannerBgColor || "#ffffff";
    const borderColor = styles.cartBannerBorderColor || "#303030";
    const highlightColor = styles.cartBannerHighlightColor || "#303030";
    const borderStyle = styles.cartBannerBorderStyle || "solid";
    const iconType = styles.cartBannerIconType || "tag";
    const iconColor = styles.cartBannerIconColor || "#303030";

    const radius =
        CORNER_STYLE_VALUES[styles.cartBannerCornerStyle || "modern"];
    const shadow = SHADOW_VALUES[styles.cartBannerShadow || "none"];
    const { padding, gap } =
        SPACING_VALUES[styles.cartBannerSpacing || "comfortable"];
    const { body: bodyFontSize } =
        TEXT_SIZE_VALUES[styles.cartBannerBodySize || "medium"];

    const containerStyle: React.CSSProperties = {
        border: `2px ${borderStyle} ${borderColor}`,
        borderRadius: radius,
        padding,
        backgroundColor: bgColor,
        boxShadow: shadow,
    };

    const priceStyle: React.CSSProperties = {
        color: highlightColor,
        fontWeight: 600,
    };

    const lineStyle: React.CSSProperties = {
        color: textColor,
        fontSize: bodyFontSize,
        lineHeight: 1.5,
        display: "flex",
        alignItems: "center",
        gap: gap / 2,
    };

    if (activeLayout === "COMPACT") {
        return (
            <div style={containerStyle}>
                <div style={{ ...lineStyle, fontSize: bodyFontSize - 1 }}>
                    <BannerIcon iconType={iconType} color={iconColor} />
                    <span style={priceStyle}>$999.00</span>
                    <span style={{ opacity: 0.5 }}>·</span>
                    <span style={priceStyle}>10% off</span>
                </div>
            </div>
        );
    }

    if (activeLayout === "GRID") {
        return (
            <div style={containerStyle}>
                <div style={lineStyle}>
                    <BannerIcon iconType={iconType} color={iconColor} />
                    <span>
                        Bundle price: <span style={priceStyle}>$999.00</span>
                        <span style={priceStyle}> (save 10%)</span>
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: gap / 2,
                }}
            >
                <div style={lineStyle}>
                    <BannerIcon iconType={iconType} color={iconColor} />
                    <span>
                        Special price: <span style={priceStyle}>$999.00</span>{" "}
                        for this bundle
                    </span>
                </div>
                <div style={lineStyle}>
                    <BannerIcon iconType={iconType} color={iconColor} />
                    <span>
                        You&apos;re saving <span style={priceStyle}>10%</span>{" "}
                        off with this bundle
                    </span>
                </div>
            </div>
        </div>
    );
}
