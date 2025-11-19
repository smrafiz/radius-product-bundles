"use client";

import {
    MediaGrid,
    useBundleProduct,
    useBundleValidation,
} from "@/features/bundles";

/**
 * Bundle as product configuration component
 */
export function BundleAsProduct() {
    const { getFieldError } = useBundleValidation();
    const {
        isEnabled,
        bundleName,
        productDescription,
        mediaFiles,
        isUploading,
        hoveredIndex,
        toggleEnabled,
        handleTitleChange,
        handleDescriptionChange,
        handleMediaUpload,
        removeMediaFile,
        setHoveredItem,
    } = useBundleProduct();

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

            {/* Product configuration - shown when enabled */}
            {isEnabled && (
                <s-stack gap="base">
                    {/* Title field */}
                    <s-text-field
                        label="Title"
                        name="productTitle"
                        placeholder="Bundle Product #5"
                        value={bundleName || ""}
                        onChange={(event: Event) => {
                            const target = event.target as HTMLInputElement;
                            handleTitleChange(target.value);
                        }}
                        maxLength={120}
                        error={getFieldError("productTitle")}
                        details="Used as the title of the product page."
                    />

                    {/* Description field */}
                    <s-text-area
                        label="Product description"
                        name="productDescription"
                        value={productDescription || ""}
                        placeholder="Describe this bundle product..."
                        onChange={(event: Event) => {
                            const target = event.target as HTMLTextAreaElement;
                            handleDescriptionChange(target.value);
                        }}
                        rows={3}
                        error={getFieldError("productDescription")}
                    />

                    {/* Media Section */}
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
                            mediaFiles={mediaFiles}
                            hoveredIndex={hoveredIndex}
                            isUploading={isUploading}
                            onHoverStart={setHoveredItem}
                            onHoverEnd={() => setHoveredItem(null)}
                            onRemove={removeMediaFile}
                            onUpload={handleMediaUpload}
                        />
                    </s-stack>

                    {/* Info and warning banners */}
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
                                <s-button disabled>
                                    Edit product on Shopify
                                </s-button>
                            </s-stack>
                        </s-box>

                        <s-banner tone="warning">
                            Save the bundle before editing the associated
                            Shopify product.
                        </s-banner>
                    </s-stack>
                </s-stack>
            )}
        </s-stack>
    );
}