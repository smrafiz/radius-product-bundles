import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBundles, getBundleMetrics, getBundle, createBundle, updateBundle } from "@/actions";
import { useAppBridge } from "@shopify/app-bridge-react";
import { BundleFormData } from "@/lib/validation";
import type {
    Bundle,
    BundleWithDetails,
    CreateBundlePayload,
    UpdateBundlePayload,
    BundleType,
    BundleStatus,
} from "@/types";

// Metrics type based on your server action return
interface BundleMetricsData {
    totals: {
        totalBundles: number;
        activeBundles: number;
        revenue: number;
        revenueAllTime: number;
        views: number;
        purchases: number;
        addToCarts: number;
    };
    metrics: {
        conversionRate: number;
        avgOrderValue: number;
        cartConversionRate: number;
    };
    growth: {
        revenue: number;
        conversion: number;
    };
}

/**
 * Hook to fetch bundles list
 */
export function useBundles() {
    const app = useAppBridge();

    return useQuery({
        queryKey: ["bundles"],
        queryFn: async () => {
            const token = await app.idToken();
            const result = await getBundles(token);

            if (result.status === "error") {
                throw new Error(result.message);
            }

            return result.data as Bundle[];
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
    });
}

/**
 * Hook to fetch bundle metrics
 */
export function useBundleMetrics() {
    const app = useAppBridge();

    return useQuery({
        queryKey: ["bundle-metrics"],
        queryFn: async () => {
            const token = await app.idToken();
            const result = await getBundleMetrics(token);

            if (result.status === "error") {
                throw new Error(result.message);
            }

            return result.data as BundleMetricsData;
        },
        staleTime: 2 * 60 * 1000, // 2 minutes for metrics
        refetchOnWindowFocus: false,
    });
}

/**
 * Hook to fetch a single bundle
 */
export function useBundle(bundleId: string) {
    const app = useAppBridge();

    return useQuery({
        queryKey: ["bundle", bundleId],
        queryFn: async () => {
            const token = await app.idToken();
            const result = await getBundle(token, bundleId);

            if (result.status === "error") {
                throw new Error(result.message || "Failed to fetch bundle");
            }

            return result.data as BundleWithDetails;
        },
        enabled: !!bundleId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Hook to create a bundle using server action
 */
export function useCreateBundle() {
    const queryClient = useQueryClient();
    const app = useAppBridge();

    return useMutation({
        mutationFn: async (data: BundleFormData & { type?: BundleType; status?: BundleStatus }) => {
            const token = await app.idToken();

            // Transform data to match server action expectations (CreateBundlePayload)
            const transformedData: CreateBundlePayload = {
                name: data.name,
                type: data.type || "FIXED_BUNDLE",
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

            const result = await createBundle(token, transformedData);

            if (result.status === "error") {
                const error = new Error(result.message);
                (error as any).serverResponse = result;
                throw error;
            }

            return result;
        },
        onSuccess: (data) => {
            // Invalidate and refetch bundles list
            queryClient.invalidateQueries({ queryKey: ["bundles"] });
            queryClient.invalidateQueries({ queryKey: ["bundle-metrics"] });

            // Set the new bundle in cache if we have the data
            if (data.data?.id) {
                queryClient.setQueryData(["bundle", data.data.id], data.data);
            }
        },
        onError: (error) => {
            console.error("Failed to create bundle:", error);
        },
    });
}

/**
 * Hook to update a bundle using server action
 */
export function useUpdateBundle() {
    const queryClient = useQueryClient();
    const app = useAppBridge();

    return useMutation({
        mutationFn: async ({
                               bundleId,
                               data
                           }: {
            bundleId: string;
            data: Partial<BundleFormData> & { type?: BundleType; status?: BundleStatus }
        }) => {
            const token = await app.idToken();

            // Transform data to match server action expectations (UpdateBundlePayload)
            const transformedData: UpdateBundlePayload = {
                id: bundleId,
                ...(data.name && { name: data.name }),
                ...(data.type && { type: data.type }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.discountType && { discountType: data.discountType }),
                ...(data.discountValue !== undefined && { discountValue: data.discountValue }),
                ...(data.minOrderValue !== undefined && { minOrderValue: data.minOrderValue }),
                ...(data.maxDiscountAmount !== undefined && { maxDiscountAmount: data.maxDiscountAmount }),
                ...(data.startDate && { startDate: data.startDate.toISOString() }),
                ...(data.endDate && { endDate: data.endDate.toISOString() }),
                ...(data.products && {
                    products: data.products.map((product, index) => ({
                        productId: product.productId,
                        variantId: product.variantId || "",
                        quantity: product.quantity || 1,
                    }))
                }),
            };

            const result = await updateBundle(token, bundleId, transformedData);

            if (result.status === "error") {
                const error = new Error(result.message);
                (error as any).serverResponse = result;
                throw error;
            }

            return result;
        },
        onSuccess: (data, variables) => {
            // Update the specific bundle in cache
            if (data.data?.id) {
                queryClient.setQueryData(["bundle", variables.bundleId], data.data);
            }

            // Invalidate bundles list and metrics to refresh
            queryClient.invalidateQueries({ queryKey: ["bundles"] });
            queryClient.invalidateQueries({ queryKey: ["bundle-metrics"] });
        },
        onError: (error) => {
            console.error("Failed to update bundle:", error);
        },
    });
}

/**
 * Hook for bulk operations (if you add them to server actions later)
 */
export function useBulkBundleOperations() {
    const queryClient = useQueryClient();
    const app = useAppBridge();

    // Placeholder for bulk delete - you can implement this server action later
    const bulkDelete = useMutation({
        mutationFn: async (bundleIds: string[]) => {
            const token = await app.idToken();

            // For now, delete one by one (you can optimize with a bulk server action later)
            const results = await Promise.allSettled(
                bundleIds.map(id =>
                    // You'll need to implement deleteBundle server action
                    Promise.resolve({ id, deleted: true })
                )
            );

            return results;
        },
        onSuccess: (_, variables) => {
            // Remove bundles from cache
            variables.forEach(id => {
                queryClient.removeQueries({ queryKey: ["bundle", id] });
            });

            // Invalidate lists
            queryClient.invalidateQueries({ queryKey: ["bundles"] });
            queryClient.invalidateQueries({ queryKey: ["bundle-metrics"] });
        },
    });

    return {
        bulkDelete,
    };
}

/**
 * Hook to prefetch bundle data (useful for hover cards, etc.)
 */
export function usePrefetchBundle() {
    const queryClient = useQueryClient();
    const app = useAppBridge();

    return (bundleId: string) => {
        queryClient.prefetchQuery({
            queryKey: ["bundle", bundleId],
            queryFn: async () => {
                const token = await app.idToken();
                const result = await getBundle(token, bundleId);

                if (result.status === "error") {
                    throw new Error(result.message || "Failed to fetch bundle");
                }

                return result.data as BundleWithDetails;
            },
            staleTime: 10 * 60 * 1000, // 10 minutes for prefetch
        });
    };
}