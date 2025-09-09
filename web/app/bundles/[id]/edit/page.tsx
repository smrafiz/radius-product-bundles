// app/bundles/[id]/edit/page.tsx
"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
    Card,
    Spinner,
    Text,
    Banner,
    BlockStack,
} from "@shopify/polaris";
import { getBundle, updateBundle } from "@/actions";
import { useSessionToken } from "@/hooks/shop/useSessionToken";
import {
    BundleCreationForm,
    BundleFormProvider,
} from "@/bundles/create/[bundleType]/_components/form";
import { GlobalForm } from "@/components";
import { useBundleStore } from "@/stores";
import { BundleFormData } from "@/lib/validation";

interface EditBundlePageProps {
    params: Promise<{
        id: string;
    }>;
}

export default function EditBundlePage({ params }: EditBundlePageProps) {
    const { id: bundleId } = use(params);
    const router = useRouter();
    const sessionToken = useSessionToken();
    const { resetDirty } = useBundleStore();

    // Fetch bundle data
    const {
        data: bundleResult,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["bundle", bundleId],
        queryFn: async () => {
            if (!sessionToken) throw new Error("No session token");
            return getBundle(sessionToken, bundleId);
        },
        enabled: !!sessionToken,
    });

    const handleSubmit = async (data: BundleFormData) => {
        try {
            if (!sessionToken) throw new Error("No session token");

            const result = await updateBundle(sessionToken, bundleId, {
                ...data,
                type: bundleResult?.data?.type, // Keep existing bundle type
            });

            if (result.status === "success") {
                console.log("Bundle updated successfully:", result);
                router.push(`/bundles/${bundleId}`);
            } else {
                console.error("Update failed:", result.errors);
            }
        } catch (error) {
            console.error("Submit error:", error);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <Card>
                <div style={{ padding: "40px", textAlign: "center" }}>
                    <BlockStack gap="400" align="center">
                        <Spinner size="large" />
                        <Text variant="headingMd">Loading bundle...</Text>
                    </BlockStack>
                </div>
            </Card>
        );
    }

    // Error state
    if (error || bundleResult?.status === "error") {
        return (
            <Card>
                <div style={{ padding: "20px" }}>
                    <Banner tone="critical" title="Error loading bundle">
                        <Text variant="bodyMd">
                            {bundleResult?.message ||
                                "Failed to load bundle. Please try again."}
                        </Text>
                    </Banner>
                </div>
            </Card>
        );
    }

    if (!bundleResult?.data) {
        return (
            <Card>
                <div style={{ padding: "20px" }}>
                    <Banner tone="critical" title="Bundle not found">
                        <Text variant="bodyMd">
                            The bundle you're looking for doesn't exist.
                        </Text>
                    </Banner>
                </div>
            </Card>
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
        maxDiscountAmount: bundleResult.data.maxDiscountAmount || null,

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

        // Products - transform to match form structure
        products: bundleResult.data.products.map((product) => ({
            productId: product.productId,
            variantId: product.variantId,
            quantity: product.quantity,
            role: product.role || "INCLUDED",
            groupId: product.groupId,
            customPrice: product.customPrice,
            discountPercent: product.discountPercent,
        })),

        // Product groups for Mix & Match
        productGroups: bundleResult.data.productGroups || [],

        // Settings (if you have them)
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
                <BundleCreationForm bundleType={bundleResult.data.type} />
            </GlobalForm>
        </BundleFormProvider>
    );
}