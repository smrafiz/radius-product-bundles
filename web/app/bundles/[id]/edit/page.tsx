"use client";

import { use, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
    Banner,
    BlockStack,
    Card,
    Page,
    Spinner,
    Text,
} from "@shopify/polaris";
import { getBundle, updateBundle } from "@/actions";
import { useSessionToken } from "@/hooks/shop/useSessionToken";
import { useGraphQL } from "@/hooks/data/useGraphQL";
import {
    GetProductsByIdsDocument,
    GetProductsByIdsQuery,
    GetProductsByIdsQueryVariables,
} from "@/lib/gql/graphql";
import {
    BundleCreationForm,
    BundleFormProvider,
} from "@/bundles/create/[bundleType]/_components/form";
import { GlobalForm } from "@/components";
import { useBundleStore } from "@/stores";
import { BundleFormData } from "@/lib/validation";
import { DashboardSkeleton } from "@/components/shared/Skeletons";

interface EditBundlePageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function EditBundlePage({ params }: EditBundlePageProps) {
    const { id: bundleId } = use(params);
    const router = useRouter();
    const sessionToken = useSessionToken();
    const { resetDirty, setSaving, setSelectedItems } = useBundleStore();

    // Fetch bundle data
    const {
        data: bundleResult,
        isLoading: bundleLoading,
        error: bundleError,
        isError: isBundleError,
    } = useQuery({
        queryKey: ["bundle", bundleId],
        queryFn: async () => {
            if (!sessionToken) throw new Error("No session token");
            return getBundle(sessionToken, bundleId);
        },
        enabled: !!sessionToken,
        retry: 1, // Only retry once to avoid long loading times
    });

    // Extract product IDs for GraphQL query
    const productIds = useMemo(() => {
        if (!bundleResult?.data?.products) return [];
        return [...new Set(bundleResult.data.products.map((p) => p.productId))];
    }, [bundleResult?.data?.products]);

    // GraphQL variables for fetching products
    const productsVariables = useMemo(
        (): GetProductsByIdsQueryVariables => ({
            ids: productIds,
        }),
        [productIds],
    );

    // Fetch product details via GraphQL
    const productsQuery = useGraphQL(
        GetProductsByIdsDocument as any,
        productsVariables,
        {
            enabled: productIds.length > 0,
        },
    ) as {
        data?: GetProductsByIdsQuery;
        loading: boolean;
        error?: Error | null;
    };

    // Convert GraphQL product data to selectedItems
    useEffect(() => {
        if (
            bundleResult?.data?.products &&
            productsQuery.data?.nodes &&
            !productsQuery.loading
        ) {
            const selectedItems = bundleResult.data.products.map(
                (bundleProduct, index) => {
                    const shopifyProduct = productsQuery.data.nodes.find(
                        (node: any) => node?.id === bundleProduct.productId,
                    );

                    const variant = shopifyProduct?.variants?.nodes?.find(
                        (v: any) => v.id === bundleProduct.variantId,
                    );

                    return {
                        id:
                            bundleProduct.id ||
                            `${bundleProduct.productId}-${bundleProduct.variantId}-${index}`,
                        productId: bundleProduct.productId,
                        variantId: bundleProduct.variantId,
                        quantity: bundleProduct.quantity || 1,
                        type: "product" as const,
                        title: shopifyProduct?.title || `Product ${index + 1}`,
                        price:
                            variant?.price ||
                            shopifyProduct?.variants?.nodes?.[0]?.price ||
                            "0.00",
                        image:
                            variant?.image?.url ||
                            shopifyProduct?.featuredImage?.url,
                        sku: variant?.sku || "",
                        handle: shopifyProduct?.handle || "",
                        vendor: shopifyProduct?.vendor || "",
                        productType: shopifyProduct?.productType || "",
                        totalVariants:
                            shopifyProduct?.variants?.nodes?.length || 1,
                        displayOrder: bundleProduct.displayOrder || 0,
                        isRequired: bundleProduct.isRequired !== false,
                        inventoryQuantity: variant?.inventoryQuantity || 0,
                        availableForSale: variant?.availableForSale || false,
                        compareAtPrice: variant?.compareAtPrice,
                    };
                },
            );

            setSelectedItems(selectedItems);
        }
    }, [
        bundleResult?.data?.products,
        productsQuery.data,
        productsQuery.loading,
        setSelectedItems,
    ]);

