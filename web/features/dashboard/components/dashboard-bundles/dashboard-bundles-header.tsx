"use client";

import { ROUTES, SkeletonLine, useAppNavigation } from "@/shared";
import { useTranslations } from "@/lib/i18n/provider";

export function DashboardBundlesHeader({
    isLoading = false,
}: {
    isLoading?: boolean;
}) {
    const { goTo } = useAppNavigation();
    const t = useTranslations("Dashboard.Bundles");

    return (
        <s-grid
            gap="small"
            gridTemplateColumns="1fr auto"
            padding="base"
            paddingBlockEnd="large"
            alignItems="center"
        >
            <s-stack gap="small-300">
                <s-heading>{t("recentActive")}</s-heading>
                <s-text>{t("recentActiveDesc")}</s-text>
            </s-stack>
            <s-stack>
                {isLoading ? (
                    <div className="w-20">
                        <SkeletonLine height="h-8" width={100} duration={1.8} />
                    </div>
                ) : (
                    <s-button
                        icon="view"
                        variant="secondary"
                        accessibilityLabel={t("viewAll")}
                        onClick={goTo(ROUTES.BUNDLES)}
                    >
                        {t("viewAll")}
                    </s-button>
                )}
            </s-stack>
        </s-grid>
    );
}
