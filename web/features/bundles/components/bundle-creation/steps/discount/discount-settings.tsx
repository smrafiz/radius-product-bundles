"use client";

import { useDiscountSettings } from "@/features/bundles/hooks/ui/use-discount-settings";

/**
 * Discount settings configuration component
 */
export function DiscountSettings() {
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
                <s-heading>Discount Settings</s-heading>
                <s-tooltip id="discount-settings-tooltip">
                    <s-text>
                        Configure the discount type and value applied when
                        customers purchase this bundle.
                    </s-text>
                </s-tooltip>
                <s-icon
                    tone="neutral"
                    type="info"
                    interestFor="discount-settings-tooltip"
                />
            </s-stack>

            <s-select
                label="Discount Type"
                value={discountType || ""}
                error={getFieldError("discountType")}
                onChange={(event: Event) => {
                    const target = event.target as HTMLSelectElement;
                    handleDiscountTypeChange(target.value);
                }}
                onBlur={createBlurHandler("discountType")}
            >
                <s-option value="">Select discount type</s-option>
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
                        label="Minimum Order Value (Optional)"
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
                            label="Maximum Discount Amount (Optional)"
                            value={maxDiscountAmount?.toString() || ""}
                            step={1}
                            min={0}
                            placeholder="No limit"
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
