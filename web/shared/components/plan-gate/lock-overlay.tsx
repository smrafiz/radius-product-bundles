"use client";

import { type KeyboardEvent } from "react";
import { useTranslations } from "@/lib/i18n/provider";
import { type LockOverlayProps, ProBadge, useCrossSellStore } from "@/shared";

export function LockOverlay({ feature, children }: LockOverlayProps) {
    const t = useTranslations("PlanGate");
    const label = t(`features.${feature}`, undefined, feature);
    const { open } = useCrossSellStore();

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            open(label);
        }
    };

    return (
        <div
            role="button"
            tabIndex={0}
            aria-label={t("upgradePrompt", undefined, `Upgrade to Pro to access ${label}`)}
            style={{ position: "relative", cursor: "pointer" }}
            onClick={() => open(label)}
            onKeyDown={handleKeyDown}
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
                    borderRadius: "12px",
                    zIndex: 10,
                }}
            >
                <s-stack gap="base" align-items="center">
                    <ProBadge label={label} />
                </s-stack>
            </div>
        </div>
    );
}
