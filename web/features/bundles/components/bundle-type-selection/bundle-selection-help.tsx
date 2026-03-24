"use client";

import { useTranslations } from "@/lib/i18n/provider";
import { BUNDLE_HELP_ITEMS } from "@/features/bundles";

export function BundleSelectionHelp() {
    const t = useTranslations("Bundles.Selection");

    const helpKeys = [
        "orderValue",
        "discovery",
        "acquisition",
        "campaigns",
    ] as const;

    return (
        <s-section>
            <s-stack gap="base">
                <s-stack gap="small-200">
                    <s-heading>{t("helpTitle")}</s-heading>
                    <s-text>{t("helpDescription")}</s-text>
                </s-stack>

                <s-divider />

                <s-grid
                    gridTemplateColumns="repeat(auto-fit, minmax(350px, 1fr))"
                    gap="base"
                    justifyContent="center"
                >
                    {BUNDLE_HELP_ITEMS.map((item, index) => (
                        <s-grid-item key={index} gridColumn="auto">
                            <s-stack gap="small-500">
                                <s-heading>
                                    {t(`helpItems.${helpKeys[index]}`)}
                                </s-heading>
                                <s-text>{item.bundles}</s-text>
                            </s-stack>
                        </s-grid-item>
                    ))}
                </s-grid>
            </s-stack>
        </s-section>
    );
}
