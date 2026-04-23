/*
 * Table Header
 */

import { SortHeaderProps, useBundleSort } from "@/features/analytics";
import { useTranslations } from "@/lib/i18n/provider";

function SortHeader({
    field,
    label,
    currentSort,
    currentOrder,
    onSort,
    format,
    listSlot = "labeled",
}: SortHeaderProps) {
    const isActive = currentSort === field;
    const icon = isActive ? (currentOrder === "desc" ? "↓" : "↑") : "";

    return (
        <s-table-header listSlot={listSlot} format={format}>
            <div className="-ml-3">
                <s-button variant="tertiary" onClick={() => onSort(field)}>
                    <span
                        style={{
                            borderBottom: ".125rem dotted #cccccc",
                            cursor: "n-resize",
                            display: "inline-block",
                        }}
                    >
                        {label} {icon}
                    </span>
                </s-button>
            </div>
        </s-table-header>
    );
}

export function AllBundlesTableHeader() {
    const t = useTranslations("Analytics.AllBundles");
    return (
        <s-table-header-row>
            <s-table-header listSlot="primary">
                <s-stack padding="small-300">{t("columnBundle")}</s-stack>
            </s-table-header>
            <s-table-header listSlot="inline">
                <s-stack paddingBlock="small-300">{t("columnStatus")}</s-stack>
            </s-table-header>
            <s-table-header>
                <s-stack paddingBlock="small-300">{t("columnRevenue")}</s-stack>
            </s-table-header>
            <s-table-header>
                <s-stack paddingBlock="small-300">{t("columnOrders")}</s-stack>
            </s-table-header>
            <s-table-header>
                <s-stack paddingBlock="small-300">{t("columnViews")}</s-stack>
            </s-table-header>
            <s-table-header>
                <s-stack paddingBlock="small-300">{t("columnCart")}</s-stack>{" "}
            </s-table-header>
            <s-table-header>
                <s-stack paddingBlock="small-300">{t("columnConv")}</s-stack>{" "}
            </s-table-header>
            <s-table-header>
                <s-stack paddingBlock="small-300">{t("columnFunnel")}</s-stack>
            </s-table-header>
            <s-table-header>
                <s-stack paddingBlock="small-300">{t("columnHealth")}</s-stack>
            </s-table-header>
        </s-table-header-row>
    );
}