    const handleSubmit = async (data: BundleFormData) => {
        setSaving(true);

        try {
            if (!sessionToken) throw new Error("No session token");

            const result = await updateBundle(sessionToken, bundleId, {
                ...data,
                type: bundleResult?.data?.type,
            });

            if (result.status === "success") {
                console.log("Bundle updated successfully:", result);
                router.push(`/bundles/${bundleId}/edit?success=updated`);
            } else {
                console.error("Update failed:", result.errors);
            }
        } catch (error) {
            console.error("Submit error:", error);
        } finally {
            setSaving(false);
        }
    };

    // 1. LOADING STATE (highest priority)
    if (
        bundleLoading ||
        !sessionToken ||
        (productIds.length > 0 && productsQuery.loading)
    ) {
        return <DashboardSkeleton />;
    }

    // 2. ERROR STATE (only after we're sure it's not loading)
    if (
        (isBundleError && bundleError) ||
        bundleResult?.status === "error" ||
        (productsQuery.error && !productsQuery.loading)
    ) {
        return (
            <Page title="Error">
                <Card>
                    <div style={{ padding: "20px" }}>
                        <Banner tone="critical" title="Error loading data">
                            <Text variant="bodyMd">
                                {bundleResult?.message ||
                                    bundleError?.message ||
                                    productsQuery.error?.message ||
                                    "Failed to load data. Please try again."}
                            </Text>
                        </Banner>
                    </div>
                </Card>
            </Page>
        );
    }

    // 3. NOT FOUND STATE
    if (!bundleResult?.data) {
        return (
            <Page title="Not Found">
                <Card>
                    <div style={{ padding: "20px" }}>
                        <Banner tone="critical" title="Bundle not found">
                            <Text variant="bodyMd">
                                The bundle you're looking for doesn't exist.
                            </Text>
                        </Banner>
                    </div>
                </Card>
            </Page>
        );
    }

    // Transform bundle data for form initialization
    const initialData = {
        name: bundleResult.data.name,
        description: bundleResult.data.description || "",
        type: bundleResult.data.type,
        mainProductId: bundleResult.data.mainProductId,

        // Bundle mechanics
        buyQuantity: bundleResult.data.buyQuantity,
        getQuantity: bundleResult.data.getQuantity,
        minimumItems: bundleResult.data.minimumItems,
        maximumItems: bundleResult.data.maximumItems,

        // Pricing
        discountType: bundleResult.data.discountType,
        discountValue: bundleResult.data.discountValue,
        minOrderValue: bundleResult.data.minOrderValue,
        maxDiscountAmount: bundleResult.data.maxDiscountAmount || undefined,

        // Volume tiers
        volumeTiers: bundleResult.data.volumeTiers,

        // Mix & Match
        allowMixAndMatch: bundleResult.data.allowMixAndMatch,
        mixAndMatchPrice: bundleResult.data.mixAndMatchPrice,

        // Marketing
        marketingCopy: bundleResult.data.marketingCopy,
        seoTitle: bundleResult.data.seoTitle,
        seoDescription: bundleResult.data.seoDescription,
        images: bundleResult.data.images || [],

        // Dates
        startDate: bundleResult.data.startDate
            ? new Date(bundleResult.data.startDate)
            : undefined,
        endDate: bundleResult.data.endDate
            ? new Date(bundleResult.data.endDate)
            : undefined,

        // Products
        products: bundleResult.data.products.map((product) => ({
            productId: product.productId,
            variantId: product.variantId,
            quantity: product.quantity,
            role: product.role || "INCLUDED",
            groupId: product.groupId,
            customPrice: product.customPrice,
            discountPercent: product.discountPercent,
        })),

        productGroups: bundleResult.data.productGroups || [],
        settings: bundleResult.data.settings || {
            layout: "GRID",
            theme: "STORE_DEFAULT",
            position: "ABOVE_ADD_TO_CART",
            showPrices: true,
            showSavings: true,
            showProductImages: true,
            enableQuickAdd: false,
        },
    };

    return (
        <BundleFormProvider
            bundleType={bundleResult.data.type}
            initialData={initialData}
        >
            <GlobalForm
                onSubmit={handleSubmit}
                resetDirty={resetDirty}
                discardPath={`/bundles/${bundleId}`}
            >
                <BundleCreationForm
                    bundleType={bundleResult.data.type}
                    bundleName={bundleResult.data.name}
                />
            </GlobalForm>
        </BundleFormProvider>
    );
}