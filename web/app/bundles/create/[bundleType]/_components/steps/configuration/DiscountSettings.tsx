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
import { useBundleValidation } from "@/hooks/bundle/useBundleValidation";
import { useShopSettings } from "@/hooks";
import { getCurrencySymbol } from "@/utils";
import { useBundleStore } from "@/stores";

export default function DiscountSettings() {
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
                        autoComplete="off"
                        value={discountValue?.toString() || ""}
                        onChange={handleDiscountValueChange}
                        suffix={getSuffix()}
                        placeholder="0"
                        min={0}
                        max={discountType === "PERCENTAGE" ? 100 : undefined}
                        error={getFieldError("discountValue")}
                        requiredIndicator
                    />
                )}

                <InlineStack gap="400">
                    <div style={{ flex: 1 }}>
                        <TextField
                            label="Minimum Order Value (Optional)"
                            type="number"
                            autoComplete="off"
                            value={minOrderValue?.toString() || ""}
                            onChange={handleMinOrderValueChange}
                            prefix={getCurrency()}
                            placeholder="0.00"
                            min={0}
                            error={getFieldError("minOrderValue")}
                        />
                    </div>

                    {showMaxDiscountAmount && (
                        <div style={{ flex: 1 }}>
                            <TextField
                                label="Maximum Discount Amount (Optional)"
                                type="number"
                                autoComplete="off"
                                value={maxDiscountAmount?.toString() || ""}
                                onChange={handleMaxDiscountAmountChange}
                                prefix={getCurrency()}
                                placeholder="No limit"
                                min={0}
                                error={getFieldError("maxDiscountAmount")}
                            />
                        </div>
                    )}
                </InlineStack>
            </BlockStack>
        </Card>
    );
}
