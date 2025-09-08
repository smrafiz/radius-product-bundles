import { z } from "zod";
import DOMPurify from "isomorphic-dompurify";
import { DISCOUNT_TYPES, VALIDATION_MESSAGES } from "@/lib/constants";

const discountTypeValues = DISCOUNT_TYPES.map((type) => type.value) as [
    string,
    ...string[],
];

// Sanitization transformer
const sanitizeHtml = (value: string) => {
    return DOMPurify.sanitize(value, {
        ALLOWED_TAGS: [], // No HTML tags allowed
        ALLOWED_ATTR: []
    }).trim();
};

// Shopify GID validation
const shopifyGidSchema = z.string().regex(
    /^gid:\/\/shopify\/[A-Za-z]+\/\d+$/,
    "Invalid Shopify GID format"
);

// Product-specific GID validation
const productGidSchema = z.string().regex(
    /^gid:\/\/shopify\/Product\/\d+$/,
    "Invalid Shopify Product GID format"
);

// Variant-specific GID validation
const variantGidSchema = z.string().regex(
    /^gid:\/\/shopify\/ProductVariant\/\d+$/,
    "Invalid Shopify ProductVariant GID format"
);

const requiresValueTypes = ["PERCENTAGE", "FIXED_AMOUNT", "CUSTOM_PRICE"];

export const bundleSchema = z
    .object({
        name: z.string()
            .min(1, VALIDATION_MESSAGES.REQUIRED_FIELD)
            .max(100, "Bundle name cannot exceed 100 characters")
            .transform(sanitizeHtml),
        description: z.string()
            .max(500, "Description cannot exceed 500 characters")
            .transform(sanitizeHtml)
            .optional(),
        products: z
            .array(z.object({
                productId: productGidSchema,
                variantId: variantGidSchema,
                quantity: z.number()
                    .int("Quantity must be a whole number")
                    .min(1, "Quantity must be at least 1")
                    .max(1000, "Quantity cannot exceed 1000"),
            }))
            .min(1, VALIDATION_MESSAGES.NO_PRODUCTS_SELECTED)
            .max(10, "Cannot have more than 10 products in a bundle"),
        discountType: z.enum(discountTypeValues, {
            message: VALIDATION_MESSAGES.DISCOUNT_TYPE_REQUIRED,
        }),
        discountValue: z
            .number({
                message: VALIDATION_MESSAGES.REQUIRED_FIELD,
            })
            .positive(VALIDATION_MESSAGES.INVALID_DISCOUNT_VALUE)
            .max(999999.99, "Discount value too large")
            .optional(),
        minOrderValue: z
            .number()
            .min(0, VALIDATION_MESSAGES.INVALID_MIN_ORDER)
            .max(999999.99, "Minimum order value too large")
            .optional(),
        maxDiscountAmount: z
            .number()
            .min(0, VALIDATION_MESSAGES.INVALID_MAX_DISCOUNT)
            .max(999999.99, "Maximum discount amount too large")
            .optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
    })
    .refine(
        (data) => {
            const requiresDiscountValue = requiresValueTypes.includes(
                data.discountType,
            );
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
