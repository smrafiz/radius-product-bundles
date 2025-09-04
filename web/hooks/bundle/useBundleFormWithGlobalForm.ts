// web/hooks/bundle/useBundleFormWithGlobalForm.ts
import { useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useBundleStore } from "@/stores";
import { createBundle } from "@/actions/bundles.action";
import { BundleFormData } from "@/lib/validation";
import type { BundleType, CreateBundlePayload } from "@/types";

/**
 * Hook to integrate React Hook Form with your GlobalForm component
 */
export function useBundleFormWithGlobalForm(bundleType: BundleType) {
    const app = useAppBridge();
    const router = useRouter();
    const queryClient = useQueryClient();
    const methods = useFormContext<BundleFormData>();

    const {
        bundleData,
        selectedItems,
        setSaving,
        resetBundle,
        setValidationAttempted,
    } = useBundleStore();

    const { handleSubmit, setError } = methods || {};

    // Create bundle mutation
    const createBundleMutation = useMutation({
        mutationFn: async (data: BundleFormData) => {
            const token = await app.idToken();

            // Transform data to match server action expectations
            const transformedData: CreateBundlePayload = {
                name: data.name,
                type: bundleType,
                description: data.description,
                discountType: data.discountType,
                discountValue: data.discountValue,
                minOrderValue: data.minOrderValue,
                maxDiscountAmount: data.maxDiscountAmount,
                startDate: data.startDate?.toISOString(),
                endDate: data.endDate?.toISOString(),
                products: data.products?.map((product) => ({
                    productId: product.productId,
                    variantId: product.variantId || "",
                    quantity: product.quantity || 1,
                })) || [],
            };

            const result = await createBundle(token, transformedData);

            if (result.status === "error") {
                throw new Error(JSON.stringify(result));
            }

            return result;
        },
        onMutate: () => {
            setSaving(true);
        },
        onSuccess: (result) => {
            console.log("Bundle created successfully:", result);
            queryClient.invalidateQueries({ queryKey: ["bundles"] });
            queryClient.invalidateQueries({ queryKey: ["bundle-metrics"] });
            resetBundle();
            router.push("/bundles");
        },
        onError: (error) => {
            console.error("Failed to create bundle:", error);

            if (setError) {
                try {
                    const errorData = JSON.parse(error.message);

                    // Handle validation errors from server action
                    if (errorData.errors) {
                        Object.entries(errorData.errors).forEach(([field, fieldErrors]: [string, any]) => {
                            if (fieldErrors && fieldErrors._errors && fieldErrors._errors.length > 0) {
                                setError(field as keyof BundleFormData, {
                                    type: "server",
                                    message: fieldErrors._errors[0]
                                });
                            }
                        });
                    }
                } catch (e) {
                    console.error("Error parsing server response:", e);
                }
            }
        },
        onSettled: () => {
            setSaving(false);
        },
    });

    // Handler for GlobalForm onSubmit
    const handleGlobalFormSubmit = useCallback(async () => {
        if (!handleSubmit) {
            console.error("Form methods not available");
            return;
        }

        setValidationAttempted(true);

        // Create a promise that resolves when form is submitted
        return new Promise<void>((resolve, reject) => {
            handleSubmit(
                // On valid submission
                async (data: BundleFormData) => {
                    try {
                        await createBundleMutation.mutateAsync(data);
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                },
                // On validation error
                (errors) => {
                    console.log("Form validation errors:", errors);
                    reject(new Error("Form validation failed"));
                }
            )();
        });
    }, [handleSubmit, createBundleMutation, setValidationAttempted]);

    return {
        handleGlobalFormSubmit,
        isCreating: createBundleMutation.isPending,
        createError: createBundleMutation.error,
        isSuccess: createBundleMutation.isSuccess,
    };
}