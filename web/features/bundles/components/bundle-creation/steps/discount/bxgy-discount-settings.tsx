"use client";

import { useDiscountSettings } from "@/features/bundles";

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
        </s-stack>
    );
}
