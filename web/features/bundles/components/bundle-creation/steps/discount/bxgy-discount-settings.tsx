"use client";

import { useDiscountSettings } from "@/features/bundles";
import { useTranslations } from "@/lib/i18n/provider";

export function BxgyDiscountSettings() {
    const t = useTranslations("Bundles.Creation.Discount");
    const {
        discountType,
        discountValue,
        availableDiscountTypes,
        handleDiscountTypeChange,
        handleDiscountValueChange,
        createBlurHandler,
        getDiscountValueLabel,
        getSuffix,
        getPrefix,
        getFieldError,
        showDiscountValue,
    } = useDiscountSettings();

    return (
        <s-stack gap="base">
            <s-stack
                direction="inline"
                justifyContent="space-between"
                alignItems="center"
            >
                <s-heading>{t("rewardHeading")}</s-heading>
                <s-tooltip id="bxgy-discount-tooltip">
                    <s-text>{t("rewardTooltip")}</s-text>
                </s-tooltip>
                <s-icon
                    tone="neutral"
                    type="info"
                    interestFor="bxgy-discount-tooltip"
                />
            </s-stack>

            <s-banner tone="info">{t("rewardOnly")}</s-banner>

            <s-select
                label={t("discountType")}
                placeholder={t("selectType")}
                value={discountType || ""}
                error={getFieldError("discountType")}
                onChange={(event: Event) => {
                    const target = event.target as HTMLSelectElement;
                    handleDiscountTypeChange(target.value);
                }}
                onBlur={createBlurHandler("discountType")}
            >
                {availableDiscountTypes.map((config) => (
                    <s-option key={config.id} value={config.id}>
                        {config.id === "CUSTOM_PRICE"
                            ? t("rewardPrice")
                            : config.label}
                    </s-option>
                ))}
            </s-select>

            {discountType === "PERCENTAGE" && (
                <s-banner tone="info">{t("bogoFreeHint")}</s-banner>
            )}

            {showDiscountValue && (
                <s-number-field
                    label={
                        discountType === "CUSTOM_PRICE"
                            ? t("rewardProductPrice")
                            : getDiscountValueLabel()
                    }
                    value={discountValue?.toString() || ""}
                    step={1}
                    min={0}
                    placeholder="0"
                    prefix={getPrefix()}
                    suffix={getSuffix()}
                    max={discountType === "PERCENTAGE" ? 100 : undefined}
                    onChange={(event: Event) => {
                        const target = event.target as HTMLInputElement;
                        handleDiscountValueChange(target.value);
                    }}
                    onBlur={createBlurHandler("discountValue")}
                    error={getFieldError("discountValue")}
                />
            )}
        </s-stack>
    );
}
