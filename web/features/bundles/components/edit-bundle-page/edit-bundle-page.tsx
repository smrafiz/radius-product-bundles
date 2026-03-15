"use client";

import {
    BundleCreationForm,
    BundleCreationSkeleton,
    BundleFormData,
    BundleFormProvider,
    DisplaySettings,
    useBundleDataSync,
    useBundleStore,
    useBundleSubmit,
    useEditBundle,
    useEditBundleTransform,
} from "@/features/bundles";
import { useCallback } from "react";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslations } from "@/lib/i18n/provider";
import { GlobalForm, useAppNavigation } from "@/shared";
import {
    BUNDLE_FIELD_LABELS,
    BUNDLE_STEP_FIELD_MAP,
} from "@/features/bundles/constants/bundle-details.constants";

export function EditBundlePage({ params }: { params: { id: string } }) {
    const tc = useTranslations("Bundles.Common");
    const { id: bundleId } = params;
    const { bundleData, isLoading, isError, errorMessage, productsQuery } =
        useEditBundle(bundleId);
    const { bundleData: navigationData } = useAppNavigation();

    const { handleSubmit, resetDirty } = useBundleSubmit("edit", bundleId);
    const {
        setStep,
        setValidationAttempted,
        setBundleData,
        setDisplaySettings,
        setSelectedItems,
        clearPendingMedia,
        clearRemovedMediaIds,
        clearTouchedFields,
    } = useBundleStore();
    const initialData = useEditBundleTransform(bundleData);
    useBundleDataSync(bundleData);

    const handleDiscard = useCallback(() => {
        if (bundleData) {
            // Mirror useBundleDataSync — restore store to loaded DB state
            setBundleData({
                id: bundleData.id,
                name: bundleData.name,
                type: bundleData.type,
                status: bundleData.status,
                description: bundleData.description,
                mainProductId: bundleData.mainProductId,
                mainVariantId: bundleData.mainVariantId,
                createProduct: !!bundleData.mainProductId,
                productTitle: bundleData.name,
                productDescription: bundleData.description || "",
                discountType: bundleData.discountType,
                discountValue: bundleData.discountValue,
                minOrderValue: bundleData.minOrderValue,
                maxDiscountAmount: bundleData.maxDiscountAmount,
                products: bundleData.products || [],
                productGroups: bundleData.productGroups || [],
                settings: bundleData.settings,
                allowMixAndMatch: bundleData.allowMixAndMatch,
                mixAndMatchPrice: bundleData.mixAndMatchPrice,
                buyQuantity: bundleData.buyQuantity,
                getQuantity: bundleData.getQuantity,
                volumeTiers: bundleData.volumeTiers,
                startDate: bundleData.startDate,
                endDate: bundleData.endDate,
                priority: bundleData.priority ?? 0,
                images: bundleData.images || [],
            } as any);

            // Restore display settings
            if (bundleData.settings) {
                setDisplaySettings(bundleData.settings as DisplaySettings);
            }

            // Re-derive selectedItems from original bundle products + Shopify data
            const bundleProducts = bundleData.products || [];
            const products: any[] = productsQuery?.data?.nodes || [];

            if (bundleProducts.length > 0 && products.length > 0) {
                const isProductNode = (node: any) =>
                    typeof node?.id === "string" &&
                    node.id.includes("Product") &&
                    typeof node?.title === "string";

                const grouped = bundleProducts.reduce(
                    (acc: Record<string, any>, bp: any) => {
                        const productId = bp.id;
                        const variantId = bp.selectedVariant?.id;
                        if (!productId) return acc;
                        if (!acc[productId]) {
                            acc[productId] = {
                                ...bp,
                                variantIds: variantId ? [variantId] : [],
                            };
                        } else if (
                            variantId &&
                            !acc[productId].variantIds.includes(variantId)
                        ) {
                            acc[productId].variantIds.push(variantId);
                        }
                        return acc;
                    },
                    {},
                );

                const restoredItems = Object.values(grouped).map(
                    (bp: any, index: number) => {
                        const productNodes = (products || []).filter(
                            isProductNode,
                        );
                        const shopifyProduct = productNodes.find(
                            (p: any) => p.id === bp.id,
                        );
                        const firstVariant =
                            shopifyProduct?.variants?.nodes?.[0];

                        return {
                            id: `product-${bp.id}`,
                            productId: bp.id,
                            variantIds: bp.variantIds || [],
                            quantity: bp.quantity || 1,
                            type: "product" as const,
                            title:
                                shopifyProduct?.title || `Product ${index + 1}`,
                            url: shopifyProduct?.handle
                                ? `/products/${shopifyProduct.handle}`
                                : "",
                            price: firstVariant?.price || "0.00",
                            compareAtPrice:
                                firstVariant?.compareAtPrice || null,
                            image:
                                shopifyProduct?.featuredMedia?.image?.url || "",
                            sku: firstVariant?.sku || "",
                            handle: shopifyProduct?.handle || "",
                            vendor: shopifyProduct?.vendor || "",
                            productType: shopifyProduct?.productType || "",
                            totalVariants:
                                shopifyProduct?.variants?.nodes?.length || 1,
                            displayOrder: bp.displayOrder || index,
                            isRequired: bp.isRequired !== false,
                            inventoryQuantity:
                                firstVariant?.inventoryQuantity || 0,
                            availableForSale:
                                firstVariant?.availableForSale || false,
                        };
                    },
                );

                setSelectedItems(restoredItems);
            }
        }
        setValidationAttempted(false);
        clearTouchedFields();
        clearPendingMedia();
        clearRemovedMediaIds();
        resetDirty();
    }, [
        bundleData,
        productsQuery?.data,
        setBundleData,
        setDisplaySettings,
        setSelectedItems,
        setValidationAttempted,
        clearTouchedFields,
        clearPendingMedia,
        clearRemovedMediaIds,
        resetDirty,
    ]);

    /**
     * Handles validation errors by navigating to the step with the error.
     */
    const handleValidationError = ({ step }: { step?: number }) => {
        if (step) {
            setStep(step);
            setValidationAttempted(true);
        }
    };

    if (isLoading) {
        return (
            <>
                <TitleBar>
                    <button
                        variant="breadcrumb"
                        onClick={navigationData.list()}
                    >
                        {tc("breadcrumb")}
                    </button>
                </TitleBar>
                <BundleCreationSkeleton mode="edit" />
            </>
        );
    }

    if (isError || !bundleData) {
        return (
            <s-page heading={tc("error")}>
                <s-stack paddingBlockStart="large" paddingBlockEnd="large">
                    <s-banner tone="critical" heading={tc("errorLoading")}>
                        {errorMessage}
                    </s-banner>
                </s-stack>
            </s-page>
        );
    }

    return (
        <BundleFormProvider
            bundleType={bundleData.type}
            initialData={initialData}
        >
            <GlobalForm<BundleFormData>
                formId="bundle"
                onSubmit={handleSubmit}
                resetDirty={resetDirty}
                onDiscard={handleDiscard}
                stepFieldMap={BUNDLE_STEP_FIELD_MAP}
                fieldLabels={BUNDLE_FIELD_LABELS}
                onValidationError={handleValidationError}
            >
                <BundleCreationForm
                    bundleType={bundleData.type}
                    bundleName={bundleData.name}
                    bundleId={bundleId}
                />
            </GlobalForm>
        </BundleFormProvider>
    );
}
