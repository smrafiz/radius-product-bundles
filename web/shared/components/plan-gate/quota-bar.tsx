"use client";

import {
    type QuotaBarProps,
    ROUTES,
    useAppNavigation,
    usePlan,
} from "@/shared";
import { useTranslations } from "@/lib/i18n/provider";

export function QuotaBar({ resource, label }: QuotaBarProps) {
    const t = useTranslations("PlanGate.quotaBar");
    const { quota } = usePlan();
    const { goTo } = useAppNavigation();
    const q = quota[resource];

    if (q.limit === -1) {
        return null;
    }

    const percentage = Math.round((q.current / q.limit) * 100);
    const isNearLimit = percentage >= 80;
    const isAtLimit = q.current >= q.limit;

    const displayLabel =
        label ?? (resource === "bundles" ? t("bundles") : t("products"));

    const barColor = isAtLimit
        ? "#DC2626"
        : isNearLimit
          ? "#F59E0B"
          : "#303030";

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
                    {t("used", { current: q.current, limit: q.limit })}
                </s-text>
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
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <s-text tone="critical">
                        {t("limitReached", { label: displayLabel })}
                    </s-text>
                    <s-button variant="tertiary" onClick={goTo(ROUTES.PRICING)}>
                        {t("upgradeForMore")}
                    </s-button>
                </div>
            )}
        </s-stack>
    );
}
