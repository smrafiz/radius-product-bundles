"use client";

import { useEffect } from "react";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { useSettingsStore } from "@/features/settings";
import { AnalyticsDisabledBanner, AnalyticsTabs } from "@/features/analytics";
import { updateSetupStepAction } from "@/features/dashboard/actions/setup-guide.action";

export function AnalyticsPage() {
    const app = useAppBridge();

    // Mark "analyticsViewed" setup step as complete on mount
    useEffect(() => {
        app.idToken().then((token) => {
            void updateSetupStepAction(token, "analyticsViewed", true);
        });
    }, []);

    const isAnalyticsDisabled = useSettingsStore((state) => {
        const settings = state.getEffectiveData();
        return settings?.enableAnalytics === false;
    });

    return (
        <s-page>
            <TitleBar></TitleBar>
            <s-stack
                gap="large"
                paddingBlockStart="large"
                paddingBlockEnd="large"
            >
                <s-stack>
                    <div className="text-center">
                        <s-heading>
                            <div className="text-base text-center">
                                Bundle Analytics & Customer Insights
                            </div>
                        </s-heading>
                        <s-text color="subdued">
                            Comprehensive insights into your bundle performance
                            and customer behavior.
                        </s-text>
                    </div>
                </s-stack>

                <s-stack gap="base">
                    {isAnalyticsDisabled && <AnalyticsDisabledBanner />}
                    <AnalyticsTabs />
                </s-stack>
            </s-stack>
        </s-page>
    );
}
