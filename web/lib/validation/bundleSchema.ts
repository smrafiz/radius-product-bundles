import { z } from "zod";

export const bundleSchema = z
    .object({
        name: z.string().min(1, "Bundle name is required").trim(),
        description: z.string().optional(),
        products: z
            .array(z.any())
            .min(1, "At least one product must be selected"),
        discountType: z.enum(["PERCENTAGE", "FIXED"], {
            message: "Discount type is required",
        }),
        discountValue: z
            .number({
                message: "Discount value is required",
            })
            .positive("Discount value must be greater than 0"),
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
            return !(
                data.discountType === "PERCENTAGE" && data.discountValue > 100
            );
        },
        {
            message: "Percentage discount cannot exceed 100%",
            path: ["discountValue"],
        },
    )
    .refine(
        (data) => {
            return !(
                data.startDate &&
                data.endDate &&
                data.startDate >= data.endDate
            );
        },
        {
            message: "End date must be after start date",
            path: ["endDate"],
        },
    );

export type BundleFormData = z.infer<typeof bundleSchema>;
