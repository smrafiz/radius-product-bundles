import { z } from "zod";
import { DISCOUNT_TYPES } from "@/lib/constants";

const discountTypeValues = DISCOUNT_TYPES.map((type) => type.value) as [
    string,
    ...string[],
];

export const bundleSchema = z
    .object({
        name: z.string().min(1, "Bundle name is required").trim(),
        description: z.string().optional(),
        products: z
            .array(z.any())
            .min(1, "At least one product must be selected"),
        discountType: z.enum(discountTypeValues, {
            message: "Discount type is required",
        }),
        discountValue: z
            .number({
                message: "Discount value is required",
            })
            .positive("Discount value must be greater than 0")
            .optional(),
        minOrderValue: z
            .number()
            .min(0, "Minimum order value cannot be negative")
            .optional(),
        maxDiscountAmount: z
            .number()
            .min(0, "Maximum discount amount cannot be negative")
            .optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
    })
    .refine(
        (data) => {
            const requiresDiscountValue = [
                "PERCENTAGE",
                "FIXED_AMOUNT",
                "CUSTOM_PRICE",
            ].includes(data.discountType);
            return (
                !requiresDiscountValue ||
                (data.discountValue != null && data.discountValue > 0)
            );
        },
        {
            message: "Discount value is required for this discount type",
            path: ["discountValue"],
        },
    )
    .refine(
        (data) => {
            if (
                data.discountType === "PERCENTAGE" &&
                data.discountValue != null
            ) {
                return data.discountValue <= 100;
            }

            return true;
        },
        {
            message: "Percentage discount cannot exceed 100%",
            path: ["discountValue"],
        },
    )
    .refine(
        (data) => {
            if (
                data.discountType === "CUSTOM_PRICE" &&
                data.discountValue != null
            ) {
                return data.discountValue > 0;
            }

            return true;
        },
        {
            message: "Custom price must be greater than 0",
            path: ["discountValue"],
        },
    )
    .refine(
        (data) => {
            if (data.startDate && data.endDate) {
                return data.endDate > data.startDate;
            }

            return true;
        },
        {
            message: "End date must be after start date",
            path: ["endDate"],
        },
    )
    .refine(
        (data) => {
            if (data.discountType === "CUSTOM_PRICE") {
                return data.maxDiscountAmount == null;
            }

            return true;
        },
        {
            message:
                "Maximum discount amount is not applicable for custom price",
            path: ["maxDiscountAmount"],
        },
    );

export type BundleFormData = z.infer<typeof bundleSchema>;
