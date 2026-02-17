import { z } from "zod";
import { sanitizeHtml } from "@/shared";
import { VALIDATION_MESSAGES } from "@/shared/constants";

/**
 * Validates the Shopify Product GID format.
 */
const productGidSchema = z
    .string()
    .regex(
        /^gid:\/\/shopify\/Product\/\d+$/,
        "Invalid Shopify Product GID format",
    );

/**
 * Validates the Shopify ProductVariant GID format.
 */
const variantGidSchema = z
    .string()
    .regex(
        /^gid:\/\/shopify\/ProductVariant\/\d+$/,
        "Invalid Shopify ProductVariant GID format",
    );

/**
 * Schema for volume discount tiers.
 */
const volumeTierSchema = z.object({
    quantity: z.number().int().min(1),
    discount: z.number().min(0).max(100),
});

/**
 * Schema for product groups in Mix & Match bundles.
 */
const productGroupSchema = z.object({
    name: z.string().min(1, "Group name is required"),
    description: z.string().optional(),
    minSelection: z.number().int().min(0).default(0),
    maxSelection: z.number().int().min(1).optional(),
    displayOrder: z.number().int().default(0),
});

/**
 * Schema for bundle widget display settings.
 */
const bundleSettingsSchema = z
    .object({
        layout: z.enum(["GRID", "CAROUSEL", "LIST", "COMPACT"]).default("GRID"),
        theme: z
            .enum(["LIGHT", "DARK", "STORE_DEFAULT", "CUSTOM"])
            .default("STORE_DEFAULT"),
        title: z
            .string()
            .min(1, "Offer title is required")
            .max(100)
            .default("Bundle Offers"),
        cartButtonText: z
            .string()
            .min(1, "Cart button text is required")
            .max(50)
            .default("Add bundle to cart"),
        showImages: z.boolean().default(true),
        showSavingsBadge: z.boolean().default(true),
        showPrices: z.boolean().default(true),
        showComparePrices: z.boolean().default(true),
        showQuantity: z.boolean().default(true),
        showSavings: z.boolean().default(true),
        showFreeShipping: z.boolean().default(true),
        enableHyperLink: z.boolean().default(false),
        style: z
            .object({
                primaryColor: z.string().optional(),
                secondaryColor: z.string().optional(),
                textColor: z.string().optional(),
                buttonFontSize: z.number().optional(),
                buttonBgColor: z.string().optional(),
                buttonTextColor: z.string().optional(),
                buttonRadius: z.number().optional(),
                badgeFontSize: z.number().optional(),
                badgeBgColor: z.string().optional(),
                badgeTextColor: z.string().optional(),
                badgeRadius: z.number().optional(),
                productBgColor: z.string().optional(),
                productTextColor: z.string().optional(),
                productBorderColor: z.string().optional(),
                productRadius: z.number().optional(),
                productFontSize: z.number().optional(),
                boxBgColor: z.string().optional(),
                boxBorderColor: z.string().optional(),
                boxRadius: z.number().optional(),
                boxBorderWidth: z.number().optional(),
                boxMaxWidth: z.number().optional(),
                boxAlignment: z.string().optional(),
                imageRadius: z.number().optional(),
                imageSize: z.number().optional(),
                imageFit: z.enum(["cover", "contain", "fill"]).optional(),
                headingFontSize: z.number().optional(),
                headingColor: z.string().optional(),
                headingTransform: z.string().optional(),
                headingLabel: z.string().optional(),
                quantityLabel: z.string().optional(),
                regularPriceLabel: z.string().optional(),
                bundlePriceLabel: z.string().optional(),
                youSaveLabel: z.string().optional(),
                freeShippingLabel: z.string().optional(),
            })
            .optional(),
        widget: z
            .object({
                showOnMobile: z.boolean().optional(),
            })
            .optional(),
    })
    .optional();

