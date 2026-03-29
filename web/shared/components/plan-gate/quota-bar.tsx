"use client";

import { usePlan } from "@/shared/hooks/plan";

interface QuotaBarProps {
    resource: "bundles" | "products";
    label?: string;
}

export function QuotaBar({ resource, label }: QuotaBarProps) {
    const { quota } = usePlan();
    const q = quota[resource];

    if (q.limit === -1) return null;

    const percentage = Math.round((q.current / q.limit) * 100);
    const isNearLimit = percentage >= 80;
    const isAtLimit = q.current >= q.limit;

    const displayLabel =
        label ?? (resource === "bundles" ? "Bundles" : "Products");

    const barColor = isAtLimit
        ? "#DC2626"
        : isNearLimit
          ? "#F59E0B"
          : "#2563EB";

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "13px",
                    color: "#374151",
                }}
            >
                <span style={{ fontWeight: 500 }}>{displayLabel}</span>
                <span>
                    {q.current}/{q.limit} used
                </span>
            </div>
            <div
                style={{
                    height: "6px",
                    background: "#E5E7EB",
                    borderRadius: "3px",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        width: `${Math.min(percentage, 100)}%`,
                        height: "100%",
                        background: barColor,
                        borderRadius: "3px",
                        transition: "width 0.3s ease",
                    }}
                />
            </div>
            {isAtLimit && (
                <div
                    style={{
                        fontSize: "12px",
                        color: "#DC2626",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <span>
                        {displayLabel} limit reached
                    </span>
                    <button
                        onClick={() => {
                            // No-op for now. Wire to billing/pricing route later.
                        }}
                        style={{
                            fontSize: "12px",
                            color: "#2563EB",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            textDecoration: "underline",
                        }}
                    >
                        Upgrade for more
                    </button>
                </div>
            )}
        </div>
    );
}
