// hooks/bundle/useBundleForm.ts
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { toast } from "@shopify/polaris";

import {
    BundleFormData,
    BundleProduct,
    bundleSchema,
} from "@/lib/validation/bundleSchema";
import { createBundle, updateBundle } from "@/actions/bundles.action";
import { useSaveBar } from "@/hooks";

interface UseBundleFormProps {
    bundleId?: string;
    initialData?: Partial<BundleFormData>;
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
    enableSaveBar?: boolean;
}

export function useBundleForm({
    bundleId,
    initialData = {},
    onSuccess,
    onError,
    enableSaveBar = true,
}: UseBundleFormProps = {}) {
    const queryClient = useQueryClient();

    // Initialize React Hook Form with Zod validation
    const form = useForm<BundleFormData>({
        resolver: zodResolver(bundleSchema),
        defaultValues: {
            name: "",
            description: "",
            products: [],
            discountType: "PERCENTAGE",
            discountValue: 10,
            minOrderValue: 0,
            maxDiscountAmount: 0,
            startDate: undefined,
            endDate: undefined,
            status: "DRAFT",
            ...initialData,
        },
        mode: "onChange", // Enable real-time validation
        criteriaMode: "all", // Show all validation errors
    });

    // Product field array management
    const {
        fields: productFields,
        append: appendProduct,
        remove: removeProduct,
        move: moveProduct,
        update: updateProduct,
        swap: swapProduct,
    } = useFieldArray({
        control: form.control,
        name: "products",
        keyName: "fieldId", // Avoid conflicts with product id
    });

    // Watch form fields for conditional logic
    const watchedFields = {
        discountType: useWatch({ control: form.control, name: "discountType" }),
        products: useWatch({ control: form.control, name: "products" }),
        status: useWatch({ control: form.control, name: "status" }),
    };

    // Computed values
    const computedValues = useMemo(
        () => ({
            showDiscountValue: [
                "PERCENTAGE",
                "FIXED_AMOUNT",
                "CUSTOM_PRICE",
            ].includes(watchedFields.discountType),
            showMaxDiscount: ["PERCENTAGE", "FIXED_AMOUNT"].includes(
                watchedFields.discountType,
            ),
            isPercentageDiscount: watchedFields.discountType === "PERCENTAGE",
            isCustomPrice: watchedFields.discountType === "CUSTOM_PRICE",
            productCount: watchedFields.products?.length || 0,
        }),
        [watchedFields],
    );

    // Create bundle mutation
    const createMutation = useMutation({
        mutationFn: async (data: BundleFormData) => {
            // Get session token - adjust this to match your session handling
            const sessionToken = ""; // TODO: Get from your session management
            return createBundle(sessionToken, data);
        },
        onSuccess: (result) => {
            if (result.status === "success") {
                toast.show("Bundle created successfully!", { tone: "success" });
                queryClient.invalidateQueries({ queryKey: ["bundles"] });
                form.reset(); // Reset form state
                onSuccess?.(result.data);
            } else {
                handleServerErrors(result.errors);
                toast.show(result.message, { tone: "critical" });
                onError?.(result);
            }
        },
        onError: (error) => {
            console.error("Create bundle error:", error);
            toast.show("Failed to create bundle. Please try again.", {
                tone: "critical",
            });
            onError?.(error);
        },
    });

    // Update bundle mutation
    const updateMutation = useMutation({
        mutationFn: async (data: BundleFormData) => {
            if (!bundleId) throw new Error("Bundle ID is required for update");
            if (!sessionToken) throw new Error("No session token available");
            return updateBundle(sessionToken, bundleId, data);
        },
        onSuccess: (result) => {
            if (result.status === "success") {
                toast.show("Bundle updated successfully!", { tone: "success" });
                queryClient.invalidateQueries({ queryKey: ["bundles"] });
                queryClient.invalidateQueries({
                    queryKey: ["bundle", bundleId],
                });
                form.reset(form.getValues()); // Reset dirty state
                onSuccess?.(result.data);
            } else {
                handleServerErrors(result.errors);
                toast.show(result.message, { tone: "critical" });
                onError?.(result);
            }
        },
        onError: (error) => {
            console.error("Update bundle error:", error);
            toast.show("Failed to update bundle. Please try again.", {
                tone: "critical",
            });
            onError?.(error);
        },
    });

    // Handle server validation errors
    const handleServerErrors = useCallback(
        (errors: any) => {
            if (!errors) return;

            Object.keys(errors).forEach((field) => {
                if (
                    errors[field]?._errors &&
                    errors[field]._errors.length > 0
                ) {
                    form.setError(field as keyof BundleFormData, {
                        type: "server",
                        message: errors[field]._errors[0],
                    });
                }
            });
        },
        [form],
    );

    // Form state
    const isLoading = createMutation.isPending || updateMutation.isPending;
    const isDirty = form.formState.isDirty;
    const isValid = form.formState.isValid;
    const hasErrors = Object.keys(form.formState.errors).length > 0;

    // SaveBar actions
    const handleSaveBarSave = useCallback(async () => {
        try {
            const currentData = form.getValues();

            // Basic validation before save
            if (!currentData.name?.trim()) {
                toast.show("Please enter a bundle name before saving", {
                    tone: "critical",
                });
                return;
            }

            if (currentData.products.length === 0) {
                toast.show("Please add at least one product before saving", {
                    tone: "critical",
                });
                return;
            }

            if (bundleId) {
                await updateMutation.mutateAsync(currentData);
            } else {
                await createMutation.mutateAsync(currentData);
            }
        } catch (error) {
            console.error("SaveBar save failed:", error);
        }
    }, [form, bundleId, updateMutation, createMutation]);

    const handleSaveBarDiscard = useCallback(async () => {
        form.reset(initialData);
        toast.show("Changes discarded", { tone: "info" });
    }, [form, initialData]);

    // Initialize SaveBar
    const { showSaveBar, hideSaveBar, leaveConfirmation } = useSaveBar({
        isDirty: isDirty && enableSaveBar,
        isLoading,
        onSave: handleSaveBarSave,
        onDiscard: handleSaveBarDiscard,
        saveBarId: `bundle-form-${bundleId || "new"}`,
        showDiscardConfirmation: true,
    });

    // Product management functions
    const productActions = {
        addProduct: useCallback(
            (product: any) => {
                const newProduct: BundleProduct = {
                    id: product.id,
                    productId: product.id,
                    variantId: product.selectedVariant?.id || undefined,
                    quantity: 1,
                    isRequired: true,
                    displayOrder: productFields.length,
                    title: product.title,
                    price: parseFloat(
                        product.selectedVariant?.price || product.price || "0",
                    ),
                    image: product.image?.url || product.images?.[0]?.url,
                };
                appendProduct(newProduct);
            },
            [appendProduct, productFields.length],
        ),

        removeProductAt: useCallback(
            (index: number) => {
                removeProduct(index);
            },
            [removeProduct],
        ),

        updateProductQuantity: useCallback(
            (index: number, quantity: number) => {
                const currentProduct = productFields[index];
                if (currentProduct) {
                    updateProduct(index, {
                        ...currentProduct,
                        quantity: Math.max(1, Math.min(99, quantity)),
                    });
                }
            },
            [productFields, updateProduct],
        ),

        moveProductUp: useCallback(
            (index: number) => {
                if (index > 0) {
                    swapProduct(index, index - 1);
                }
            },
            [swapProduct],
        ),

        moveProductDown: useCallback(
            (index: number) => {
                if (index < productFields.length - 1) {
                    swapProduct(index, index + 1);
                }
            },
            [swapProduct, productFields.length],
        ),
    };

    // Form submission
    const handleSubmit = form.handleSubmit(async (data) => {
        try {
            if (bundleId) {
                await updateMutation.mutateAsync(data);
            } else {
                await createMutation.mutateAsync(data);
            }
        } catch (error) {
            console.error("Form submission error:", error);
        }
    });

    // Helper functions
    const helpers = {
        getFieldError: useCallback(
            (fieldName: keyof BundleFormData) => {
                const error = form.formState.errors[fieldName];
                return error?.message;
            },
            [form.formState.errors],
        ),

        resetForm: useCallback(
            (values?: Partial<BundleFormData>) => {
                form.reset(values || initialData);
            },
            [form, initialData],
        ),

        setFormValue: useCallback(
            (field: keyof BundleFormData, value: any) => {
                form.setValue(field, value, {
                    shouldValidate: true,
                    shouldDirty: true,
                });
            },
            [form],
        ),
    };

    return {
        // Form instance
        form,

        // Product management
        productFields,
        ...productActions,

        // Watched values
        ...watchedFields,
        ...computedValues,

        // Form actions
        handleSubmit,

        // Form state
        isLoading,
        isDirty,
        isValid,
        hasErrors,

        // SaveBar actions
        showSaveBar,
        hideSaveBar,
        leaveConfirmation,

        // Helper functions
        ...helpers,
    };
}
