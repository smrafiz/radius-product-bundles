"use client";

import {
    PricingCard,
    PricingFaq,
    PlanStatusCard,
    FeatureComparisonTable,
} from "@/features/pricing";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslations } from "@/lib/i18n/provider";

export function PricingPage() {
    const t = useTranslations("Pricing");

    return (
        <s-page>
            <TitleBar></TitleBar>
            <s-stack
                gap="large"
                paddingBlockStart="large"
                paddingBlockEnd="large"
            >
                {/* Header row */}
                <s-stack>
                    <div className="text-center">
                        <s-heading>
                            <div className="text-base text-center">{t("title")}</div>
                        </s-heading>
                        <s-text color="subdued">{t("description")}</s-text>
                    </div>
                </s-stack>

                {/* Zone 2+3: Billing toggle + plan cards */}
                <PricingCard />

                {/* Zone 1: Plan status card */}
                <PlanStatusCard />

                {/* Zone 4: Feature comparison table */}
                <FeatureComparisonTable />

                {/* Zone 5: FAQ */}
                <PricingFaq />
            </s-stack>
        </s-page>
    );
}
