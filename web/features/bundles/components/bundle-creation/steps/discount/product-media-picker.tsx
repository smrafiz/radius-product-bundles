"use client";

import React, { useMemo, useState } from "react";
import { useBundleStore } from "@/features/bundles";

/**
 * Modal to select media from included bundle products
 */
export function ProductMediaPicker({
    action,
}: {
    action: (images: string[]) => void;
}) {
    const { selectedItems } = useBundleStore();
    const [selectedImages, setSelectedImages] = useState<Set<string>>(
        new Set(),
    );

    // Get unique images from selected products (deduplicate by productId for BOGO same-product mode)
    const productImages = useMemo(() => {
        const seen = new Set<string>();
        return selectedItems
            .filter((item) => {
                if (!item.image || seen.has(item.productId)) return false;
                seen.add(item.productId);
                return true;
            })
            .map((item) => ({
                productId: item.productId,
                productTitle: item.title,
                imageUrl: item.image!,
            }));
    }, [selectedItems]);

    /**
     * Toggle image selection
     */
    const toggleImage = (imageUrl: string) => {
        setSelectedImages((prev) => {
            const next = new Set(prev);
            if (next.has(imageUrl)) {
                next.delete(imageUrl);
            } else {
                next.add(imageUrl);
            }
            return next;
        });
    };

    /**
     * Toggle all images
     */
    const toggleAll = () => {
        if (selectedImages.size === productImages.length) {
            setSelectedImages(new Set());
        } else {
            setSelectedImages(new Set(productImages.map((p) => p.imageUrl)));
        }
    };

    /**
     * Handle add button click
     */
    const handleAdd = () => {
        action(Array.from(selectedImages));
        setSelectedImages(new Set());
    };

    /**
     * Reset selection when modal closes
     */
    const handleHide = () => {
        setSelectedImages(new Set());
    };

    return (
        <s-modal
            id="product-media-picker-modal"
            heading="Add media from products"
            accessibilityLabel="Add media from products"
            onHide={handleHide}
        >
            <s-stack gap="base">
                {/* Select all */}
                <s-checkbox
                    checked={
                        selectedImages.size === productImages.length &&
                        productImages.length > 0
                    }
                    onChange={toggleAll}
                    label={`Select all (${selectedImages.size} selected)`}
                />

                {/* Image grid */}
                {productImages.length > 0 ? (
                    <s-stack direction="inline" gap="base">
                        <s-grid
                            gridTemplateColumns="repeat(6, 1fr)"
                            gap="small-300"
                            alignItems="center"
                        >
                            {productImages.map((item) => {
                                const isSelected = selectedImages.has(
                                    item.imageUrl,
                                );

                                return (
                                    <s-grid-item key={item.productId}>
                                        <div
                                            className="relative cursor-pointer"
                                            onClick={() =>
                                                toggleImage(item.imageUrl)
                                            }
                                        >
                                            <div className="absolute top-1.5 left-1.5 z-10">
                                                <s-checkbox
                                                    checked={isSelected}
                                                    onInput={(e: Event) => {
                                                        e.stopPropagation();
                                                    }}
                                                />
                                            </div>

                                            <div className="w-full h-full rounded-lg border overflow-hidden transition-colors border-[#e3e3e3]">
                                                <s-image
                                                    src={item.imageUrl}
                                                    alt={item.productTitle}
                                                    aspectRatio="1/1"
                                                    inlineSize="fill"
                                                    objectFit="cover"
                                                    borderRadius="small"
                                                />
                                            </div>
                                            {isSelected && (
                                                <div className="absolute inset-0 border-2 border-[#005bd3] rounded-lg"></div>
                                            )}
                                        </div>
                                    </s-grid-item>
                                );
                            })}
                        </s-grid>
                    </s-stack>
                ) : (
                    <s-text color="subdued">
                        No images available from selected products.
                    </s-text>
                )}
            </s-stack>

            <s-button
                slot="secondary-actions"
                commandFor="product-media-picker-modal"
                command="--hide"
            >
                Cancel
            </s-button>

            <s-button
                slot="primary-action"
                variant="primary"
                onClick={handleAdd}
                commandFor="product-media-picker-modal"
                command="--hide"
                disabled={selectedImages.size === 0}
            >
                Add Media
            </s-button>
        </s-modal>
    );
}
