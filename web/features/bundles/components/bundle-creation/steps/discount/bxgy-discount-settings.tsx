"use client";

import { triggerSaveBar } from "@/shared";
import { useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { useBundleStore, useDiscountSettings } from "@/features/bundles";

export function BxgyDiscountSettings() {
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

    const { bundleData, setBundleData, markDirty, markFieldTouched } =
        useBundleStore();
    const { setValue } = useFormContext();

    const usesPerOrderLimit = bundleData.usesPerOrderLimit;

    const handleUsesPerOrderLimitChange = useCallback(
        (value: string) => {
            const numValue = value === "" ? null : parseInt(value, 10);
            setValue("usesPerOrderLimit", numValue, { shouldDirty: true });
            setBundleData({ usesPerOrderLimit: numValue });
            markDirty();
            triggerSaveBar();
        },
        [setValue, setBundleData, markDirty],
    );

    const handleUsesPerOrderLimitBlur = useCallback(() => {
        markFieldTouched("usesPerOrderLimit");
    }, [markFieldTouched]);

    return (
        <s-stack gap="base">
            <s-stack
                direction="inline"
                justifyContent="space-between"
                alignItems="center"
            >
                <s-heading>Reward Discount</s-heading>
                <s-tooltip id="bxgy-discount-tooltip">
                    <s-text>
                        This discount applies only to the reward product(s) the
                        customer gets. Trigger products are always at full
                        price.
                    </s-text>
                </s-tooltip>
                <s-icon
                    tone="neutral"
                    type="info"
                    interestFor="bxgy-discount-tooltip"
                />
            </s-stack>

            <s-banner tone="info">
                Discount applies to reward products only
            </s-banner>

            <s-select
                label="Discount Type"
                placeholder="Select discount type"
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
                            ? "Set price for reward product"
                            : config.label}
                    </s-option>
                ))}
            </s-select>

            {showDiscountValue && (
                <s-number-field
                    label={
                        discountType === "CUSTOM_PRICE"
                            ? "Reward product price"
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

            <s-divider />

            <s-stack gap="small">
                <s-stack direction="inline" alignItems="center" gap="small-200">
                    <s-heading>Deal Stacking Limit</s-heading>
                    <s-tooltip id="uses-per-order-tooltip">
                        <s-text>
                            Limits how many times this deal can apply per order.
                            Leave empty for unlimited. E.g., set to 1 so a
                            customer can only get 1 free item per order.
                        </s-text>
                    </s-tooltip>
                    <s-icon
                        tone="neutral"
                        type="info"
                        interestFor="uses-per-order-tooltip"
                    />
                </s-stack>

                <s-number-field
                    label="Maximum uses per order"
                    value={usesPerOrderLimit?.toString() || ""}
                    step={1}
                    min={1}
                    placeholder="Unlimited"
                    onChange={(event: Event) => {
                        const target = event.target as HTMLInputElement;
                        handleUsesPerOrderLimitChange(target.value);
                    }}
                    onBlur={handleUsesPerOrderLimitBlur}
                    error={getFieldError("usesPerOrderLimit")}
                />
            </s-stack>
        </s-stack>
    );
}
