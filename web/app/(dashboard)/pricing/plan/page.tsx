"use client";

import { Suspense } from "react";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslations } from "@/lib/i18n/provider";
import { useAppNavigation, ROUTES } from "@/shared";
import { BillingConfirmation, PlanStatusCard } from "@/features/pricing";

export default function PricingPlanPage() {
    const t = useTranslations("Pricing.PlanTab");
    const { goTo } = useAppNavigation();

    return (
        <s-page>
            <TitleBar title={t("pageTitle")} />
            <s-stack
                gap="large"
                paddingBlockStart="large"
                paddingBlockEnd="large"
            >
                <s-stack direction="inline" gap="base">
                    <s-stack paddingBlockStart="small-500">
                        <s-button
                            onClick={goTo(ROUTES.PRICING)}
                            icon="arrow-left"
                            accessibilityLabel={t("back")}
                        />
                    </s-stack>
                    <s-heading>
                        <div className="text-lg">{t("pageTitle")}</div>
                    </s-heading>
                </s-stack>

                <Suspense>
                    <BillingConfirmation />
                </Suspense>

                <PlanStatusCard />
            </s-stack>
        </s-page>
    );
}
