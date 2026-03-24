"use client";

import { useAppNavigation } from "@/shared";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslations } from "@/lib/i18n/provider";
import { PricingCard, PricingFaq, PricingStore } from "@/features/pricing";

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

                <s-stack gap="large">
                    {/* Pricing Store */}
                    <PricingStore />

                    {/* Pricing Cards */}
                    <PricingCard />

                    {/* Pricing Faq */}
                    <PricingFaq />
                </s-stack>
            </s-stack>
        </s-page>
    );
}
