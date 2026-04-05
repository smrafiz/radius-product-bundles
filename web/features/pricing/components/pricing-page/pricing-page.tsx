"use client";

import {
    PricingCard,
    PricingFaq,
    PlanStatusCard,
    FeatureComparisonTable,
} from "@/features/pricing";
import { useAppNavigation } from "@/shared";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslations } from "@/lib/i18n/provider";

export function PricingPage() {
    const t = useTranslations("Pricing");
    const { goBack } = useAppNavigation();

    return (
        <s-page>
            <TitleBar></TitleBar>
            <s-stack
                gap="large"
                paddingBlockStart="large"
                paddingBlockEnd="large"
            >
                {/* Header row */}
                <s-stack direction="inline" gap="base">
                    <s-stack paddingBlockStart="small-500">
                        <s-button
                            onClick={() => goBack()}
                            icon="arrow-left"
                            accessibilityLabel={t("back")}
                        ></s-button>
                    </s-stack>
                    <s-stack>
                        <s-heading>
                            <div className="text-lg">{t("title")}</div>
                        </s-heading>
                        <s-text color="subdued">{t("description")}</s-text>
                    </s-stack>
                </s-stack>

                {/* Zone 1: Plan status card */}
                <PlanStatusCard />

                {/* Zone 2+3: Billing toggle + plan cards */}
                <PricingCard />

                {/* Zone 4: Feature comparison table */}
                <FeatureComparisonTable />

                {/* Zone 5: FAQ */}
                <PricingFaq />
            </s-stack>
        </s-page>
    );
}
