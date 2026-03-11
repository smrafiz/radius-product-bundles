"use client";

import { useTranslations } from "@/lib/i18n/provider";

/*
 * Table Header
 */
export function DashboardBundlesTableHeader() {
    const t = useTranslations("Dashboard.Bundles");

    return (
        <s-table-header-row>
            <s-table-header listSlot="primary">
                <s-stack padding="small-300">{t("item")}</s-stack>
            </s-table-header>
            <s-table-header>
                <s-stack paddingBlock="small-300">{t("name")}</s-stack>
            </s-table-header>
            <s-table-header>
                <s-stack paddingBlock="small-300">{t("type")}</s-stack>
            </s-table-header>
            <s-table-header>
                <s-stack paddingBlock="small-300">{t("views")}</s-stack>
            </s-table-header>
            <s-table-header>
                <s-stack paddingBlock="small-300">{t("conversion")}</s-stack>
            </s-table-header>
            <s-table-header>
                <s-stack paddingBlock="small-300">{t("revenue")}</s-stack>
            </s-table-header>
            <s-table-header>
                <s-stack paddingBlock="small-300">{t("status")}</s-stack>
            </s-table-header>
        </s-table-header-row>
    );
}