/**
 * Main bundle validation schema.
 */
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

        status: z
            .enum([
                "DRAFT",
                "ACTIVE",
                "PAUSED",
                "ARCHIVED",
                "SCHEDULED",
                "DELETED",
            ])
            .default("DRAFT")
            .optional(),

        createProduct: z.boolean().default(true).optional(),
        productTitle: z.string().max(120).optional(),
        productDescription: z.string().max(5000).optional(),
        images: z
            .array(
                z.string().regex(/^https?:\/\/.+\..+$/, {
                    message: "Must be a valid URL starting with https://",
                }),
            )
            .max(10)
            .optional(),

        mainProductId: productGidSchema.optional(),
        mainVariantId: variantGidSchema.optional(),

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
                    role: z.enum([
                        "TRIGGER",
                        "REWARD",
                        "INCLUDED",
                        "OPTIONAL",
                        "GROUP_OPTION",
                    ]),
                }),
            )
            .min(2, VALIDATION_MESSAGES.NO_PRODUCTS_SELECTED)
            .max(20, "Cannot have more than 20 products in a bundle"),

        discountType: z.enum([
            "PERCENTAGE",
            "FIXED_AMOUNT",
            "CUSTOM_PRICE",
            "NO_DISCOUNT",
            "BUY_X_GET_Y",
            "QUANTITY_BREAKS",
        ]),

        discountValue: z.number().min(0).max(999999.99).default(0),
        minOrderValue: z.number().min(0).max(999999.99).optional(),
        maxDiscountAmount: z.number().min(0).max(999999.99).optional(),

        volumeTiers: z.array(volumeTierSchema).optional(),

        allowMixAndMatch: z.boolean().default(false),
        mixAndMatchPrice: z.number().min(0).optional(),
        productGroups: z.array(productGroupSchema).optional(),

        discountApplication: z
            .enum(["bundle", "products"])
            .default("bundle")
            .optional(),
        discountedProductIds: z.array(z.string()).optional(),
        freeShipping: z.boolean().default(false).optional(),

        priority: z.number().int().min(0).max(500).default(0).optional(),

        marketingCopy: z.string().max(1000).transform(sanitizeHtml).optional(),
        seoTitle: z.string().max(60).transform(sanitizeHtml).optional(),
        seoDescription: z.string().max(160).transform(sanitizeHtml).optional(),

        startDate: z.date().optional(),
        endDate: z.date().optional(),

        settings: bundleSettingsSchema,
    })
    // Discount value validations based on discount type
    .superRefine((data, ctx) => {
        const { discountType, discountValue } = data;

        // Percentage cannot exceed 100%
        if (discountType === "PERCENTAGE") {
            if (discountValue > 100) {
                ctx.addIssue({
                    code: "custom",
                    message: "Percentage discount cannot exceed 100%",
                    path: ["discountValue"],
                });
            }
            if (discountValue <= 0) {
                ctx.addIssue({
                    code: "custom",
                    message: "Percentage discount must be greater than 0",
                    path: ["discountValue"],
                });
            }
        }

        // Fixed amount must be positive
        if (discountType === "FIXED_AMOUNT") {
            if (discountValue <= 0) {
                ctx.addIssue({
                    code: "custom",
                    message: "Fixed amount must be greater than 0",
                    path: ["discountValue"],
                });
            }
        }

        // Custom price must be positive
        if (discountType === "CUSTOM_PRICE") {
            if (discountValue <= 0) {
                ctx.addIssue({
                    code: "custom",
                    message: "Custom price must be greater than 0",
                    path: ["discountValue"],
                });
            }
        }
    })
    // Bundle-type-specific validations
    .refine(
        (data) => {
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
    )
    .refine(
        (data) => {
            if (data.status === "SCHEDULED") {
                return data.startDate != null && data.endDate != null;
            }
            return true;
        },
        {
            message: "Scheduled bundles require both start and end dates",
            path: ["startDate"],
        },
    );
