"use client";

import {
    DISCOUNT_TYPES,
    DiscountType,
    getDiscountProperty,
    getDiscountTypesForBundle,
    useBundleField,
    useBundleStore,
    useBundleValidation,
} from "@/features/bundles";
import { getCurrencySymbol, useShopSettings } from "@/shared";

/**
 * Discount settings configuration component
 */
export function DiscountSettings() {
    const { getFieldError } = useBundleValidation();
    const { markDirty, bundleData } = useBundleStore();

    // Get bundle type for filtering discount options
    const bundleType = bundleData.type;

    // Use the hook for each field
    const discountTypeField = useBundleField<string>("discountType");
    const discountValueField = useBundleField<number | undefined>(
        "discountValue",
    );
    const minOrderValueField = useBundleField<number | undefined>(
        "minOrderValue",
    );
    const maxDiscountAmountField = useBundleField<number | undefined>(
        "maxDiscountAmount",
    );

    const { isLoading, currencyCode } = useShopSettings();
    const currencySymbol = getCurrencySymbol(currencyCode);

    // Get filtered discount types based on the bundle type
    const availableDiscountTypes = bundleType
        ? getDiscountTypesForBundle(bundleType)
        : Object.values(DISCOUNT_TYPES);

    const handleDiscountTypeChange = (value: string) => {
        discountTypeField.handleChange(value as any);

        if (value === "CUSTOM_PRICE") {
            maxDiscountAmountField.handleChange(undefined);
        }

        markDirty();
    };

    const getDiscountValueLabel = () => {
        return (
            getDiscountProperty(
                discountTypeField.value as DiscountType,
                "label",
            ) || "Discount Value"
        );
    };

    const getCurrency = () => {
        if (isLoading && !currencyCode) return "•";
        return currencySymbol;
    };

    const getSuffix = () => {
        return discountTypeField.value === "PERCENTAGE" ? "%" : getCurrency();
    };

    const showDiscountValue = [
        "PERCENTAGE",
        "FIXED_AMOUNT",
        "CUSTOM_PRICE",
    ].includes(discountTypeField.value || "");

    const showMaxDiscountAmount =
        discountTypeField.value !== "CUSTOM_PRICE" &&
        discountTypeField.value !== undefined;

    return (
        <s-stack gap="base">
            <s-heading>Discount Settings</s-heading>

            <s-select
                label="Discount Type"
                value={discountTypeField.value || ""}
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
                    value={discountValueField.value?.toString() || ""}
                    step={1}
                    min={0}
                    placeholder="0"
                    suffix={getSuffix()}
                    max={
                        discountTypeField.value === "PERCENTAGE"
                            ? 100
                            : undefined
                    }
                    onChange={(event: Event) => {
                        const target = event.target as HTMLInputElement;
                        const numValue =
                            target.value === ""
                                ? undefined
                                : parseFloat(target.value);
                        discountValueField.handleChange(numValue);
                    }}
                    error={getFieldError("discountValue")}
                />
            )}

            <s-stack gap="base">
                <div className="flex-1">
                    <s-number-field
                        label="Minimum Order Value (Optional)"
                        value={minOrderValueField.value?.toString() || ""}
                        step={1}
                        min={0}
                        placeholder="0.00"
                        prefix={getCurrency()}
                        onChange={(event: Event) => {
                            const target = event.target as HTMLInputElement;
                            const numValue =
                                target.value === ""
                                    ? undefined
                                    : parseFloat(target.value);
                            minOrderValueField.handleChange(numValue);
                        }}
                        error={getFieldError("minOrderValue")}
                    />
                </div>

                {showMaxDiscountAmount && (
                    <div className="flex-1">
                        <s-number-field
                            label="Maximum Discount Amount (Optional)"
                            value={
                                maxDiscountAmountField.value?.toString() || ""
                            }
                            step={1}
                            min={0}
                            placeholder="No limit"
                            prefix={getCurrency()}
                            onChange={(event: Event) => {
                                const target = event.target as HTMLInputElement;
                                const numValue =
                                    target.value === ""
                                        ? undefined
                                        : parseFloat(target.value);
                                maxDiscountAmountField.handleChange(numValue);
                            }}
                            error={getFieldError("maxDiscountAmount")}
                        />
                    </div>
                )}
            </s-stack>
        </s-stack>
    );
}