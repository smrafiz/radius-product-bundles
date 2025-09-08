// web/app/bundles/create/[bundleType]/_components/steps/configuration/DiscountSettings.tsx
"use client";

import {
    BlockStack,
    Card,
    Text,
    Select,
    TextField,
    InlineStack,
} from "@shopify/polaris";
import { DISCOUNT_TYPES } from "@/lib/constants";
import { useBundleFormMethods } from "@/hooks/bundle/useBundleFormMethods";

export default function DiscountSettings() {
    const { watch, setValue, getFieldError } = useBundleFormMethods();

    const discountType = watch("discountType");
    const discountValue = watch("discountValue");
    const minOrderValue = watch("minOrderValue");
    const maxDiscountAmount = watch("maxDiscountAmount");

    const handleDiscountTypeChange = (value: string) => {
        setValue("discountType", value as any, { shouldValidate: true });

        // Reset max discount amount for custom price
        if (value === "CUSTOM_PRICE") {
            setValue("maxDiscountAmount", undefined, { shouldValidate: true });
        }
    };

    const handleDiscountValueChange = (value: string) => {
        const numValue = value === "" ? undefined : parseFloat(value);
        setValue("discountValue", numValue, { shouldValidate: true });
    };

    const handleMinOrderValueChange = (value: string) => {
        const numValue = value === "" ? undefined : parseFloat(value);
        setValue("minOrderValue", numValue, { shouldValidate: true });
    };

    const handleMaxDiscountAmountChange = (value: string) => {
        const numValue = value === "" ? undefined : parseFloat(value);
        setValue("maxDiscountAmount", numValue, { shouldValidate: true });
    };

    const getDiscountValueLabel = () => {
        switch (discountType) {
            case "PERCENTAGE":
                return "Discount Percentage";
            case "FIXED_AMOUNT":
                return "Discount Amount";
            case "CUSTOM_PRICE":
                return "Bundle Price";
            default:
                return "Discount Value";
        }
    };

    const getDiscountValueSuffix = () => {
        return discountType === "PERCENTAGE" ? "%" : "$";
    };

    const showDiscountValue = ["PERCENTAGE", "FIXED_AMOUNT", "CUSTOM_PRICE"].includes(discountType || "");
    const showMaxDiscountAmount = discountType !== "CUSTOM_PRICE" && discountType !== undefined;

    return (
        <Card>
            <BlockStack gap="400">
                <Text as="p" variant="headingMd" fontWeight="medium">
                    Discount Settings
                </Text>

                <Select
                    label="Discount Type"
                    options={[
                        { label: "Select discount type", value: "" },
                        ...DISCOUNT_TYPES.map((type) => ({
                            label: type.label,
                            value: type.value,
                        })),
                    ]}
                    value={discountType || ""}
                    onChange={handleDiscountTypeChange}
                    error={getFieldError("discountType")}
                    requiredIndicator
                />

                {showDiscountValue && (
                    <TextField
                        label={getDiscountValueLabel()}
                        type="number"
                        value={discountValue?.toString() || ""}
                        onChange={handleDiscountValueChange}
                        suffix={getDiscountValueSuffix()}
                        placeholder="0"
                        min={0}
                        max={discountType === "PERCENTAGE" ? 100 : undefined}
                        step="any"
                        error={getFieldError("discountValue")}
                        requiredIndicator
                    />
                )}

                <InlineStack gap="400">
                    <div style={{ flex: 1 }}>
                        <TextField
                            label="Minimum Order Value (Optional)"
                            type="number"
                            value={minOrderValue?.toString() || ""}
                            onChange={handleMinOrderValueChange}
                            prefix="$"
                            placeholder="0.00"
                            min={0}
                            step="any"
                            error={getFieldError("minOrderValue")}
                        />
                    </div>

                    {showMaxDiscountAmount && (
                        <div style={{ flex: 1 }}>
                            <TextField
                                label="Maximum Discount Amount (Optional)"
                                type="number"
                                value={maxDiscountAmount?.toString() || ""}
                                onChange={handleMaxDiscountAmountChange}
                                prefix="$"
                                placeholder="No limit"
                                min={0}
                                step="any"
                                error={getFieldError("maxDiscountAmount")}
                            />
                        </div>
                    )}
                </InlineStack>
            </BlockStack>
        </Card>
    );
}