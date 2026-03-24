"use client";

import {
    BUNDLE_TYPES,
    BundleSelectionHelp,
    BundleTypeCard,
} from "@/features/bundles";
import { PlanIcon } from "@/features/dashboard";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslations } from "@/lib/i18n/provider";
import { MediaCard, useAppNavigation, ROUTES } from "@/shared";

export function BundleTypeSelection() {
    const t = useTranslations("Bundles.Selection");
    const tc = useTranslations("Bundles.Common");
    const { goBack, goTo, bundleData } = useAppNavigation();

    return (
        <s-page heading={t("title")}>
            <TitleBar title={t("title")}>
                <button variant="breadcrumb" onClick={bundleData.list()}>
                    {tc("breadcrumb")}
                </button>
            </TitleBar>
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
                            accessibilityLabel={tc("back")}
                        ></s-button>
                    </s-stack>
                    <s-stack>
                        <s-heading>
                            <div className="text-xl">{t("title")}</div>
                        </s-heading>
                        <s-text>{t("description")}</s-text>
                    </s-stack>
                </s-stack>
                <s-stack gap="base">
                    <s-grid
                        gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))"
                        gap="base"
                        justifyContent="center"
                    >
                        {Object.values(BUNDLE_TYPES)
                            .filter((bt) => !bt.hidden)
                            .map((bundleType) => (
                                <s-grid-item
                                    key={bundleType.id}
                                    gridColumn="auto"
                                >
                                    <BundleTypeCard bundleType={bundleType} />
                                </s-grid-item>
                            ))}
                    </s-grid>
                </s-stack>
                <s-stack>
                    <MediaCard
                        title={t("upgradePlan")}
                        description={t("upgradePlanDesc")}
                        buttonLabel={t("seeDetails")}
                        onButtonClick={goTo(ROUTES.PRICING)}
                        icon={<PlanIcon />}
                    />
                </s-stack>
                <s-stack>
                    <BundleSelectionHelp />
                </s-stack>
            </s-stack>
        </s-page>
    );
}
