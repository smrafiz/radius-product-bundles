"use client";

import { MediaGridItemProps, MediaGridProps } from "@/features/bundles";

/**
 * Media grid component for product images
 */
export function MediaGrid({
    mediaFiles,
    hoveredIndex,
    isUploading,
    onHoverStart,
    onHoverEnd,
    onRemove,
    onUpload,
}: MediaGridProps) {
    const handleDropzoneChange = (event: Event) => {
        const input = event.currentTarget as HTMLInputElement;
        const files = input.files ? Array.from(input.files) : [];
        onUpload(files);
    };

    return (
        <div className="relative">
            <s-stack
                direction={mediaFiles.length > 0 ? "inline" : "block"}
                gap="none"
            >
                <div className="grid grid-cols-6 auto-rows-fr gap-[var(--p-space-150)]">
                    {mediaFiles.map((file, index) => (
                        <MediaGridItem
                            key={`${file.name}-${index}`}
                            file={file}
                            index={index}
                            isHovered={hoveredIndex === index}
                            isFirst={index === 0}
                            onHoverStart={onHoverStart}
                            onHoverEnd={onHoverEnd}
                            onRemove={onRemove}
                        />
                    ))}

                    {/* Additional upload zone */}
                    {mediaFiles.length > 0 && (
                        <div className="realative">
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
                {mediaFiles.length === 0 && (
                    <div className="realative">
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

function MediaGridItem({
    file,
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
                        ? "border-[var(--p-color-bg-fill-success)]"
                        : "border-[var(--p-color-border)]"
                }`}
            >
                <s-image
                    src={URL.createObjectURL(file)}
                    alt={file.name}
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
                        accessibilityLabel="Delete image"
                        variant="secondary"
                        tone="critical"
                        onClick={() => onRemove(index)}
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
