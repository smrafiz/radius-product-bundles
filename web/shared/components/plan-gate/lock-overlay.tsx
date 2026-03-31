"use client";

import { useTranslations } from "@/lib/i18n/provider";
import { type LockOverlayProps } from "@/shared";
import { useCrossSellStore } from "./cross-sell-modal";
import { ProBadge } from "./pro-badge";

export function LockOverlay({ feature, children }: LockOverlayProps) {
    const t = useTranslations("PlanGate");
    const label = t(`features.${feature}`, undefined, feature);
    const { open } = useCrossSellStore();

    return (
        <div
            style={{ position: "relative", cursor: "pointer" }}
            onClick={() => open(label)}
        >
            <div
                style={{
                    filter: "blur(2px)",
                    opacity: 0.4,
                    pointerEvents: "none",
                    userSelect: "none",
                }}
            >
                {children}
            </div>
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(255, 255, 255, 0.7)",
                    borderRadius: "12px",
                    zIndex: 10,
                }}
            >
                <s-stack gap="base" align-items="center">
                    <ProBadge label={label} />
                    <s-stack gap="small-200" align-items="center">
                        <s-heading>{label}</s-heading>
                        <s-text tone="neutral">
                            {t("lockOverlay.availableOnPaidPlans")}
                        </s-text>
                    </s-stack>
                </s-stack>
            </div>
        </div>
    );
}
