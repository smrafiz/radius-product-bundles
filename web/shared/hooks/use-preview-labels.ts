"use client";

import type { WidgetLabels } from "@/shared";
import { useTranslations } from "@/lib/i18n/provider";

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
        bannerSavingText: t("bannerSavingText"),
        bannerCustomPriceText: t("bannerCustomPriceText"),
        bannerFreeShippingQualifyText: t("bannerFreeShippingQualifyText"),
        bannerFreeShippingText: t("bannerFreeShippingText"),
    };
}
