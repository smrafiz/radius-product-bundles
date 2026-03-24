"use client";

import { useAppNavigation } from "@/shared";
import { BundleTableEmptyStatesProps } from "@/features/bundles";
import { useTranslations } from "@/lib/i18n/provider";

/**
 * Bundle table empty states
 */
export function BundleTableEmptyStates({
    totalBundles,
    filteredBundlesCount,
}: BundleTableEmptyStatesProps) {
    const { bundleData } = useAppNavigation();
    const t = useTranslations("Bundles.Listing.EmptyState");
    const tListing = useTranslations("Bundles.Listing");

    if (totalBundles === 0) {
        return (
            <s-stack>
                <s-grid
                    gap="base"
                    justifyItems="center"
                    paddingBlock="large-400"
                >
                    <s-box maxInlineSize="200px" maxBlockSize="200px">
                        <s-image
                            aspectRatio="1/1"
                            src="/assets/empty.png"
                            alt={t("noDataTitle")}
                        />
                    </s-box>
                    <s-grid
                        justifyItems="center"
                        maxInlineSize="450px"
                        gap="base"
                    >
                        <s-stack alignItems="center">
                            <s-heading>{t("noDataTitle")}</s-heading>
                            <s-paragraph>{t("noDataDescription")}</s-paragraph>
                        </s-stack>
                        <s-button
                            icon="plus"
                            variant="primary"
                            accessibilityLabel={tListing("createBundle")}
                            onClick={bundleData.create()}
                        >
                            {tListing("createBundle")}
                        </s-button>
                    </s-grid>
                </s-grid>
            </s-stack>
        );
    }

    // No bundles match filters
    if (filteredBundlesCount === 0) {
        return (
            <s-stack>
                <s-grid
                    gap="base"
                    justifyItems="center"
                    paddingBlock="large-400"
                >
                    <s-box maxInlineSize="200px" maxBlockSize="200px">
                        <s-image
                            aspectRatio="1/1"
                            src="data:image/svg+xml,%3csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3e%3cpath fill-rule='evenodd' d='M41.87 24a17.87 17.87 0 11-35.74 0 17.87 17.87 0 0135.74 0zm-3.15 18.96a24 24 0 114.24-4.24L59.04 54.8a3 3 0 11-4.24 4.24L38.72 42.96z' fill='%238C9196'/%3e%3c/svg%3e"
                            alt={t("noFilterResultsTitle")}
                        />
                    </s-box>
                    <s-grid
                        justifyItems="center"
                        maxInlineSize="450px"
                        gap="base"
                    >
                        <s-stack alignItems="center">
                            <s-heading>{t("noFilterResultsTitle")}</s-heading>
                            <s-paragraph>
                                {t("noFilterResultsDescription")}
                            </s-paragraph>
                        </s-stack>
                    </s-grid>
                </s-grid>
            </s-stack>
        );
    }

    return null;
}
