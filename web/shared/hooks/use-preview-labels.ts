"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppBridge } from "@shopify/app-bridge-react";
import type { WidgetLabels } from "@/shared";
import { useLocale, useTranslations } from "@/lib/i18n/provider";
import { settingsQueries } from "@/features/settings/api/settings.queries";

/**
 * Returns translated PREVIEW_LABELS for the admin customizer preview.
 * Merchant-saved labels should be spread on top of this to preserve overrides.
 */
export function usePreviewLabels(): WidgetLabels {
    const t = useTranslations("Settings.PreviewLabels");

    return {
        headingLabel: t("headingLabel"),
        addToCartText: t("addToCartText"),
        quantityLabel: t("quantityLabel"),
        regularPriceLabel: t("regularPriceLabel"),
        bundlePriceLabel: t("bundlePriceLabel"),
        youSaveLabel: t("youSaveLabel"),
        freeShippingLabel: t("freeShippingLabel"),
        bogoFreeText: t("bogoFreeText"),
        bogoYouPayLabel: t("bogoYouPayLabel"),
        bogoYouSaveLabel: t("bogoYouSaveLabel"),
        bogoTotalLabel: t("bogoTotalLabel"),
        bogoSaveText: t("bogoSaveText"),
        bogoTriggerBadgeText: t("bogoTriggerBadgeText"),
        bogoRewardBadgeText: t("bogoRewardBadgeText"),
        checklistProgressText: t("checklistProgressText"),
        checklistHintText: t("checklistHintText"),
        checklistCompletedText: t("checklistCompletedText"),
        checklistLockedLabel: t("checklistLockedLabel"),
        checklistUnlockedLabel: t("checklistUnlockedLabel"),
        checklistPricingLockedText: t("checklistPricingLockedText"),
        volumeSelectQuantityLabel: t("volumeSelectQuantityLabel"),
        volumeYouSaveLabel: t("volumeYouSaveLabel"),
        volumeUnitLabel: t("volumeUnitLabel"),
        volumeUnitsLabel: t("volumeUnitsLabel"),
        volumeTotalCostLabel: t("volumeTotalCostLabel"),
        volumeCostPerUnitLabel: t("volumeCostPerUnitLabel"),
        volumeRegularPriceLabel: t("volumeRegularPriceLabel"),
        volumeSavePercentLabel: t("volumeSavePercentLabel"),
        volumeSaveAmountLabel: t("volumeSaveAmountLabel"),
        volumeSaveCustomLabel: t("volumeSaveCustomLabel"),
        volumeBuyUnitsLabel: t("volumeBuyUnitsLabel"),
        volumeBuyUnitsMoreLabel: t("volumeBuyUnitsMoreLabel"),
        volumeSelectLabel: t("volumeSelectLabel"),
        volumeAppliedLabel: t("volumeAppliedLabel"),
        bannerSavingText: t("bannerSavingText"),
        bannerCustomPriceText: t("bannerCustomPriceText"),
        bannerFreeShippingQualifyText: t("bannerFreeShippingQualifyText"),
        bannerFreeShippingText: t("bannerFreeShippingText"),
    };
}

/**
 * Merged preview labels: i18n defaults + merchant-saved overrides for the
 * active admin locale. Fetches labels per-locale from the backend, which
 * handles locale-keyed → flat extraction with fallback to primary locale.
 * Empty strings fall back to the i18n default.
 */
export function useMergedPreviewLabels(): WidgetLabels {
    const i18nLabels = usePreviewLabels();
    const locale = useLocale();
    const app = useAppBridge();
    const queries = settingsQueries(app);
    const { data: savedLabels } = useQuery(queries.labels(locale));

    return useMemo(
        () => ({
            ...i18nLabels,
            ...Object.fromEntries(
                Object.entries(savedLabels ?? {}).filter(
                    ([, val]) => typeof val === "string" && val !== "",
                ),
            ),
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [savedLabels, locale],
    );
}
