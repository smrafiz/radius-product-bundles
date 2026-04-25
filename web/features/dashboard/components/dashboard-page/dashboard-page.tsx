"use client";

import {
    DashboardBundles,
    DashboardCalloutCards,
    DashboardFeatures,
    DashboardMediaCard,
    DashboardMetrics,
    DashboardQuickActions,
    DashboardReviewBanner,
    DashboardSetUpGuide,
    DashboardVideo,
    useSetupGuide,
    WidgetStatusBanner,
} from "@/features/dashboard";
import { useBundlesPage } from "@/features/bundles";
import { useSettingsStore } from "@/features/settings";
import { GlobalBanner, useNavigationActions } from "@/shared";
import { AnalyticsDisabledBanner } from "@/features/analytics";
import { useTranslations } from "@/lib/i18n/provider";

export function DashboardPage() {
    const t = useTranslations("Dashboard");
    const { onCreateBundle } = useBundlesPage();
    const setupGuide = useSetupGuide();
    const isAnalyticsDisabled = useSettingsStore((state) => {
        const settings = state.getEffectiveData();
        return settings?.enableAnalytics === false;
    });

    const { actions, isLoading } = useNavigationActions({
        create: onCreateBundle,
    });

    const bundlesLoading = isLoading("create");
    const guideVisible = setupGuide.isLoading || !setupGuide.dismissed;

    return (
        <s-page heading={t("title")}>
            <s-button
                variant="primary"
                slot="primary-action"
                loading={bundlesLoading}
                onClick={actions.create}
            >
                {t("createBundle")}
            </s-button>
            <s-button
                variant="secondary"
                slot="secondary-actions"
                loading={setupGuide.isShowing}
                disabled={guideVisible}
                onClick={setupGuide.showGuide}
            >
                {t("setupGuide")}
            </s-button>

            <s-stack
                gap="large"
                paddingBlockStart="large"
                paddingBlockEnd="large"
            >
                <s-stack gap="base">
                    {/* Banner */}
                    <GlobalBanner />

                    {/* Setup Guide */}
                    <DashboardSetUpGuide {...setupGuide} />

                    {/* Integration Status (app embed + widget block) */}
                    <WidgetStatusBanner
                        shopDomain={setupGuide.shopDomain}
                        apiKey={setupGuide.apiKey}
                        setupGuideVisible={guideVisible}
                    />

                    {/* Analytics Disabled Warning */}
                    {isAnalyticsDisabled && <AnalyticsDisabledBanner />}

                    {/* Metrics overview */}
                    <DashboardMetrics />

                    {/* Recent bundles */}
                    <DashboardBundles />

                    {/* Quick actions */}
                    <DashboardQuickActions />

                    {/* Features */}
                    <DashboardFeatures />

                    {/* Guidance + Review */}
                    <s-grid
                        gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))"
                        gap="base"
                        alignItems="stretch"
                    >
                        <s-grid-item gridColumn="auto">
                            <DashboardMediaCard />
                        </s-grid-item>
                        <s-grid-item gridColumn="auto">
                            <DashboardReviewBanner />
                        </s-grid-item>
                    </s-grid>

                    {/* Video overview */}
                    <DashboardVideo />

                    {/* Useful links */}
                    <DashboardCalloutCards />
                </s-stack>
            </s-stack>
        </s-page>
    );
}
