"use client";

import React from "react";
import { EditorWysiwyg } from "@/shared";
import {
    MediaGrid,
    ProductMediaPicker,
    useBundleProduct,
    useBundleValidation,
    useProductMediaPicker,
} from "@/features/bundles";

/**
 * Bundle as product configuration component
 */
export function BundleAsProduct({ mode }: { mode: "create" | "edit" }) {
    const { getFieldError } = useBundleValidation();
    const {
        isEnabled,
        productTitle,
        pendingMedia,
        removePendingMedia,
        existingMedia,
        isUploading,
        isLoadingProduct,
        hoveredIndex,
        mainProductId,
        toggleEnabled,
        handleTitleChange,
        handleMediaUpload,
        handleRemoveExistingMedia,
        setHoveredItem,
        getProductEditUrl,
    } = useBundleProduct(mode);

    const { isLoading: isAddingFromProducts, addImages } =
        useProductMediaPicker();

    const productEditUrl = getProductEditUrl();

    return (
        <s-stack gap="base">
            {/* Header with toggle */}
            <s-stack
                direction="inline"
                justifyContent="space-between"
                alignItems="center"
            >
                <s-heading>Bundle as product</s-heading>
                <s-stack
                    direction="inline"
                    justifyContent="space-between"
                    alignItems="center"
                    gap="small-300"
                >
                    {/* Tooltips */}
                    <s-tooltip id="bundle-as-product-tooltip">
                        <s-text>
                            {isEnabled
                                ? "This bundle will create a product with its own product page."
                                : "This bundle will NOT create a standalone product."}
                        </s-text>
                    </s-tooltip>

                    <s-tooltip id="edit-on-shopify-tooltip">
                        <s-text>
                            To add additional information—such as product
                            category, type, tags, or advanced media formats
                            (GIFs, videos)—open the product in your Shopify
                            admin and complete the rest of the fields.
                        </s-text>
                    </s-tooltip>

                    {mode === "create" || !mainProductId ? (
                        <s-icon
                            tone="neutral"
                            type="info"
                            interestFor="bundle-as-product-tooltip"
                        />
                    ) : (
                        <>
                            {isEnabled ? (
                                <s-button
                                    interestFor="edit-on-shopify-tooltip"
                                    disabled={!productEditUrl}
                                    onClick={() => {
                                        if (productEditUrl) {
                                            window.open(
                                                productEditUrl,
                                                "_blank",
                                            );
                                        }
                                    }}
                                >
                                    Edit product
                                </s-button>
                            ) : (
                                <s-icon
                                    tone="neutral"
                                    type="info"
                                    interestFor="bundle-as-product-tooltip"
                                />
                            )}
                        </>
                    )}

                    {/* Switch */}
                    <s-switch
                        id="bundle-product-switch"
                        name="createProduct"
                        label="This bundle creates a product with its own product page."
                        accessibilityLabel="Create product for bundle"
                        labelAccessibilityVisibility="exclusive"
                        checked={isEnabled}
                        onInput={(event: Event) => {
                            const target = event.target as HTMLInputElement;
                            toggleEnabled(target.checked);
                        }}
                    />
                </s-stack>
            </s-stack>

            {/* Loading state */}
            {isLoadingProduct && (
                <s-stack alignItems="center" gap="base">
                    <s-spinner size="base" />
                    <s-text tone="neutral">Loading product data...</s-text>
                </s-stack>
            )}

            {/* Product configuration */}
            {isEnabled && !isLoadingProduct && (
                <s-stack gap="base">
                    {mode === "edit" && mainProductId && (
                        <s-banner tone="info">
                            Any changes to the title, description, or media
                            images will automatically update the Shopify product
                            when you save the bundle.
                        </s-banner>
                    )}
                    {/* Title field */}
                    <s-text-field
                        label="Title"
                        name="productTitle"
                        placeholder="Bundle Product #5"
                        value={productTitle || ""}
                        onChange={(event: Event) => {
                            const target = event.target as HTMLInputElement;
                            handleTitleChange(target.value);
                        }}
                        maxLength={120}
                        error={getFieldError("productTitle")}
                        details={
                            mode === "create"
                                ? "Automatically synced with bundle name"
                                : "Edit to update the shopify product title"
                        }
                    />

                    {/* Description field */}
                    <EditorWysiwyg mode={mode} />

                    {/* Media section */}
                    <s-stack gap="small-200">
                        <s-stack
                            direction="inline"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <s-text>Media</s-text>
                            <s-button
                                variant="secondary"
                                commandFor="product-media-picker-modal"
                                command="--show"
                            >
                                Add media from included products
                            </s-button>
                        </s-stack>

                        <MediaGrid
                            existingMedia={existingMedia}
                            pendingMedia={pendingMedia}
                            hoveredIndex={hoveredIndex}
                            isUploading={isUploading || isAddingFromProducts}
                            onHoverStart={setHoveredItem}
                            onHoverEnd={() => setHoveredItem(null)}
                            onRemoveExisting={handleRemoveExistingMedia}
                            onRemovePending={removePendingMedia}
                            onUpload={handleMediaUpload}
                        />
                    </s-stack>

                    <ProductMediaPicker action={addImages} />
                </s-stack>
            )}
        </s-stack>
    );
}
