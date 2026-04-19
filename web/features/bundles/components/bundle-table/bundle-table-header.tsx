import { memo } from "react";
import { BundleTableHeaderProps } from "@/features/bundles";
import { useTranslations } from "@/lib/i18n/provider";

/*
 * Bundle table header components
 */
export const BundleTableHeader = memo(function BundleTableHeader({
    selectedResources,
    allResourcesSelected,
    toggleAllSelection,
}: BundleTableHeaderProps) {
    const t = useTranslations("Bundles.Listing.Table");
    const isIndeterminate =
        selectedResources.length > 0 && !allResourcesSelected;

    return (
        <s-table-header-row>
            <s-table-header listSlot="primary">
                <s-stack direction="inline" gap="small" alignItems="center">
                    <s-checkbox
                        aria-label="Select all bundles"
                        indeterminate={isIndeterminate}
                        checked={allResourcesSelected}
                        onChange={(e: Event) => {
                            e.stopPropagation();
                            toggleAllSelection();
                        }}
                    />
                    <s-stack paddingBlock="small-400">{t("name")}</s-stack>
                </s-stack>
            </s-table-header>

            <s-table-header>{t("products")}</s-table-header>
            <s-table-header>{t("type")}</s-table-header>
            <s-table-header>{t("discount")}</s-table-header>
            <s-table-header>{t("status")}</s-table-header>
            <s-table-header>
                <span className="block text-center">{t("actions")}</span>
            </s-table-header>
        </s-table-header-row>
    );
});
