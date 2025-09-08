import { z } from "zod";
import { BundleStatus } from "@prisma/client";
import { DISCOUNT_TYPES, VALIDATION_MESSAGES } from "@/lib/constants";

export type DiscountType = (typeof DISCOUNT_TYPES)[number]["value"];

const discountTypeValues = DISCOUNT_TYPES.map((t) => t.value) as [
    DiscountType,
    ...DiscountType[],
];

// Product schema for bundle products
export const bundleProductSchema = z.object({
    id: z.string().min(1, VALIDATION_MESSAGES.PRODUCT_ID),
    productId: z.string().min(1, VALIDATION_MESSAGES.PRODUCT_ID),
    variantId: z.string().optional(),
    quantity: z
        .number()
        .int()
        .min(1, VALIDATION_MESSAGES.MIN_QUANTITY)
        .max(99, VALIDATION_MESSAGES.MAX_QUANTITY),
    isRequired: z.boolean().default(true),
    displayOrder: z.number().int().min(0).optional(),
    // UI-only fields (not saved to DB)
    title: z.string().optional(),
    price: z.number().min(0).optional(),
    image: z.string().optional(),
});

// Main bundle schema
export const bundleSchema = z
    .object({
        name: z
            .string()
            .min(1, VALIDATION_MESSAGES.REQUIRED_FIELD)
            .max(100, VALIDATION_MESSAGES.MAX_LENGTH)
            .trim(),

        description: z
            .string()
            .max(500, VALIDATION_MESSAGES.MAX_DESC_LENGTH)
            .optional()
            .or(z.literal("")), // Allow empty string

        products: z
            .array(bundleProductSchema)
            .min(1, VALIDATION_MESSAGES.NO_PRODUCTS_SELECTED)
            .max(10, VALIDATION_MESSAGES.MAX_PRODUCTS),

        discountType: z.enum(discountTypeValues, {
            message: VALIDATION_MESSAGES.DISCOUNT_TYPE_REQUIRED,
        }),

        discountValue: z
            .number({ message: VALIDATION_MESSAGES.REQUIRED_FIELD })
            .min(0, VALIDATION_MESSAGES.INVALID_DISCOUNT_VALUE)
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

        // Bundle status
        status: z
            .enum(
                Object.values(BundleStatus) as [
                    BundleStatus,
                    ...BundleStatus[],
                ],
            )
            .default(BundleStatus.DRAFT),
    })
    // Discount refinements
    .refine(
        (data) => {
            const requiresDiscountValue: DiscountType[] = [
                "PERCENTAGE",
                "FIXED_AMOUNT",
                "CUSTOM_PRICE",
            ];
            return (
                !requiresDiscountValue.includes(data.discountType) ||
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
    )
    .refine(
        (data) => {
            // Check for duplicate products
            const productIds = data.products.map(
                (p) => `${p.productId}-${p.variantId || "default"}`,
            );
            const uniqueIds = new Set(productIds);
            return uniqueIds.size === productIds.length;
        },
        {
            message: VALIDATION_MESSAGES.DUPLICATE_PRODUCTS,
            path: ["products"],
        },
    );

export type BundleFormData = z.infer<typeof bundleSchema>;
export type BundleProduct = z.infer<typeof bundleProductSchema>;
