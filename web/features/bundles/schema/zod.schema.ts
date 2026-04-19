import { z } from "zod";
import { DiscountApplication } from "@/prisma/generated/client";
import { sanitizeText } from "@/shared";
import { VALIDATION_MESSAGES } from "@/shared/constants";

type T = (key: string) => string;

const productGidSchema = z.string().regex(/^gid:\/\/shopify\/Product\/\d+$/);

const variantGidSchema = z
    .string()
    .regex(/^gid:\/\/shopify\/ProductVariant\/\d+$/);

const volumeTierBadgeSchema = z.object({
    style: z.enum(["none", "popular", "best-value", "custom"]),
    text: z.string().max(30).optional(),
});

const createVolumeTierSchema = (v: T) =>
    z.object({
        id: z.string().optional(),
        minQuantity: z.preprocess(
            (val) => (typeof val === "number" && isNaN(val) ? undefined : val),
            z.number({ error: v("QTY_REQUIRED") })
                .int(v("WHOLE_NUMBER"))
                .min(1, v("MIN_QUANTITY")),
        ),
        discount: z.preprocess(
            (val) => (typeof val === "number" && isNaN(val) ? undefined : val),
            z.number({ error: v("DISCOUNT_REQUIRED") })
                .min(0, v("DISCOUNT_NEGATIVE"))
                .max(999999.99, v("DISCOUNT_MAX"))
                .refine(
                    (val) => /^\d+(\.\d{1,2})?$/.test(String(val)),
                    v("MAX_DECIMAL_PLACES"),
                ),
        ),
        title: z
            .string()
            .min(1, v("TIER_TITLE_REQUIRED"))
            .max(50, v("TIER_TITLE_MAX")),
        subtitle: z
            .string()
            .max(80, v("TIER_SUBTITLE_MAX"))
            .optional(),
        badge: volumeTierBadgeSchema.optional(),
        isDefault: z.boolean().optional(),
    });

const createVolumeDiscountConfigSchema = (v: T) =>
    z
        .object({
            discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
            openEnded: z.boolean().default(true),
            tiers: z
                .array(createVolumeTierSchema(v))
                .min(1, v("MIN_TIERS"))
                .max(10, v("MAX_TIERS")),
        })
        .superRefine((config, ctx) => {
            config.tiers.forEach((tier, idx) => {
                if (idx > 0) {
                    const prev = config.tiers[idx - 1];
                    if (tier.minQuantity <= prev.minQuantity) {
                        ctx.addIssue({
                            code: "custom",
                            message: v("TIER_ORDER")
                                .replace("{index}", String(idx))
                                .replace("{value}", String(prev.minQuantity)),
                            path: ["tiers", idx, "minQuantity"],
                        });
                    }
                    if (tier.discount <= prev.discount) {
                        ctx.addIssue({
                            code: "custom",
                            message: v("TIER_ORDER")
                                .replace("{index}", String(idx))
                                .replace("{value}", String(prev.discount)),
                            path: ["tiers", idx, "discount"],
                        });
                    }
                }
            });

            if (config.discountType === "PERCENTAGE") {
                config.tiers.forEach((tier, idx) => {
                    if (tier.discount > 99.99) {
                        ctx.addIssue({
                            code: "custom",
                            message: v("TIER_PERCENTAGE_MAX"),
                            path: ["tiers", idx, "discount"],
                        });
                    }
                });
            }

            const defaultTiers = config.tiers.filter((t) => t.isDefault === true);
            if (defaultTiers.length > 1) {
                ctx.addIssue({
                    code: "custom",
                    message: v("TIER_ONE_DEFAULT"),
                    path: ["tiers"],
                });
            }
        });

export const volumeDiscountConfigSchema = createVolumeDiscountConfigSchema(
    (key) => (VALIDATION_MESSAGES as Record<string, string>)[key] ?? key,
);

const productGroupSchema = (v: T) =>
    z.object({
        name: z.string().min(1, v("GROUP_NAME_REQUIRED")),
        description: z.string().optional(),
        minSelection: z.number().int().min(0).default(0),
        maxSelection: z.number().int().min(1).optional(),
        displayOrder: z.number().int().default(0),
    });

