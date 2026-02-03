"use client";

import {
    getCardRadius,
    getSpacing,
    TierCardProps,
    useCustomizerStore,
} from "@/features/settings";

export function TierCard({ label, variant, children }: TierCardProps) {
    const { styles } = useCustomizerStore();
    const cardRadius = getCardRadius(styles.cornerStyle);
    const gap = getSpacing(styles.spacing);

    return (
        <div
            style={{
                border:
                    variant === "cards"
                        ? `1px solid ${styles.borderColor}`
                        : "none",
                borderRadius: variant === "cards" ? cardRadius : undefined,
                padding: variant === "cards" ? "12px" : "0",
                borderBottom:
                    variant === "list"
                        ? `1px solid ${styles.borderColor}`
                        : undefined,
                paddingBottom: variant === "list" ? gap : undefined,
            }}
        >
            <div
                style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: styles.primaryColor,
                    marginBottom: "8px",
                }}
            >
                {label}
            </div>
            {children}
        </div>
    );
}
