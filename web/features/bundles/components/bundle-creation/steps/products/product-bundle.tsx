"use client";

import { useState } from "react";
import { CallbackEvent } from "@shopify/polaris-types";

export function ProductBundle() {
    const [show, setShow] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [title, setTitle] = useState<string>("Bundle Product #5");

    const [mediaFiles, setMediaFiles] = useState<File[]>([]);
    const [itemIndex, setItemIndex] = useState<number | null>(null);

    const handleTitleChange = (event: CallbackEvent<"s-text-field">) => {
        const target = event.target as HTMLInputElement;
        if (target.name === "title") {
            const newValue = target.value.slice(0, 220);
            setTitle(newValue);
        }
    };

    const handleDropzoneChange = async (event: Event) => {
        setIsLoading(true);
        const input = event.currentTarget as HTMLInputElement;
        const files = input.files ? Array.from(input.files) : [];
        if (files.length > 0) {
            await new Promise((resolve) => setTimeout(resolve, 400));
            setMediaFiles((prev) => [...prev, ...files]);
        }
        setIsLoading(false);
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
                    label={
                        show
                            ? "This bundle creates a product with its own product page."
                            : "This bundle creates no product and has no product page."
                    }
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
                            <s-heading>Media</s-heading>
                            <s-link>Add media from included products</s-link>
                        </s-stack>

                        <div className="relative">
                            <s-stack
                                direction={
                                    mediaFiles.length > 0 ? "inline" : "block"
                                }
                                gap="base"
                            >
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(6,1fr)",
                                        gridTemplateRows: "repeat(auto,1fr)",
                                        gap: "var(--p-space-150)",
                                    }}
                                >
                                    {mediaFiles.map((file, index) => {
                                        const isHovered = itemIndex === index;
                                        const isFirst = index === 0;

                                        return (
                                            <div
                                                className="relative"
                                                key={index}
                                                onMouseEnter={() =>
                                                    setItemIndex(index)
                                                }
                                                onMouseLeave={() =>
                                                    setItemIndex(null)
                                                }
                                                style={
                                                    isFirst
                                                        ? {
                                                              gridArea:
                                                                  "1 / 1 / span 2 / span 2",
                                                          }
                                                        : undefined
                                                }
                                            >
                                                {/* Fixed square image */}
                                                <div
                                                    className={`w-full h-full rounded-lg border overflow-hidden ${isHovered ? "border-[var(--p-color-bg-fill-success)]" : ""}`}
                                                >
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

                                                {/* Delete icon */}
                                                {isHovered && (
                                                    <div className="absolute z-10 top-1.5 right-1.5">
                                                        <s-button
                                                            icon="delete"
                                                            accessibilityLabel="Delete image"
                                                            variant="secondary"
                                                            tone="critical"
                                                            onClick={() => {
                                                                setMediaFiles(
                                                                    (prev) =>
                                                                        prev.filter(
                                                                            (
                                                                                _,
                                                                                i,
                                                                            ) =>
                                                                                i !==
                                                                                index,
                                                                        ),
                                                                );
                                                            }}
                                                        />
                                                    </div>
                                                )}

                                                {/* Hover overlay */}
                                                {isHovered && (
                                                    <div className="bg-[rgba(255,255,255,0.3)] w-full h-full rounded-lg absolute left-0 top-0"></div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {/* Upload Zone */}
                                    <div style={{ position: "relative" }}>
                                        <s-drop-zone
                                            accessibilityLabel="Upload image"
                                            accept="image/*"
                                            multiple
                                            onChange={handleDropzoneChange}
                                        />
                                    </div>
                                </div>


                            </s-stack>

                            {isLoading && (
                                <div
                                    className="absolute inset-0 flex items-center justify-center
                                        bg-white/90 rounded-lg z-10"
                                >
                                    <s-spinner size="base" />
                                </div>
                            )}
                        </div>
                    </s-stack>

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