const bundleSettingsSchema = (v: T) =>
    z
        .object({
            layout: z.string().default("GRID"),
            title: z
                .string()
                .max(100)
                .transform((val) => (val ? sanitizeText(val) : val))
                .optional(),
            subtitle: z.string().max(300).default("").transform(sanitizeText),
            cartButtonText: z
                .string()
                .max(50)
                .default("")
                .transform(sanitizeText),
            showImages: z.boolean().default(true),
            showSavingsBadge: z.boolean().default(true),
            showPrices: z.boolean().default(true),
            showComparePrices: z.boolean().default(true),
            showQuantity: z.boolean().default(true),
            showSavings: z.boolean().default(true),
            showFreeShipping: z.boolean().default(true),
            enableHyperLink: z.boolean().default(false),
        })
        .optional();

/**
 * Create bundle schema with translated validation messages.
 * Pass a translator function (key → message) for i18n support.
 */
export function createBundleSchema(v: T) {
    return z
        .object({
            name: z
                .string()
                .min(1, v("REQUIRED_FIELD"))
                .max(100, v("MAX_LENGTH"))
                .transform(sanitizeText),

            description: z
                .string()
                .max(500, v("MAX_DESC_LENGTH"))
                .transform(sanitizeText)
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
            productTitle: z
                .string()
                .max(120)
                .optional()
                .transform((val) => (val ? sanitizeText(val) : val)),
            productDescription: z
                .string()
                .max(5000)
                .optional()
                .transform((val) => (val ? sanitizeText(val) : val)),
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
            usesPerOrderLimit: z.number().int().min(1).optional().nullable(),
            sameProductMode: z.boolean().optional(),
            minimumItems: z.number().int().min(1).optional(),
            maximumItems: z.number().int().min(1).optional(),

            products: z
                .array(
                    z.object({
                        productId: productGidSchema,
                        variantId: variantGidSchema.optional().nullable(),
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
                .max(20, v("MAX_PRODUCTS_20")),

            discountType: z.enum([
                "PERCENTAGE",
                "FIXED_AMOUNT",
                "CUSTOM_PRICE",
                "NO_DISCOUNT",
                "QUANTITY_BREAKS",
            ]),

            discountValue: z.number().min(0).max(999999.99).default(0),
            minOrderValue: z.number().min(0).max(999999.99).optional(),
            maxDiscountAmount: z.number().min(0).max(999999.99).optional(),

            volumeTiers: createVolumeDiscountConfigSchema(v).optional(),
            openEnded: z.boolean().default(true).optional(),

            allowMixAndMatch: z.boolean().default(false),
            mixAndMatchPrice: z.number().min(0).optional(),
            productGroups: z.array(productGroupSchema(v)).optional(),

            discountApplication: z
                .nativeEnum(DiscountApplication)
                .default(DiscountApplication.BUNDLE)
                .optional(),
            discountedProductIds: z.array(z.string()).optional(),
            freeShipping: z.boolean().default(false).optional(),

            priority: z.number().int().min(0).max(500).default(0).optional(),

            marketingCopy: z
                .string()
                .max(1000)
                .transform(sanitizeText)
                .optional(),
            seoTitle: z.string().max(60).transform(sanitizeText).optional(),
            seoDescription: z
                .string()
                .max(160)
                .transform(sanitizeText)
                .optional(),

            startDate: z.date().optional(),
            endDate: z.date().optional(),

            settings: bundleSettingsSchema(v),
        })
        .superRefine((data, ctx) => {
            const { discountType, discountValue } = data;

            // QUANTITY_BREAKS and NO_DISCOUNT don't use top-level discountValue
            if (discountType === "QUANTITY_BREAKS" || discountType === "NO_DISCOUNT") {
                return;
            }

            if (discountType === "PERCENTAGE") {
                if (discountValue > 100) {
                    ctx.addIssue({
                        code: "custom",
                        message: v("PERCENTAGE_EXCEED"),
                        path: ["discountValue"],
                    });
                }
                if (discountValue <= 0) {
                    ctx.addIssue({
                        code: "custom",
                        message: v("PERCENTAGE_POSITIVE"),
                        path: ["discountValue"],
                    });
                }
            }

            if (discountType === "FIXED_AMOUNT") {
                if (discountValue <= 0) {
                    ctx.addIssue({
                        code: "custom",
                        message: v("FIXED_AMOUNT_POSITIVE"),
                        path: ["discountValue"],
                    });
                }
            }

            if (discountType === "CUSTOM_PRICE") {
                if (discountValue <= 0) {
                    ctx.addIssue({
                        code: "custom",
                        message: v("CUSTOM_PRICE_INVALID"),
                        path: ["discountValue"],
                    });
                }
            }

            if (!/^\d+(\.\d{1,2})?$/.test(String(discountValue))) {
                ctx.addIssue({
                    code: "custom",
                    message: v("MAX_DECIMAL_PLACES"),
                    path: ["discountValue"],
                });
            }

            if (data.minOrderValue != null && !/^\d+(\.\d{1,2})?$/.test(String(data.minOrderValue))) {
                ctx.addIssue({
                    code: "custom",
                    message: v("MAX_DECIMAL_PLACES"),
                    path: ["minOrderValue"],
                });
            }

            if (data.maxDiscountAmount != null && !/^\d+(\.\d{1,2})?$/.test(String(data.maxDiscountAmount))) {
                ctx.addIssue({
                    code: "custom",
                    message: v("MAX_DECIMAL_PLACES"),
                    path: ["maxDiscountAmount"],
                });
            }
        })
        .superRefine((data, ctx) => {
            // Conditional product minimum: VOLUME_DISCOUNT needs 1, all others need 2
            if (data.type === "VOLUME_DISCOUNT" && (data.products?.length ?? 0) < 1) {
                ctx.addIssue({
                    code: "custom",
                    message: v("NO_PRODUCTS_SELECTED_VOLUME"),
                    path: ["products"],
                });
            } else if (data.type !== "VOLUME_DISCOUNT" && (data.products?.length ?? 0) < 2) {
                ctx.addIssue({
                    code: "custom",
                    message: v("NO_PRODUCTS_SELECTED"),
                    path: ["products"],
                });
            }

            // VOLUME_DISCOUNT requires volumeTiers config
            if (data.type === "VOLUME_DISCOUNT") {
                if (!data.volumeTiers?.tiers || data.volumeTiers.tiers.length === 0) {
                    ctx.addIssue({
                        code: "custom",
                        message: v("VOLUME_TIERS_REQUIRED"),
                        path: ["volumeTiers"],
                    });
                }
            }
        })
        .superRefine((data, ctx) => {
            if (data.type !== "BUY_X_GET_Y" && data.type !== "BOGO") {
                return;
            }

            if (data.buyQuantity == null || data.getQuantity == null) {
                ctx.addIssue({
                    code: "custom",
                    message: v("BXGY_QUANTITIES_REQUIRED"),
                    path: ["buyQuantity"],
                });
                return;
            }

            if (data.type === "BOGO") {
                if (data.buyQuantity !== 1) {
                    ctx.addIssue({
                        code: "custom",
                        message: v("BOGO_BUY_QTY"),
                        path: ["buyQuantity"],
                    });
                }
                if (data.getQuantity !== 1) {
                    ctx.addIssue({
                        code: "custom",
                        message: v("BOGO_GET_QTY"),
                        path: ["getQuantity"],
                    });
                }
            }

            const triggerProducts = data.products.filter(
                (p) => p.role === "TRIGGER",
            );
            const rewardProducts = data.products.filter(
                (p) => p.role === "REWARD",
            );

            if (triggerProducts.length === 0) {
                ctx.addIssue({
                    code: "custom",
                    message: v("TRIGGER_REQUIRED"),
                    path: ["products"],
                });
            }

            if (rewardProducts.length === 0) {
                ctx.addIssue({
                    code: "custom",
                    message: v("REWARD_REQUIRED"),
                    path: ["products"],
                });
            }
        })
        .refine(
            (data) => {
                if (data.type === "MIX_AND_MATCH") {
                    return (
                        data.allowMixAndMatch &&
                        (data.mixAndMatchPrice != null ||
                            data.discountValue > 0)
                    );
                }
                return true;
            },
            {
                message: v("MIX_MATCH_PRICING"),
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
                message: v("END_DATE_AFTER_START"),
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
                message: v("SCHEDULED_DATES_REQUIRED"),
                path: ["startDate"],
            },
        );
}

/**
 * Default schema with English messages (for server-side validation).
 */
export const bundleSchema = createBundleSchema(
    (key) => (VALIDATION_MESSAGES as Record<string, string>)[key] ?? key,
);
