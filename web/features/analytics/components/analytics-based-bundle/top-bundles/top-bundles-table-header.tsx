/*
 * Table Header
 */
import { useTranslations } from "@/lib/i18n/provider";

export function TopBundlesTableHeader() {
    const t = useTranslations("Analytics.TopBundles");
    return (
        <s-table-header-row>
            <s-table-header listSlot="primary">
                <s-stack padding="small-300">{t("columnBundle")}</s-stack>
            </s-table-header>
            <s-table-header listSlot="inline">
                <s-stack paddingBlock="small-300">{t("columnAssessment")}</s-stack>
            </s-table-header>
            <s-table-header>
                <s-stack paddingBlock="small-300">{t("columnRevenueAov")}</s-stack>
            </s-table-header>
            <s-table-header>
                <s-stack paddingBlock="small-300">{t("columnOrders")}</s-stack>
            </s-table-header>
            <s-table-header>
                <s-stack paddingBlock="small-300">{t("columnViews")}</s-stack>
            </s-table-header>
            <s-table-header>
                <s-stack paddingBlock="small-300">{t("columnConversion")}</s-stack>
            </s-table-header>
        </s-table-header-row>
    );
}
