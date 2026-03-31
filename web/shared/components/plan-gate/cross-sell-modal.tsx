"use client";

import { create } from "zustand";
import { useTranslations } from "@/lib/i18n/provider";
import { useAppNavigation } from "@/shared";
import { ROUTES } from "@/shared/constants/routes.constants";

export const useCrossSellStore = create<{
    isOpen: boolean;
    featureLabel: string;
    open: (featureLabel: string) => void;
    close: () => void;
}>((set) => ({
    isOpen: false,
    featureLabel: "",
    open: (featureLabel) => {
        set({ isOpen: true, featureLabel });
        setTimeout(() => {
            const el = document.getElementById(
                "radius-cross-sell-modal",
            ) as HTMLElement & { showOverlay?: () => void };
            el?.showOverlay?.();
        }, 50);
    },
    close: () => set({ isOpen: false, featureLabel: "" }),
}));

export function CrossSellModal() {
    const t = useTranslations("PlanGate.crossSell");
    const { isOpen, featureLabel, close } = useCrossSellStore();
    const { goTo } = useAppNavigation();

    if (!isOpen) return null;

    return (
        <s-modal
            id="radius-cross-sell-modal"
            accessibilityLabel="upgrade to pro"
            heading={t("heading", undefined, "Unlock Pro Features")}
            size="base"
        >
            <s-stack gap="base">
                <s-stack gap="small-200">
                    <s-text>
                        {t("description", { feature: featureLabel })}
                    </s-text>
                </s-stack>

                <s-stack gap="small-300">
                    {["feature1", "feature2", "feature3", "feature4"].map(
                        (key) => {
                            const text = t(`benefits.${key}`, undefined, "");
                            if (!text) return null;
                            return (
                                <s-stack
                                    key={key}
                                    direction="inline"
                                    gap="small-300"
                                    alignItems="center"
                                >
                                    <s-icon
                                        type="check-circle"
                                        tone="success"
                                    />
                                    <s-text>{text}</s-text>
                                </s-stack>
                            );
                        },
                    )}
                </s-stack>
            </s-stack>

            <s-button
                slot="secondary-actions"
                variant="secondary"
                commandFor="radius-cross-sell-modal"
                command="--hide"
                onClick={close}
            >
                {t("maybeLater", undefined, "Maybe later")}
            </s-button>

            <s-button
                slot="primary-action"
                variant="primary"
                commandFor="radius-cross-sell-modal"
                command="--hide"
                onClick={() => {
                    close();
                    goTo(ROUTES.PRICING)();
                }}
            >
                {t("viewPlans", undefined, "View Plans")}
            </s-button>
        </s-modal>
    );
}
