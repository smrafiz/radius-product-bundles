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
import { useTranslations } from "@/lib/i18n/provider";

/**
 * Bundle as product configuration component
 */
export function BundleAsProduct({ mode }: { mode: "create" | "edit" }) {
    const t = useTranslations("Bundles.Creation.BundleAsProduct");
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
        handleToggle,
        handleTitleChange,
        handleTitleBlur,
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
                <s-heading>{t("heading")}</s-heading>
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
                                ? t("willCreate")
                                : t("willNotCreate")}
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
                                    {t("editProduct")}
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
                        accessibilityLabel={t("createProduct")}
                        labelAccessibilityVisibility="exclusive"
                        checked={isEnabled}
                        onInput={(event: Event) => {
                            const target = event.target as HTMLInputElement;
                            handleToggle(target.checked);
                        }}
                    />
                </s-stack>
            </s-stack>

            {/* Loading state */}
            {isLoadingProduct && (
                <s-stack alignItems="center" gap="base">
                    <s-spinner size="base" />
                    <s-text tone="neutral">{t("loading")}</s-text>
                </s-stack>
            )}

            {/* Product configuration */}
            {isEnabled && !isLoadingProduct && (
                <s-stack gap="base">
                    {mode === "edit" && mainProductId && (
                        <s-banner tone="info">
                            {t("syncBanner")}
                        </s-banner>
                    )}
                    {/* Title field */}
                    <s-text-field
                        label={t("title")}
                        name="productTitle"
                        placeholder="Bundle Product #5"
                        value={productTitle || ""}
                        onChange={(event: Event) => {
                            const target = event.target as HTMLInputElement;
                            handleTitleChange(target.value);
                        }}
                        onBlur={handleTitleBlur}
                        maxLength={120}
                        error={getFieldError("productTitle")}
                        details={
                            mode === "create"
                                ? t("syncedWithName")
                                : t("editToUpdate")
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
                            <s-text>{t("media")}</s-text>
                            <s-button
                                variant="secondary"
                                commandFor="product-media-picker-modal"
                                command="--show"
                            >
                                {t("addMediaFromProducts")}
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
