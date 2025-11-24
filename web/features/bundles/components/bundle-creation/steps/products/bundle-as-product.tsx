"use client";

import {
    MediaGrid,
    useBundleProduct,
    useBundleValidation,
} from "@/features/bundles";
import React from "react";
import { EditorWysiwyg } from "@/shared/components/fields/editor/editor-wysiwyg";

/**
 * Bundle as product configuration component
 */
export function BundleAsProduct({ mode }: { mode: "create" | "edit" }) {
    const { getFieldError } = useBundleValidation();
    const {
        isEnabled,
        productTitle,
        productDescription,
        mediaFiles,
        existingMedia,
        isUploading,
        isLoadingProduct,
        hoveredIndex,
        mainProductId,
        toggleEnabled,
        handleTitleChange,
        handleDescriptionChange,
        handleMediaUpload,
        removeNewMediaFile,
        handleRemoveExistingMedia,
        setHoveredItem,
        getProductEditUrl,
    } = useBundleProduct(mode);

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
                    <s-tooltip id="bundle-as-product-tooltip">
                        <s-text>
                            This bundle will create a product with its own
                            product page.
                        </s-text>
                    </s-tooltip>
                    <s-icon
                        tone="neutral"
                        type="info"
                        interestFor="bundle-as-product-tooltip"
                    />
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

                    <EditorWysiwyg mode={mode} />

                    {/* Media section */}
                    <s-stack gap="small">
                        <s-stack
                            direction="inline"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <s-heading>Media</s-heading>
                            <s-button variant="secondary">
                                Add media from included products
                            </s-button>
                        </s-stack>

                        <MediaGrid
                            mediaFiles={mediaFiles || []}
                            existingMedia={existingMedia}
                            hoveredIndex={hoveredIndex}
                            isUploading={isUploading}
                            onHoverStart={setHoveredItem}
                            onHoverEnd={() => setHoveredItem(null)}
                            onRemoveNew={removeNewMediaFile}
                            onRemoveExisting={handleRemoveExistingMedia}
                            onUpload={handleMediaUpload}
                        />
                    </s-stack>

                    {/* Info and link to Shopify */}
                    <s-stack gap="base">
                        <s-box
                            padding="base"
                            background="subdued"
                            borderRadius="base"
                        >
                            <s-stack gap="base">
                                <s-text>
                                    To add more details like category, type,
                                    tags, or advanced media types (such as gifs
                                    and videos), go to the product page in your
                                    Shopify admin and fill in the remaining
                                    fields.
                                </s-text>
                                <s-button
                                    disabled={!productEditUrl}
                                    onClick={() => {
                                        if (productEditUrl) {
                                            window.open(productEditUrl, "_blank");
                                        }
                                    }}
                                >
                                    Edit product on Shopify
                                </s-button>
                            </s-stack>
                        </s-box>

                        {mode === "create" && (
                            <s-banner tone="warning">
                                Save the bundle before editing the associated
                                Shopify product.
                            </s-banner>
                        )}

                        {mode === "edit" && mainProductId && (
                            <s-banner tone="info">
                                Changes to title and description will update the
                                Shopify product when you save the bundle.
                            </s-banner>
                        )}
                    </s-stack>
                </s-stack>
            )}
        </s-stack>
    );
}