import { z } from "zod";
import { DISCOUNT_TYPES } from "@/lib/constants";
import { VALIDATION_MESSAGES } from "@/lib/constants";

const discountTypeValues = DISCOUNT_TYPES.map((type) => type.value) as [
    string,
    ...string[],
];

export const bundleSchema = z
    .object({
        name: z.string().min(1, VALIDATION_MESSAGES.REQUIRED_FIELD).trim(),
        description: z.string().optional(),
        products: z
            .array(z.any())
            .min(1, VALIDATION_MESSAGES.NO_PRODUCTS_SELECTED),
        discountType: z.enum(discountTypeValues, {
            message: VALIDATION_MESSAGES.DISCOUNT_TYPE_REQUIRED,
        }),
        discountValue: z
            .number({
                message: VALIDATION_MESSAGES.REQUIRED_FIELD,
            })
            .positive(VALIDATION_MESSAGES.INVALID_DISCOUNT_VALUE)
            .optional(),
        minOrderValue: z
            .number()
            .min(0, VALIDATION_MESSAGES.INVALID_MIN_ORDER)
            .optional(),
        maxDiscountAmount: z
            .number()
            .min(0, VALIDATION_MESSAGES.INVALID_MAX_DISCOUNT)
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
            message: VALIDATION_MESSAGES.REQUIRED_FIELD,
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
            message: VALIDATION_MESSAGES.INVALID_PERCENTAGE,
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
            message: VALIDATION_MESSAGES.CUSTOM_PRICE_INVALID,
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
            message: VALIDATION_MESSAGES.END_DATE_AFTER_START,
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
            message: VALIDATION_MESSAGES.MAX_DISCOUNT_NOT_APPLICABLE,
            path: ["maxDiscountAmount"],
        },
    );

export type BundleFormData = z.infer<typeof bundleSchema>;
