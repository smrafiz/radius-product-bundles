"use client";
import { useBundleFormMethods } from "@/hooks/bundle/useBundleFormMethods";

import {
    DISCOUNT_TYPES,
    getDiscountProperty,
    useBundleStore,
    useBundleValidation,
} from "@/features/bundles";
import { getCurrencySymbol, useShopSettings } from "@/shared";

export function DiscountSettings() {
    const { watch, setValue } = useBundleFormMethods();
    const { getFieldError } = useBundleValidation();
    const { markDirty } = useBundleStore();

    const discountType = watch("discountType");
    const discountValue = watch("discountValue");
    const minOrderValue = watch("minOrderValue");
    const maxDiscountAmount = watch("maxDiscountAmount");

    const { isLoading, currencyCode } = useShopSettings();
    const currencySymbol = getCurrencySymbol(currencyCode);

    const handleDiscountTypeChange = (value: string) => {
        setValue("discountType", value as any, {
            shouldValidate: true,
            shouldDirty: true,
        });
        markDirty();

        if (value === "CUSTOM_PRICE") {
            setValue("maxDiscountAmount", undefined, {
                shouldValidate: true,
                shouldDirty: true,
            });
        }
    };

    const handleDiscountValueChange = (value: string) => {
        const numValue = value === "" ? undefined : parseFloat(value);
        setValue("discountValue", numValue, {
            shouldValidate: true,
            shouldDirty: true,
        });
        markDirty();
    };

    const handleMinOrderValueChange = (value: string) => {
        const numValue = value === "" ? undefined : parseFloat(value);
        setValue("minOrderValue", numValue, {
            shouldValidate: true,
            shouldDirty: true,
        });
        markDirty();
    };

    const handleMaxDiscountAmountChange = (value: string) => {
        const numValue = value === "" ? undefined : parseFloat(value);
        setValue("maxDiscountAmount", numValue, {
            shouldValidate: true,
            shouldDirty: true,
        });
        markDirty();
    };

    const getDiscountValueLabel = () => {
        return getDiscountProperty(discountType, "label") || "Discount Value";
    };

    const getCurrency = () => {
        if (isLoading && !currencyCode) {
            return "•";
        }
        return currencySymbol;
    };

    const getSuffix = () => {
        return discountType === "PERCENTAGE" ? "%" : getCurrency();
    };

    const showDiscountValue = [
        "PERCENTAGE",
        "FIXED_AMOUNT",
        "CUSTOM_PRICE",
    ].includes(discountType || "");
    const showMaxDiscountAmount =
        discountType !== "CUSTOM_PRICE" && discountType !== undefined;

    return (
        <s-section>
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
                    {Object.values(DISCOUNT_TYPES).map((config) => (
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
                            const value = target.value;
                            handleDiscountValueChange(value);
                        }}
                        error={getFieldError("discountValue")}
                    />
                )}

                <s-stack gap="base">
                    <div style={{ flex: 1 }}>
                        <s-number-field
                            label="Minimum Order Value (Optional)"
                            value={minOrderValue?.toString() || ""}
                            step={1}
                            min={0}
                            placeholder="0.00"
                            prefix={getCurrency()}
                            onChange={(event: Event) => {
                                const target = event.target as HTMLInputElement;
                                const value = target.value;
                                handleMinOrderValueChange(value);
                            }}
                            error={getFieldError("minOrderValue")}
                        />
                    </div>

                    {showMaxDiscountAmount && (
                        <div style={{ flex: 1 }}>
                            <s-number-field
                                label="Maximum Discount Amount (Optional)"
                                value={maxDiscountAmount?.toString() || ""}
                                step={1}
                                min={0}
                                placeholder="No limit"
                                prefix={getCurrency()}
                                onChange={(event: Event) => {
                                    const target = event.target as HTMLInputElement;
                                    const value = target.value;
                                    handleMaxDiscountAmountChange(value);
                                }}
                                error={getFieldError("maxDiscountAmount")}
                            />
                        </div>
                    )}
                </s-stack>
            </s-stack>
        </s-section>
    );
}
