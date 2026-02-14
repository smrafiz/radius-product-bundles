"use client";

import {
    AppEmbedStatusBanner,
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
} from "@/features/dashboard";
import { useBundlesPage } from "@/features/bundles";
import { TitleBar } from "@shopify/app-bridge-react";
import { useSettingsStore } from "@/features/settings";
import { GlobalBanner, useNavigationActions } from "@/shared";
import { AnalyticsDisabledBanner } from "@/features/analytics";

export function DashboardPage() {
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
    const guideVisible = !setupGuide.dismissed && !setupGuide.isLoading;

    return (
        <s-page>
            <TitleBar>
                {bundlesLoading || setupGuide.isShowing ? (
                    <>
                        <s-button
                            slot="primary-action"
                            variant="primary"
                            loading={bundlesLoading}
                            disabled={setupGuide.isShowing}
                        >
                            Create Bundle
                        </s-button>
                        <s-button
                            slot="secondary-actions"
                            variant="secondary"
                            disabled={guideVisible || bundlesLoading}
                            loading={setupGuide.isShowing}
                        >
                            Setup guide
                        </s-button>
                    </>
                ) : (
                    <>
                        <button
                            variant="primary"
                            onClick={actions.create}
                            disabled={bundlesLoading}
                        >
                            Create Bundle
                        </button>
                        <button
                            onClick={setupGuide.showGuide}
                            disabled={guideVisible || setupGuide.isShowing}
                        >
                            Setup guide
                        </button>
                    </>
                )}
            </TitleBar>

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

                    {/* App Embed Status */}
                    <AppEmbedStatusBanner {...setupGuide} />

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
