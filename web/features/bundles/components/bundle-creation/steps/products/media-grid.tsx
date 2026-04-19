"use client";

import {
    MediaGridItemProps,
    MediaGridProps,
    PendingMediaItem,
} from "@/features/bundles";
import { useTranslations } from "@/lib/i18n/provider";

/**
 * Unified media item component
 */
function MediaItem({
    src,
    alt,
    index,
    isHovered,
    isFirst,
    onHoverStart,
    onHoverEnd,
    onRemove,
}: MediaGridItemProps) {
    const t = useTranslations("Bundles.Creation.BundleAsProduct");
    return (
        <div
            className={`relative ${isFirst ? "[grid-area:1/1/span_2/span_2]" : ""}`}
            onMouseEnter={() => onHoverStart(index)}
            onMouseLeave={onHoverEnd}
        >
            <div
                className={`w-full h-full rounded-md border overflow-hidden transition-colors ${
                    isHovered ? "border-[#005bd3]" : "border-[#e3e3e3]"
                }`}
            >
                <s-image
                    src={src}
                    alt={alt}
                    aspectRatio="1/1"
                    inlineSize="fill"
                    objectFit="cover"
                    borderRadius="small"
                />
            </div>

            {isHovered && (
                <div className="absolute z-10 top-1.5 right-1.5">
                    <s-button
                        icon="delete"
                        accessibilityLabel={t("removeImage")}
                        variant="secondary"
                        tone="critical"
                        onClick={onRemove}
                    />
                </div>
            )}

            {isHovered && (
                <div className="bg-[rgba(255,255,255,0.3)] w-full h-full rounded-lg absolute left-0 top-0" />
            )}
        </div>
    );
}

/**
 * Get image source from pending media item
 */
function getPendingMediaSrc(item: PendingMediaItem): string {
    if (item.type === "file") {
        return URL.createObjectURL(item.file);
    }
    return item.url;
}

/**
 * Media grid component for product images
 */
export function MediaGrid({
    existingMedia,
    pendingMedia,
    hoveredIndex,
    isUploading,
    onHoverStart,
    onHoverEnd,
    onRemoveExisting,
    onRemovePending,
    onUpload,
}: MediaGridProps) {
    const t = useTranslations("Bundles.Creation.BundleAsProduct");
    const handleDropzoneChange = (event: Event) => {
        const input = event.currentTarget as HTMLInputElement;
        const files = input.files ? Array.from(input.files) : [];
        onUpload(files);
        input.value = "";
    };

    const totalMedia = existingMedia.length + pendingMedia.length;

    const getGridClass = () => {
        if (totalMedia === 1) {
            return "grid grid-cols-3 auto-rows-[80px] gap-1.5";
        }
        return "grid grid-cols-6 auto-rows-[80px] gap-1.5";
    };

    let currentIndex = 0;

    return (
        <div className="relative">
            <s-stack direction={totalMedia > 0 ? "inline" : "block"} gap="none">
                <div className={getGridClass()}>
                    {/* Existing media (already on Shopify) */}
                    {existingMedia.map((media) => {
                        const index = currentIndex++;
                        return (
                            <MediaItem
                                key={media.id}
                                src={media.url}
                                alt={media.alt || t("productImageAlt")}
                                index={index}
                                isHovered={hoveredIndex === index}
                                isFirst={index === 0}
                                onHoverStart={onHoverStart}
                                onHoverEnd={onHoverEnd}
                                onRemove={() => onRemoveExisting(media.id)}
                            />
                        );
                    })}

                    {/* Pending media (files + URLs in order added) */}
                    {pendingMedia.map((item) => {
                        const index = currentIndex++;
                        return (
                            <MediaItem
                                key={item.id}
                                src={getPendingMediaSrc(item)}
                                alt={
                                    item.type === "file"
                                        ? item.file.name
                                        : t("productImageAlt")
                                }
                                index={index}
                                isHovered={hoveredIndex === index}
                                isFirst={index === 0}
                                onHoverStart={onHoverStart}
                                onHoverEnd={onHoverEnd}
                                onRemove={() => onRemovePending(item.id)}
                            />
                        );
                    })}

                    {/* Upload zone */}
                    {totalMedia > 0 && (
                        <div className="relative">
                            <s-drop-zone
                                accessibilityLabel={t("uploadMore")}
                                accept="image/*"
                                multiple
                                onChange={handleDropzoneChange}
                            />
                        </div>
                    )}
                </div>

                {totalMedia === 0 && (
                    <div className="relative">
                        <s-drop-zone
                            label="Upload image"
                            name="image"
                            accessibilityLabel={t("uploadImageTypes")}
                            labelAccessibilityVisibility="exclusive"
                            accept="image/*"
                            multiple
                            onChange={handleDropzoneChange}
                        />
                    </div>
                )}
            </s-stack>

            {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-lg z-10">
                    <s-spinner size="base" accessibilityLabel={t("uploadingImage")} />
                    <div role="status" aria-live="polite" className="sr-only">
                        Uploading image, please wait
                    </div>
                </div>
            )}
        </div>
    );
}
