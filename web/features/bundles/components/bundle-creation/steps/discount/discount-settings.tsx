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
        getDiscountValueLabel,
        getCurrency,
        getSuffix,
        getFieldError,
        showDiscountValue,
        showMaxDiscountAmount,
    } = useDiscountSettings();

    return (
        <s-stack gap="base">
            <s-heading>Discount Settings</s-heading>

            <s-select
                label="Discount Type"
                value={discountType || ""}
                error={getFieldError("discountType")}
                onChange={(event: Event) => {
                    const target = event.target as HTMLSelectElement;
                    handleDiscountTypeChange(target.value);
                }}
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
                    max={
                        discountType === "PERCENTAGE"
                            ? 100
                            : undefined
                    }
                    onChange={(event: Event) => {
                        const target = event.target as HTMLInputElement;
                        handleDiscountValueChange(target.value);
                    }}
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
                        error={getFieldError("minOrderValue")}
                    />
                </div>

                {showMaxDiscountAmount && (
                    <div className="flex-1">
                        <s-number-field
                            label="Maximum Discount Amount (Optional)"
                            value={
                                maxDiscountAmount?.toString() || ""
                            }
                            step={1}
                            min={0}
                            placeholder="No limit"
                            prefix={getCurrency()}
                            onChange={(event: Event) => {
                                const target = event.target as HTMLInputElement;
                                handleMaxDiscountAmountChange(target.value);
                            }}
                            error={getFieldError("maxDiscountAmount")}
                        />
                    </div>
                )}
            </s-stack>
        </s-stack>
    );
}