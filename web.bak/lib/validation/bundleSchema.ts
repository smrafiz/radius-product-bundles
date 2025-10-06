import { z } from "zod";
import DOMPurify from "isomorphic-dompurify";
import { VALIDATION_MESSAGES } from "@/lib/constants";

// Sanitization transformer
const sanitizeHtml = (value: string) => {
    return DOMPurify.sanitize(value, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
    }).trim();
};

// Shopify GID validation
const productGidSchema = z
    .string()
    .regex(
        /^gid:\/\/shopify\/Product\/\d+$/,
        "Invalid Shopify Product GID format",
    );

const variantGidSchema = z
    .string()
    .regex(
        /^gid:\/\/shopify\/ProductVariant\/\d+$/,
        "Invalid Shopify ProductVariant GID format",
    );

// Volume tier schema
const volumeTierSchema = z.object({
    quantity: z.number().int().min(1),
    discount: z.number().min(0).max(100), // Percentage
});

// Product group schema for Mix & Match
const productGroupSchema = z.object({
    name: z.string().min(1, "Group name is required"),
    description: z.string().optional(),
    minSelection: z.number().int().min(0).default(0),
    maxSelection: z.number().int().min(1).optional(),
    displayOrder: z.number().int().default(0),
});

// Bundle settings schema
const bundleSettingsSchema = z
    .object({
        layout: z
            .enum(["GRID", "CAROUSEL", "LIST", "COMPACT", "FLOATING"])
            .default("GRID"),
        theme: z
            .enum(["LIGHT", "DARK", "STORE_DEFAULT", "CUSTOM"])
            .default("STORE_DEFAULT"),
        position: z
            .enum([
                "PRODUCT_PAGE_TOP",
                "PRODUCT_PAGE_BOTTOM",
                "ABOVE_ADD_TO_CART",
                "BELOW_ADD_TO_CART",
                "SIDEBAR",
                "FLOATING",
                "POPUP",
            ])
            .default("ABOVE_ADD_TO_CART"),
        showPrices: z.boolean().default(true),
        showSavings: z.boolean().default(true),
        showProductImages: z.boolean().default(true),
        enableQuickAdd: z.boolean().default(false),
        style: z
            .object({
                primaryColor: z.string().optional(),
                font: z.string().optional(),
                borderRadius: z.string().optional(),
                buttonStyle: z.string().optional(),
            })
            .optional(),
        widget: z
            .object({
                floating: z.boolean().optional(),
                autoHide: z.boolean().optional(),
                showOnMobile: z.boolean().optional(),
            })
            .optional(),
    })
    .optional();

export const bundleSchema = z
    .object({
        name: z
            .string()
            .min(1, VALIDATION_MESSAGES.REQUIRED_FIELD)
            .max(100, "Bundle name cannot exceed 100 characters")
            .transform(sanitizeHtml),

        description: z
            .string()
            .max(500, "Description cannot exceed 500 characters")
            .transform(sanitizeHtml)
            .optional(),

        type: z.enum([
            "FIXED_BUNDLE",
            "BUY_X_GET_Y",
            "BOGO",
            "VOLUME_DISCOUNT",
            "MIX_AND_MATCH",
            "FREQUENTLY_BOUGHT_TOGETHER",
        ]),

        mainProductId: productGidSchema.optional(),

        // Bundle mechanics
        buyQuantity: z.number().int().min(1).optional(),
        getQuantity: z.number().int().min(1).optional(),
        minimumItems: z.number().int().min(1).optional(),
        maximumItems: z.number().int().min(1).optional(),

        products: z
            .array(
                z.object({
                    productId: productGidSchema,
                    variantId: variantGidSchema,
                    quantity: z.number().int().min(1).max(1000),
                    role: z
                        .enum([
                            "TRIGGER",
                            "REWARD",
                            "INCLUDED",
                            "OPTIONAL",
                            "GROUP_OPTION",
                        ])
                        .default("INCLUDED"),
                    groupId: z.string().optional(),
                    customPrice: z.number().min(0).optional(),
                    discountPercent: z.number().min(0).max(100).optional(),
                }),
            )
            .min(1, VALIDATION_MESSAGES.NO_PRODUCTS_SELECTED)
            .max(20, "Cannot have more than 20 products in a bundle"),

        discountType: z.enum([
            "PERCENTAGE",
            "FIXED_AMOUNT",
            "CUSTOM_PRICE",
            "FREE_SHIPPING",
            "NO_DISCOUNT",
            "BUY_X_GET_Y",
            "QUANTITY_BREAKS",
        ]),

        discountValue: z.number().min(0).max(999999.99).default(0),
        minOrderValue: z.number().min(0).optional(),
        maxDiscountAmount: z.number().min(0).optional(),

        // Volume discount tiers
        volumeTiers: z.array(volumeTierSchema).optional(),

        // Mix & Match
        allowMixAndMatch: z.boolean().default(false),
        mixAndMatchPrice: z.number().min(0).optional(),
        productGroups: z.array(productGroupSchema).optional(),

        // Marketing
        marketingCopy: z.string().max(1000).transform(sanitizeHtml).optional(),
        seoTitle: z.string().max(60).transform(sanitizeHtml).optional(),
        seoDescription: z.string().max(160).transform(sanitizeHtml).optional(),
        images: z.array(z.string().url()).max(5).optional(),

        // Scheduling
        startDate: z.date().optional(),
        endDate: z.date().optional(),

        // Settings
        settings: bundleSettingsSchema,
    })
    .refine(
        (data) => {
            // Bundle-type-specific validations
            if (data.type === "BUY_X_GET_Y" || data.type === "BOGO") {
                return data.buyQuantity != null && data.getQuantity != null;
            }
            return true;
        },
        {
            message: "Buy X Get Y bundles require buyQuantity and getQuantity",
            path: ["buyQuantity"],
        },
    )
    .refine(
        (data) => {
            if (data.type === "VOLUME_DISCOUNT") {
                return data.volumeTiers != null && data.volumeTiers.length > 0;
            }
            return true;
        },
        {
            message: "Volume discount bundles require volume tiers",
            path: ["volumeTiers"],
        },
    )
    .refine(
        (data) => {
            if (data.type === "MIX_AND_MATCH") {
                return (
                    data.allowMixAndMatch &&
                    (data.mixAndMatchPrice != null || data.discountValue > 0)
                );
            }
            return true;
        },
        {
            message: "Mix and match bundles require pricing configuration",
            path: ["mixAndMatchPrice"],
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
    );

export type BundleFormData = z.infer<typeof bundleSchema>;
