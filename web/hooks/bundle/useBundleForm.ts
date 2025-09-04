import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bundleSchema, BundleFormData } from "@/lib/validation";
import { useBundleStore } from "@/stores";
import { useCallback, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBundle, updateBundle } from "@/actions/bundles.action";
import { useAppBridge } from "@shopify/app-bridge-react";
import type { BundleType, CreateBundlePayload } from "@/types";

// Helper to convert BundleFormData to server action format
const transformFormDataForServer = (data: BundleFormData, bundleType?: BundleType): CreateBundlePayload => {
    return {
        name: data.name,
        type: bundleType || "FIXED_BUNDLE",
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minOrderValue: data.minOrderValue,
        maxDiscountAmount: data.maxDiscountAmount,
        startDate: data.startDate?.toISOString(),
        endDate: data.endDate?.toISOString(),
        products: data.products?.map((product, index) => ({
            productId: product.productId,
            variantId: product.variantId || "",
            quantity: product.quantity || 1,
        })) || [],
    };
};

export function useBundleForm(bundleId?: string) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const app = useAppBridge();
    const [isPending, startTransition] = useTransition();

    const {
        bundleData,
        selectedItems,
        currentStep,
        setBundleData,
        setSaving,
        resetBundle,
        nextStep,
        setValidationAttempted,
        markDirty,
    } = useBundleStore();

    // Initialize form with React Hook Form
    const form = useForm<BundleFormData>({
        resolver: zodResolver(bundleSchema),
        defaultValues: {
            name: "",
            description: "",
            products: [],
            discountType: undefined,
            discountValue: undefined,
            minOrderValue: undefined,
            maxDiscountAmount: undefined,
            startDate: undefined,
            endDate: undefined,
        },
        mode: "onChange",
    });

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isValid, isSubmitting },
        trigger,
        reset,
        setError,
    } = form;

    // Create bundle mutation using server action
    const createBundleMutation = useMutation({
        mutationFn: async (data: BundleFormData) => {
            const token = await app.idToken();
            const transformedData = transformFormDataForServer(data, bundleData.type as BundleType);
            const result = await createBundle(token, transformedData);

            if (result.status === "error") {
                throw new Error(JSON.stringify(result));
            }

            return result;
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

            try {
                const errorData = JSON.parse(error.message);

                // Handle validation errors from your server action
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
        },
    });

    // Update bundle mutation using server action
    const updateBundleMutation = useMutation({
        mutationFn: async (data: BundleFormData) => {
            if (!bundleId) {
                throw new Error("No bundle ID available for update");
            }

            const token = await app.idToken();
            const transformedData = transformFormDataForServer(data, bundleData.type as BundleType);
            const result = await updateBundle(token, bundleId, transformedData);

            if (result.status === "error") {
                throw new Error(JSON.stringify(result));
            }

            return result;
        },
        onSuccess: (result) => {
            console.log("Bundle updated successfully:", result);
            queryClient.invalidateQueries({ queryKey: ["bundles"] });
            queryClient.invalidateQueries({ queryKey: ["bundle", bundleId] });
            router.push("/bundles");
        },
        onError: (error) => {
            console.error("Failed to update bundle:", error);

            try {
                const errorData = JSON.parse(error.message);

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
        },
    });

    // Sync form with Zustand store
    useEffect(() => {
        const formData = {
            ...bundleData,
            products: selectedItems.map(item => ({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
            })),
        };

        // Update form values when store changes
        Object.entries(formData).forEach(([key, value]) => {
            const currentValue = watch(key as keyof BundleFormData);
            if (JSON.stringify(currentValue) !== JSON.stringify(value)) {
                setValue(key as keyof BundleFormData, value);
            }
        });
    }, [bundleData, selectedItems, setValue, watch]);

    // Sync store with form changes
    useEffect(() => {
        const subscription = watch((value, { name, type }) => {
            if (name && type === "change") {
                setBundleData(value as Partial<CreateBundlePayload>);
                markDirty();
            }
        });
        return () => subscription.unsubscribe();
    }, [watch, setBundleData, markDirty]);

    // Handle loading states
    useEffect(() => {
        setSaving(isPending || createBundleMutation.isPending || updateBundleMutation.isPending);
    }, [isPending, createBundleMutation.isPending, updateBundleMutation.isPending, setSaving]);

    // Step validation function
    const validateCurrentStep = useCallback(async () => {
        setValidationAttempted(true);

        let fieldsToValidate: (keyof BundleFormData)[] = [];

        switch (currentStep) {
            case 1: // Products step
                fieldsToValidate = ["products"];
                break;
            case 2: // Configuration step
                fieldsToValidate = ["name", "discountType", "discountValue"];
                break;
            case 3: // Display step
                return true;
            case 4: // Review step
                return await trigger();
        }

        const isStepValid = await trigger(fieldsToValidate);
        return isStepValid;
    }, [currentStep, trigger, setValidationAttempted]);

    // Handle next step with validation
    const handleNextStep = useCallback(async () => {
        const isStepValid = await validateCurrentStep();
        if (isStepValid) {
            nextStep();
        }
    }, [validateCurrentStep, nextStep]);

    // Submit handler using server actions
    const onSubmit = useCallback((data: BundleFormData) => {
        console.log("Submitting bundle:", data);

        startTransition(() => {
            if (bundleId) {
                updateBundleMutation.mutate(data);
            } else {
                createBundleMutation.mutate(data);
            }
        });
    }, [bundleId, createBundleMutation, updateBundleMutation]);

    // Get field error
    const getFieldError = useCallback((fieldName: string) => {
        const error = errors[fieldName as keyof BundleFormData];
        return error?.message;
    }, [errors]);

    // Check if can proceed to next step
    const canProceedToNextStep = useCallback(() => {
        switch (currentStep) {
            case 1: // Products step
                return selectedItems.length > 0;
            case 2: // Configuration step
                return !errors.name && !errors.discountType && !errors.discountValue &&
                    bundleData.name && bundleData.discountType;
            case 3: // Display step
                return true;
            case 4: // Review step
                return isValid;
            default:
                return false;
        }
    }, [currentStep, selectedItems.length, errors, isValid, bundleData.name, bundleData.discountType]);

    const mutation = bundleId ? updateBundleMutation : createBundleMutation;

    return {
        // Form methods
        form,
        register,
        handleSubmit,
        setValue,
        watch,
        errors,
        isValid,
        isSubmitting,
        trigger,
        reset,

        // Custom methods
        onSubmit,
        handleNextStep,
        validateCurrentStep,
        getFieldError,
        canProceedToNextStep,

        // Mutation state
        isCreating: mutation.isPending || isPending,
        createError: mutation.error,
        isSuccess: mutation.isSuccess,

        // Mutation methods
        createBundle: mutation.mutate,

        // Mode detection
        isEditMode: !!bundleId,
    };
}