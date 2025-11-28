"use client";

import { MediaGridItemProps, MediaGridProps } from "@/features/bundles";

/**
 * Unified media item component for both existing and new media
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
    return (
        <div
            className={`relative ${isFirst ? "[grid-area:1/1/span_2/span_2]" : ""}`}
            onMouseEnter={() => onHoverStart(index)}
            onMouseLeave={onHoverEnd}
        >
            {/* Image */}
            <div
                className={`w-full h-full rounded-lg border overflow-hidden transition-colors ${
                    isHovered
                        ? "border-2 border-[var(--p-color-border-focus)]"
                        : "border-[var(--p-color-border)]"
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

            {/* Delete button */}
            {isHovered && (
                <div className="absolute z-10 top-1.5 right-1.5">
                    <s-button
                        icon="delete"
                        accessibilityLabel="Remove image"
                        variant="secondary"
                        tone="critical"
                        onClick={onRemove}
                    />
                </div>
            )}

            {/* Hover overlay */}
            {isHovered && (
                <div className="bg-[rgba(255,255,255,0.3)] w-full h-full rounded-lg absolute left-0 top-0" />
            )}
        </div>
    );
}

/**
 * Media grid component for product images
 */
export function MediaGrid({
    mediaFiles,
    existingMedia,
    selectedProductMediaUrls,
    hoveredIndex,
    isUploading,
    onHoverStart,
    onHoverEnd,
    onRemoveNew,
    onRemoveExisting,
    onRemoveProductMedia,
    onUpload,
}: MediaGridProps) {
    /**
     * Handles file selection from the drop zone
     */
    const handleDropzoneChange = (event: Event) => {
        const input = event.currentTarget as HTMLInputElement;
        const files = input.files ? Array.from(input.files) : [];
        onUpload(files);
    };

    const totalMedia =
        existingMedia.length +
        selectedProductMediaUrls.length +
        mediaFiles.length;
    const getGridClass = () => {
        if (totalMedia === 1) {
            return "grid grid-cols-3 auto-rows-[80px] gap-[var(--p-space-150)]";
        }
        return "grid grid-cols-6 auto-rows-[80px] gap-[var(--p-space-150)]";
    };

    let currentIndex = 0;

    return (
        <div className="relative">
            <s-stack direction={totalMedia > 0 ? "inline" : "block"} gap="none">
                <div className={getGridClass()}>
                    {/* Existing media items */}
                    {existingMedia.map((media) => {
                        const index = currentIndex++;
                        return (
                            <MediaItem
                                key={media.id}
                                src={media.url}
                                alt={media.alt || "Product image"}
                                index={index}
                                isHovered={hoveredIndex === index}
                                isFirst={index === 0}
                                onHoverStart={onHoverStart}
                                onHoverEnd={onHoverEnd}
                                onRemove={() => onRemoveExisting(media.id)}
                            />
                        );
                    })}

                    {/* Selected product media (existing Shopify URLs to attach) */}
                    {selectedProductMediaUrls.map((url) => {
                        const index = currentIndex++;
                        return (
                            <MediaItem
                                key={`product-${url}`}
                                src={url}
                                alt="Product image"
                                index={index}
                                isHovered={hoveredIndex === index}
                                isFirst={index === 0}
                                onHoverStart={onHoverStart}
                                onHoverEnd={onHoverEnd}
                                onRemove={() => onRemoveProductMedia(url)}
                            />
                        );
                    })}

                    {/* New media items (pending upload) */}
                    {mediaFiles.map((file, fileIndex) => {
                        const index = currentIndex++;
                        return (
                            <MediaItem
                                key={`new-${file.name}-${fileIndex}`}
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                index={index}
                                isHovered={hoveredIndex === index}
                                isFirst={index === 0}
                                onHoverStart={onHoverStart}
                                onHoverEnd={onHoverEnd}
                                onRemove={() => onRemoveNew(fileIndex)}
                            />
                        );
                    })}

                    {/* Additional upload zone */}
                    {totalMedia > 0 && (
                        <div className="relative">
                            <s-drop-zone
                                accessibilityLabel="Upload additional images"
                                accept="image/*"
                                multiple
                                onChange={handleDropzoneChange}
                            />
                        </div>
                    )}
                </div>

                {/* Initial upload zone */}
                {totalMedia === 0 && (
                    <div className="relative">
                        <s-drop-zone
                            label="Upload image"
                            name="image"
                            accessibilityLabel="Upload image of type jpg, png, or gif"
                            labelAccessibilityVisibility="exclusive"
                            accept="image/*"
                            multiple
                            onChange={handleDropzoneChange}
                        />
                    </div>
                )}
            </s-stack>

            {/* Loading overlay */}
            {isUploading && (
                <div
                    className="absolute inset-0 flex items-center justify-center
                        bg-white/90 rounded-lg z-10"
                >
                    <s-spinner size="base" />
                </div>
            )}
        </div>
    );
}
