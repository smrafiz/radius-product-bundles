// app/bundles/[id]/edit/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, Spinner, Stack, Text, Banner } from "@shopify/polaris";
import { getBundle } from "@/actions";
import BundleForm from "@/bundles/_components/BundleForm";
import { useSessionToken } from "@/hooks/shop/useSessionToken";

interface EditBundlePageProps {
    params: {
        id: string;
    };
}

export default function EditBundlePage({ params }: EditBundlePageProps) {
    const router = useRouter();
    const sessionToken = useSessionToken();

    // Fetch bundle data
    const {
        data: bundleResult,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["bundle", params.id],
        queryFn: async () => {
            if (!sessionToken) throw new Error("No session token");
            return getBundle(sessionToken, params.id);
        },
        enabled: !!sessionToken,
    });

    const handleSuccess = (data: any) => {
        router.push(`/bundles/${data.id}`);
    };

    const handleCancel = () => {
        router.push(`/bundles/${params.id}`);
    };

    // Loading state
    if (isLoading) {
        return (
            <Card>
                <div style={{ padding: "40px", textAlign: "center" }}>
                    <Stack vertical spacing="loose" alignment="center">
                        <Spinner size="large" />
                        <Text variant="headingMd">Loading bundle...</Text>
                    </Stack>
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

    // Transform data for form
    const initialData = bundleResult?.data
        ? {
              name: bundleResult.data.name,
              description: bundleResult.data.description || "",
              discountType: bundleResult.data.discountType,
              discountValue: bundleResult.data.discountValue,
              minOrderValue: bundleResult.data.minOrderValue || 0,
              maxDiscountAmount: bundleResult.data.maxDiscountAmount || 0,
              startDate: bundleResult.data.startDate
                  ? new Date(bundleResult.data.startDate)
                  : undefined,
              endDate: bundleResult.data.endDate
                  ? new Date(bundleResult.data.endDate)
                  : undefined,
              status: bundleResult.data.status,
              products: bundleResult.data.products.map((product) => ({
                  id: product.productId,
                  productId: product.productId,
                  variantId: product.variantId,
                  quantity: product.quantity,
                  isRequired: product.isRequired,
                  displayOrder: product.displayOrder,
                  title: `Product ${product.productId}`, // You might want to fetch actual product titles
                  price: 0, // You might want to fetch actual product prices
              })),
          }
        : undefined;

    return (
        <BundleForm
            bundleId={params.id}
            initialData={initialData}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
        />
    );
}
