"use client";

import {
    GlobalBanner,
    MetricCard,
    useAppNavigation,
    useNavigationActions,
} from "@/shared";
import {
    BundleTable,
    BundleTableSkeleton,
    useBundlesPage,
} from "@/features/bundles";
import { useTranslations } from "@/lib/i18n/provider";
import { useSettingsStore } from "@/features/settings";
import { AnalyticsDisabledBanner } from "@/features/analytics";
import { WidgetStatusBanner, useSetupGuide } from "@/features/dashboard";

/**
 * Bundle listing page
 */
export function BundleListingPage() {
    const {
        metrics,
        showTableSkeleton,
        isMetricsLoading,
        onCreateBundle,
        onBundleStudio,
    } = useBundlesPage();
    const { analytics } = useAppNavigation();
    const { shopDomain, apiKey } = useSetupGuide();

    const t = useTranslations("Bundles.Listing");

    const isAnalyticsDisabled = useSettingsStore((state) => {
        const settings = state.getEffectiveData();
        return settings?.enableAnalytics === false;
    });

    const { actions, isLoading } = useNavigationActions({
        create: onCreateBundle,
        analytics: analytics,
    });

    const bundlesLoading = isLoading("create");
    const analyticsLoading = isLoading("analytics");

    return (
        <s-page heading={t("title")}>
            <s-button
                variant="primary"
                slot="primary-action"
                loading={bundlesLoading}
                disabled={analyticsLoading}
                onClick={actions.create}
            >
                {t("createBundle")}
            </s-button>
            <s-button
                variant="secondary"
                slot="secondary-actions"
                loading={analyticsLoading}
                disabled={bundlesLoading}
                onClick={actions.analytics}
            >
                {t("viewAnalytics")}
            </s-button>

            <s-stack
                gap="large"
                paddingBlockStart="large"
                paddingBlockEnd="large"
            >
                <s-stack>
                    <div className="text-center">
                        <s-heading>
                            <div className="text-base text-center">
                                {t("title")}
                            </div>
                        </s-heading>
                        <s-text color="subdued">{t("description")}</s-text>
                    </div>
                </s-stack>

                <s-stack gap="base">
                    {/* Banner */}
                    <GlobalBanner />

                    {/* Analytics Disabled Warning */}
                    {isAnalyticsDisabled && <AnalyticsDisabledBanner />}

                    {/* Widget Block Status */}
                    <WidgetStatusBanner
                        shopDomain={shopDomain}
                        apiKey={apiKey}
                        setupGuideVisible={false}
                    />

                    {/* Metrics overview */}
                    <s-stack gap="base">
                        <s-grid
                            gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))"
                            gap="base"
                            justifyContent="center"
                        >
                            {metrics.map((metric, index) => (
                                <s-grid-item key={index} gridColumn="auto">
                                    <MetricCard
                                        key={index}
                                        {...metric}
                                        loading={isMetricsLoading}
                                    />
                                </s-grid-item>
                            ))}
                        </s-grid>
                    </s-stack>

                    {/* Bundle list */}
                    <s-stack>
                        {showTableSkeleton ? (
                            <BundleTableSkeleton />
                        ) : (
                            <BundleTable />
                        )}
                    </s-stack>
                </s-stack>
            </s-stack>
        </s-page>
    );
}
