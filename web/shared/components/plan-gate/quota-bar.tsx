"use client";

import { usePlan } from "@/shared/hooks/plan";
import { useAppNavigation, ROUTES } from "@/shared";

interface QuotaBarProps {
    resource: "bundles" | "products";
    label?: string;
}

export function QuotaBar({ resource, label }: QuotaBarProps) {
    const { quota } = usePlan();
    const { goTo } = useAppNavigation();
    const q = quota[resource];

    if (q.limit === -1) return null;

    const percentage = Math.round((q.current / q.limit) * 100);
    const isNearLimit = percentage >= 80;
    const isAtLimit = q.current >= q.limit;

    const displayLabel =
        label ?? (resource === "bundles" ? "Bundles" : "Products");

    const barColor = isAtLimit
        ? "var(--p-color-text-critical, #DC2626)"
        : isNearLimit
          ? "var(--p-color-text-caution, #F59E0B)"
          : "var(--p-color-text-info, #2563EB)";

    return (
        <s-stack gap="small-200">
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <s-text>{displayLabel}</s-text>
                <s-text tone="neutral">
                    {q.current}/{q.limit} used
                </s-text>
            </div>
            <div
                style={{
                    height: "6px",
                    background: "var(--p-color-bg-fill-secondary, #E5E7EB)",
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <s-text tone="critical">{displayLabel} limit reached</s-text>
                    <s-button variant="tertiary" onClick={goTo(ROUTES.PRICING)}>
                        Upgrade for more
                    </s-button>
                </div>
            )}
        </s-stack>
    );
}
