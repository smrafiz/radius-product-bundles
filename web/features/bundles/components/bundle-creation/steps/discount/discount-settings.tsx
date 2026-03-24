"use client";

import { useDiscountSettings } from "@/features/bundles/hooks/ui/use-discount-settings";
import { useTranslations } from "@/lib/i18n/provider";

/**
 * Discount settings configuration component
 */
export function DiscountSettings() {
    const t = useTranslations("Bundles.Creation.Discount");
    const {
        discountType,
        discountValue,
        minOrderValue,
        maxDiscountAmount,
        availableDiscountTypes,
        handleDiscountTypeChange,
        handleDiscountValueChange,
        handleMinOrderValueChange,
        handleMaxDiscountAmountChange,
        createBlurHandler,
        getDiscountValueLabel,
        getCurrency,
        getSuffix,
        getPrefix,
        getFieldError,
        showDiscountValue,
        showMaxDiscountAmount,
    } = useDiscountSettings();

    return (
        <s-stack gap="base">
            <s-stack
                direction="inline"
                justifyContent="space-between"
                alignItems="center"
            >
                <s-heading>{t("heading")}</s-heading>
                <s-tooltip id="discount-settings-tooltip">
                    <s-text>{t("tooltip")}</s-text>
                </s-tooltip>
                <s-icon
                    tone="neutral"
                    type="info"
                    interestFor="discount-settings-tooltip"
                />
            </s-stack>

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
                        {config.label}
                    </s-option>
                ))}
            </s-select>

            {showDiscountValue && (
                <s-number-field
                    label={getDiscountValueLabel()}
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

            <s-stack gap="base">
                <div className="flex-1">
                    <s-number-field
                        label={t("minOrderValue")}
                        value={minOrderValue?.toString() || ""}
                        step={1}
                        min={0}
                        placeholder="0.00"
                        prefix={getCurrency()}
                        onChange={(event: Event) => {
                            const target = event.target as HTMLInputElement;
                            handleMinOrderValueChange(target.value);
                        }}
                        onBlur={createBlurHandler("minOrderValue")}
                        error={getFieldError("minOrderValue")}
                    />
                </div>

                {showMaxDiscountAmount && (
                    <div className="flex-1">
                        <s-number-field
                            label={t("maxDiscount")}
                            value={maxDiscountAmount?.toString() || ""}
                            step={1}
                            min={0}
                            placeholder={t("noLimit")}
                            prefix={getCurrency()}
                            onChange={(event: Event) => {
                                const target = event.target as HTMLInputElement;
                                handleMaxDiscountAmountChange(target.value);
                            }}
                            onBlur={createBlurHandler("maxDiscountAmount")}
                            error={getFieldError("maxDiscountAmount")}
                        />
                    </div>
                )}
            </s-stack>
        </s-stack>
    );
}
