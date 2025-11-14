"use client";

import { useState } from "react";
import { CallbackEvent } from "@shopify/polaris-types";

export function ProductBundle() {
    const [show, setShow] = useState<boolean>(true);
    const [title, setTitle] = useState<string>("Bundle Product #5");

    const [mediaFiles, setMediaFiles] = useState<File[]>([]);
    const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);

    const handleTitleChange = (event: CallbackEvent<"s-text-field">) => {
        const target = event.target as HTMLInputElement;
        if (target.name === "title") {
            const newValue = target.value.slice(0, 220);
            setTitle(newValue);
        }
    };

    const handleDropzoneChange = (event: Event) => {
        const input = event.currentTarget as HTMLInputElement;
        const files = input.files ? Array.from(input.files) : [];
        if (files.length > 0) {
            setMediaFiles((prev) => [...prev, ...files]);
        }
    };

    const deleteSelectedImages = () => {
        setMediaFiles((prev) =>
            prev.filter((_, i) => !selectedIndexes.includes(i)),
        );
        setSelectedIndexes([]);
    };

    const removeImage = (index: number) => {
        setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const toggleCheckbox = (index: number) => {
        setSelectedIndexes((prev) =>
            prev.includes(index)
                ? prev.filter((i) => i !== index)
                : [...prev, index],
        );
    };

    return (
        <s-stack gap="base">
            <s-heading>Bundle as product</s-heading>

            <s-stack
                direction="inline"
                justifyContent="space-between"
                alignItems="center"
                background="subdued"
                padding="small"
                borderRadius="large"
            >
                <s-switch
                    id="event-switch"
                    label={show
                        ? "This bundle creates a product with its own product page."
                        : "This bundle creates no product and has no product page."}
                    accessibilityLabel="Toggle product creation"
                    checked={show}
                    onInput={(event: Event) => {
                        const target = event.target as HTMLInputElement;
                        setShow(target.checked);
                    }}
                />
            </s-stack>

            {show && (
                <s-stack gap="base">
                    <s-text-field
                        label="Title"
                        name="title"
                        placeholder="Bundle product #5"
                        value={title}
                        onChange={handleTitleChange}
                        maxLength={220}
                    />

                    <s-text-area
                        label="Product description"
                        value=""
                        rows={3}
                    />

                    {/* Media Section */}
                    <s-stack gap="small">
                        <s-stack
                            direction="inline"
                            justifyContent="space-between"
                        >
                            <s-heading>
                                {selectedIndexes.length >= 1
                                    ? `${selectedIndexes.length} media selected`
                                    : "Media"}
                            </s-heading>

                            {/* DYNAMIC LINK TEXT */}
                            {selectedIndexes.length > 0 ? (
                                <s-link
                                    tone="critical"
                                    onClick={deleteSelectedImages}
                                >
                                    Delete image
                                </s-link>
                            ) : (
                                <s-link>
                                    Add media from included products
                                </s-link>
                            )}
                        </s-stack>

                        <s-stack
                            direction={
                                mediaFiles.length > 0 ? "inline" : "block"
                            }
                            gap="base"
                        >
                            {/* List Images */}
                            {mediaFiles.length > 0 && (
                                <s-stack gap="small" direction="inline">
                                    {mediaFiles.map((file, index) => {
                                        const isHovered = hoverIndex === index;
                                        const isSelected =
                                            selectedIndexes.includes(index);

                                        return (
                                            <div className="relative inline-block"
                                                key={index}
                                                onMouseEnter={() =>
                                                    setHoverIndex(index)
                                                }
                                                onMouseLeave={() =>
                                                    setHoverIndex(null)
                                                }
                                            >
                                                {/* Image */}
                                                <div className={`w-22 h-22 object-cover rounded-lg border  ${isSelected ? "border-[var(--p-color-bg-fill-success)]" : ""}`}>
                                                    <s-image
                                                        src={URL.createObjectURL(
                                                            file,
                                                        )}
                                                        alt={file.name}
                                                        aspectRatio="1/1"
                                                        inlineSize="fill"
                                                        objectFit="cover"
                                                        borderRadius="base"
                                                    />
                                                </div>

                                                {/* Hover Checkbox */}
                                                {(isHovered || isSelected) && (
                                                    <div className="absolute top-1.5 right-1.5 bg-white rounded-md p-0.5"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() =>
                                                                toggleCheckbox(
                                                                    index,
                                                                )
                                                            }
                                                            style={{
                                                                cursor: "pointer",
                                                            }}
                                                        />
                                                    </div>
                                                )}

                                            </div>
                                        );
                                    })}
                                </s-stack>
                            )}

                            {/* Upload Zone */}
                            <s-drop-zone
                                accessibilityLabel="Upload image of type jpg, png, or gif"
                                multiple
                                onChange={handleDropzoneChange}
                            />
                        </s-stack>
                    </s-stack>

                    <s-divider />

                    <s-stack gap="base">
                        <s-heading>Other product details</s-heading>
                        <s-text>
                            To add more details like category, type, tags, or
                            advanced media types (such as gifs and videos), go
                            to the product page in your Shopify admin and fill
                            in the remaining fields.
                        </s-text>
                        <s-button disabled>Edit product on Shopify</s-button>
                        <s-banner>
                            Save the bundle before editing the associated
                            Shopify product.
                        </s-banner>
                    </s-stack>
                </s-stack>
            )}
        </s-stack>
    );
}
