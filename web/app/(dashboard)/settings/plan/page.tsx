"use client";

import { Suspense } from "react";
import { useAppNavigation } from "@/shared";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslations } from "@/lib/i18n/provider";
import { BillingConfirmation, PlanSettingsTab } from "@/features/pricing";

export default function PlanPage() {
    const t = useTranslations("Pricing.PlanTab");
    const { goBack } = useAppNavigation();

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
                            onClick={() => goBack()}
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

                <PlanSettingsTab />
            </s-stack>
        </s-page>
    );
}
