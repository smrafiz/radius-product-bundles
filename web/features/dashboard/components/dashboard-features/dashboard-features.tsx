"use client";

import { useAppNavigation } from "@/shared";
import { ROUTES } from "@/shared/constants";
import { useTranslations } from "@/lib/i18n/provider";

export function DashboardFeatures() {
    const { goTo } = useAppNavigation();
    const t = useTranslations("Dashboard.Features");

    return (
        <s-section padding="none">
            <s-grid
                gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))"
                alignItems="center"
                gap="base"
            >
                {/* LEFT SIDE */}
                <s-grid-item gridColumn="auto">
                    <s-image
                        alt="Radius Bundles features"
                        src="/assets/shopbuilder.jpg"
                        aspectRatio="16/9"
                        inlineSize="fill"
                        objectFit="cover"
                    />
                </s-grid-item>
                {/* RIGHT SIDE: Feature highlights */}
                <s-grid-item gridColumn="auto">
                    <s-stack gap="base" padding="base">
                        <s-heading>{t("heading")}</s-heading>
                        <s-unordered-list>
                            <s-list-item>{t("bundleTypes")}</s-list-item>
                            <s-list-item>{t("discounts")}</s-list-item>
                            <s-list-item>{t("styleCustomizer")}</s-list-item>
                            <s-list-item>{t("analytics")}</s-list-item>
                        </s-unordered-list>
                        <s-button
                            variant="primary"
                            onClick={goTo(ROUTES.BUNDLE_CREATE)}
                        >
                            {t("createBundle")}
                        </s-button>
                    </s-stack>
                </s-grid-item>
            </s-grid>
        </s-section>
    );
}
