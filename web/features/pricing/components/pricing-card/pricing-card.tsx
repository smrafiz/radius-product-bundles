"use client";

import {
    PRICING_CARD,
    SUBSCRIPTION_PLANS,
    PLAN_PRICING,
    SubscriptionPlanType,
    PricingCardItem,
} from "@/features/pricing";
import { useTranslations } from "@/lib/i18n/provider";
import { useState } from "react";
import { createSubscriptionAction } from "@/features/pricing/actions/create-subscription.action";
import { useAppBridge } from "@shopify/app-bridge-react";

export const PricingCard = () => {
    const t = useTranslations("Pricing");
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const app = useAppBridge();

    const handleSubscribe = async (planId: SubscriptionPlanType) => {
        setLoadingPlan(planId);
        try {
            const sessionToken = await app.idToken();

            const result = await createSubscriptionAction(sessionToken, planId);

            if (result.status === "success" && result.confirmationUrl) {
                window.open(result.confirmationUrl, "_top");
            } else if (result.error) {
                console.error("[Pricing] Subscription error:", result.error);
            }
        } catch (error) {
            console.error("Subscription error:", error);
        } finally {
            setLoadingPlan(null);
        }
    };

    const getButtonContent = (planId: string) => {
        if (planId === SUBSCRIPTION_PLANS.FREE) {
            return t("plans.free.currentPlan");
        }
        if (loadingPlan === planId) {
            return t("pleaseWait");
        }
        return t(`plans.${planId}.button`);
    };

    const getButtonProps = (planId: string) => {
        const baseProps = PRICING_CARD.find((p) => p.id === planId)
            ?.primaryButton.props || {
            variant: "primary" as const,
        };

        if (planId === SUBSCRIPTION_PLANS.FREE) {
            return { ...baseProps, disabled: true };
        }

        return baseProps;
    };

    return (
        <s-grid
            gridTemplateColumns="repeat(auto-fit, minmax(280px, 1fr))"
            gap="base"
            justifyContent="center"
        >
            {PRICING_CARD.map((item) => (
                <s-grid-item key={item.id} gridColumn="auto">
                    <PricingCardItem
                        {...item}
                        title={t(`plans.${item.id}.title`)}
                        description={t(`plans.${item.id}.description`)}
                        featuredText={
                            item.featuredText
                                ? t(`plans.${item.id}.featured`)
                                : undefined
                        }
                        frequency={t("plans.month")}
                        features={item.features}
                        primaryButton={{
                            ...item.primaryButton,
                            content: getButtonContent(item.id),
                            loading: loadingPlan === item.id,
                            props: getButtonProps(item.id),
                        }}
                        onSubscribe={() =>
                            handleSubscribe(item.id as SubscriptionPlanType)
                        }
                    />
                </s-grid-item>
            ))}
        </s-grid>
    );
};
