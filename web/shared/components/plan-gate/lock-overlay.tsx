"use client";

import { useTranslations } from "@/lib/i18n/provider";
import { ROUTES } from "@/shared/constants/routes.constants";
import { type LockOverlayProps, useAppNavigation } from "@/shared";

export function LockOverlay({ feature, children }: LockOverlayProps) {
    const t = useTranslations("PlanGate");
    const label = t(`features.${feature}`, undefined, feature);
    const { goTo } = useAppNavigation();

    return (
        <div style={{ position: "relative" }}>
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
                    <svg
                        width="28"
                        height="28"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M14 8V6a4 4 0 0 0-8 0v2H5a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-1Zm-5-2a1 1 0 1 1 2 0v2H9V6Z"
                            fill="var(--p-color-icon-secondary, #6B7280)"
                        />
                    </svg>
                    <s-stack gap="small-200" align-items="center">
                        <s-heading>{label}</s-heading>
                        <s-text tone="neutral">
                            {t("lockOverlay.availableOnPaidPlans")}
                        </s-text>
                    </s-stack>
                    <s-button variant="primary" onClick={goTo(ROUTES.PRICING)}>
                        {t("lockOverlay.upgrade")}
                    </s-button>
                </s-stack>
            </div>
        </div>
    );
}
