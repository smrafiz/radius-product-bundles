"use client";

import { useState } from "react";
import { RtpbRangeSlider } from "@/shared";
import { useBundleStore } from "@/features/bundles";

/**
 * Widget Appearance Settings Component
 * Manages visual styling for buttons, products, and widget container
 */
export function WidgetAppearance() {
    const { displaySettings, updateDisplaySettings } = useBundleStore();
    const style = displaySettings.style || {};
    const [open, setOpen] = useState(true);

    /**
     * Updates a style property in the store
     */
    const updateStyle = (key: string, value: string | number | boolean) => {
        updateDisplaySettings("style", {
            ...style,
            [key]: value,
        });
    };

    interface ChoiceListElement extends HTMLElement {
        values: string[];
    }

    return (
        <s-section padding="none">
            <s-stack>
                <div
                    className="cursor-pointer p-4 z-30"
                    onClick={() => setOpen((prev) => !prev)}
                >
                    <s-stack
                        direction="inline"
                        justifyContent="space-between"
                        alignItems="center"
                        gap="small"
                        aria-expanded={open}
                    >
                        <s-heading>Appearance</s-heading>
                        <s-icon type={open ? "chevron-up" : "chevron-down"} />
                    </s-stack>
                </div>

                <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out
                         ${open ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}
                    `}
                >
                    <s-stack gap="base" padding="base">
                        <s-stack
                            direction="inline"
                            alignItems="center"
                            gap="small-300"
                        >
                            <s-heading>Font size</s-heading>
                            <s-button-group gap="none">
                                <s-button
                                    slot="secondary-actions"
                                    onClick={() =>
                                        updateStyle("productFontSize", 12)
                                    }
                                >
                                    Small
                                </s-button>
                                <s-button
                                    slot="secondary-actions"
                                    onClick={() =>
                                        updateStyle("productFontSize", 14)
                                    }
                                >
                                    Medium
                                </s-button>
                                <s-button
                                    slot="secondary-actions"
                                    onClick={() =>
                                        updateStyle("productFontSize", 16)
                                    }
                                >
                                    Large
                                </s-button>
                            </s-button-group>
                        </s-stack>
                        {/* Add to cart button styling */}
                        <s-stack
                            direction="inline"
                            justifyContent="space-between"
                            alignItems="center"
                            background="subdued"
                            padding="small"
                            borderRadius="large"
                        >
                            <s-switch
                                id="cart-button-switch"
                                label="Styling of the Add to Cart button"
                                accessibilityLabel="Toggle add to cart"
                                checked={style.buttonStyleEnabled ?? true}
                                onInput={(event: Event) => {
                                    const target =
                                        event.target as HTMLInputElement;
                                    updateStyle(
                                        "buttonStyleEnabled",
                                        target.checked,
                                    );
                                }}
                            />
                        </s-stack>

                        {(style.buttonStyleEnabled ?? true) && (
                            <s-stack gap="base">
                                <s-grid
                                    gridTemplateColumns="repeat(12, 1fr)"
                                    gap="base"
                                >
                                    <s-grid-item
                                        gridColumn="span 6"
                                        gridRow="span 2"
                                    >
                                        <s-color-field
                                            label="Background"
                                            name="buttonBgColor"
                                            placeholder="Select a color"
                                            value={
                                                style.buttonBgColor || "#303030"
                                            }
                                            onInput={(event: Event) => {
                                                const target =
                                                    event.target as HTMLInputElement;
                                                updateStyle(
                                                    "buttonBgColor",
                                                    target.value,
                                                );
                                            }}
                                        />
                                    </s-grid-item>
                                    <s-grid-item
                                        gridColumn="span 6"
                                        gridRow="span 2"
                                    >
                                        <s-color-field
                                            label="Text"
                                            name="buttonTextColor"
                                            placeholder="Select a color"
                                            value={
                                                style.buttonTextColor ||
                                                "#ffffff"
                                            }
                                            onInput={(event: Event) => {
                                                const target =
                                                    event.target as HTMLInputElement;
                                                updateStyle(
                                                    "buttonTextColor",
                                                    target.value,
                                                );
                                            }}
                                        />
                                    </s-grid-item>
                                </s-grid>
                                <s-stack>
                                    <s-text>Corner radius</s-text>
                                    <RtpbRangeSlider
                                        values={style.buttonRadius ?? 8}
                                        maxValue={30}
                                        action={(val) =>
                                            updateStyle("buttonRadius", val)
                                        }
                                    />
                                </s-stack>
                            </s-stack>
                        )}

                        <s-divider />

                        {/* Product styling */}
                        <s-stack gap="base">
                            <s-heading>Product</s-heading>
                            <s-grid
                                gridTemplateColumns="repeat(12, 1fr)"
                                gap="base"
                            >
                                <s-grid-item
                                    gridColumn="span 4"
                                    gridRow="span 3"
                                >
                                    <s-color-field
                                        label="Background"
                                        name="productBgColor"
                                        placeholder="Select a color"
                                        value={
                                            style.productBgColor || "#f7f7f7"
                                        }
                                        onInput={(event: Event) => {
                                            const target =
                                                event.target as HTMLInputElement;
                                            updateStyle(
                                                "productBgColor",
                                                target.value,
                                            );
                                        }}
                                    />
                                </s-grid-item>
                                <s-grid-item
                                    gridColumn="span 4"
                                    gridRow="span 3"
                                >
                                    <s-color-field
                                        label="Text"
                                        name="productTextColor"
                                        placeholder="Select a color"
                                        value={
                                            style.productTextColor || "#303030"
                                        }
                                        onInput={(event: Event) => {
                                            const target =
                                                event.target as HTMLInputElement;
                                            updateStyle(
                                                "productTextColor",
                                                target.value,
                                            );
                                        }}
                                    />
                                </s-grid-item>
                                <s-grid-item
                                    gridColumn="span 4"
                                    gridRow="span 3"
                                >
                                    <s-color-field
                                        label="Review stars"
                                        name="productStarColor"
                                        placeholder="Select a color"
                                        value={
                                            style.productStarColor || "#ffce07"
                                        }
                                        onInput={(event: Event) => {
                                            const target =
                                                event.target as HTMLInputElement;
                                            updateStyle(
                                                "productStarColor",
                                                target.value,
                                            );
                                        }}
                                    />
                                </s-grid-item>
                            </s-grid>
                        </s-stack>

                        <s-stack>
                            <s-choice-list
                                label="Title alignment"
                                name="title-alignment"
                                values={[style.titleAlignment ?? "left"]}
                                onChange={(event: Event) => {
                                    const target = event.currentTarget as ChoiceListElement;

                                    if (!target.values?.length) return;

                                    updateStyle(
                                        "titleAlignment",
                                        target.values[0] as "left" | "center" | "right"
                                    );
                                }}
                            >
                                <s-choice value="left">Left</s-choice>
                                <s-choice value="center">Center</s-choice>
                                <s-choice value="right">Right</s-choice>
                            </s-choice-list>
                        </s-stack>

                        <s-stack gap="base">
                            <s-stack
                                direction="inline"
                                justifyContent="space-between"
                                alignItems="center"
                            >
                                <s-switch
                                    id="product-add-border"
                                    label="Add border"
                                    accessibilityLabel="Add border"
                                    checked={style.productBorderEnabled ?? true}
                                    onInput={(event: Event) => {
                                        const target =
                                            event.target as HTMLInputElement;
                                        updateStyle(
                                            "productBorderEnabled",
                                            target.checked,
                                        );
                                    }}
                                />
                            </s-stack>
                        </s-stack>
                        <s-stack gap="base">
                            {(style.productBorderEnabled ?? true) && (
                                <s-color-field
                                    label="Border color"
                                    name="productBorderColor"
                                    placeholder="Select a color"
                                    value={
                                        style.productBorderColor || "#e3e3e3"
                                    }
                                    onInput={(event: Event) => {
                                        const target =
                                            event.target as HTMLInputElement;
                                        updateStyle(
                                            "productBorderColor",
                                            target.value,
                                        );
                                    }}
                                />
                            )}
                            <s-stack>
                                <s-text>Corner radius</s-text>
                                <RtpbRangeSlider
                                    values={style.productRadius ?? 12}
                                    maxValue={30}
                                    action={(val) =>
                                        updateStyle("productRadius", val)
                                    }
                                />
                            </s-stack>
                        </s-stack>

                        <s-divider />

                        {/* Image styling */}
                        <s-stack gap="base">
                            <s-heading>Image</s-heading>
                            <s-stack gap="base">
                                <s-stack
                                    direction="inline"
                                    justifyContent="space-between"
                                    alignItems="center"
                                >
                                    <s-switch
                                        id="image-add-border"
                                        label="Add border"
                                        accessibilityLabel="Add border"
                                        checked={
                                            style.imageBorderEnabled ?? true
                                        }
                                        onInput={(event: Event) => {
                                            const target =
                                                event.target as HTMLInputElement;
                                            updateStyle(
                                                "imageBorderEnabled",
                                                target.checked,
                                            );
                                        }}
                                    />
                                </s-stack>
                            </s-stack>
                            <s-stack gap="base" paddingBlockEnd="base">
                                {(style.imageBorderEnabled ?? true) && (
                                    <s-color-field
                                        label="Border color"
                                        name="imageBorderColor"
                                        placeholder="Select a color"
                                        value={
                                            style.imageBorderColor || "#e3e3e3"
                                        }
                                        onInput={(event: Event) => {
                                            const target =
                                                event.target as HTMLInputElement;
                                            updateStyle(
                                                "imageBorderColor",
                                                target.value,
                                            );
                                        }}
                                    />
                                )}
                                <s-stack>
                                    <s-text>Corner radius</s-text>
                                    <RtpbRangeSlider
                                        values={style.imageRadius ?? 6}
                                        maxValue={100}
                                        action={(val) =>
                                            updateStyle("imageRadius", val)
                                        }
                                    />
                                </s-stack>

                                <s-stack>
                                    <s-text>Width</s-text>
                                    <RtpbRangeSlider
                                        values={style.imageWidth ?? 80}
                                        maxValue={500}
                                        action={(val) =>
                                            updateStyle("imageWidth", val)
                                        }
                                    />
                                </s-stack>
                            </s-stack>
                        </s-stack>

                        <s-divider />

                        {/* Widget styling */}
                        <s-stack gap="base">
                            <s-heading>Widget</s-heading>
                            <s-grid
                                gridTemplateColumns="repeat(12, 1fr)"
                                gap="base"
                            >
                                <s-grid-item
                                    gridColumn="span 6"
                                    gridRow="span 2"
                                >
                                    <s-color-field
                                        label="Background"
                                        name="boxBgColor"
                                        placeholder="Select a color"
                                        value={style.boxBgColor || "#ffffff"}
                                        onInput={(event: Event) => {
                                            const target =
                                                event.target as HTMLInputElement;
                                            updateStyle(
                                                "boxBgColor",
                                                target.value,
                                            );
                                        }}
                                    />
                                </s-grid-item>
                                <s-grid-item
                                    gridColumn="span 6"
                                    gridRow="span 2"
                                >
                                    <s-color-field
                                        label="Text"
                                        name="boxTextColor"
                                        placeholder="Select a color"
                                        value={style.boxTextColor || "#303030"}
                                        onInput={(event: Event) => {
                                            const target =
                                                event.target as HTMLInputElement;
                                            updateStyle(
                                                "boxTextColor",
                                                target.value,
                                            );
                                        }}
                                    />
                                </s-grid-item>
                            </s-grid>

                            <s-stack gap="base">
                                <s-stack
                                    direction="inline"
                                    justifyContent="space-between"
                                    alignItems="center"
                                >
                                    <s-switch
                                        id="box-add-border"
                                        label="Add border"
                                        accessibilityLabel="Add border"
                                        checked={style.boxBorderEnabled ?? true}
                                        onInput={(event: Event) => {
                                            const target =
                                                event.target as HTMLInputElement;
                                            updateStyle(
                                                "boxBorderEnabled",
                                                target.checked,
                                            );
                                        }}
                                    />
                                </s-stack>
                            </s-stack>

                            <s-stack gap="base" paddingBlockEnd="base">
                                {(style.boxBorderEnabled ?? true) && (
                                    <s-stack gap="base">
                                        <s-color-field
                                            label="Border color"
                                            name="boxBorderColor"
                                            placeholder="Select a color"
                                            value={
                                                style.boxBorderColor ||
                                                "#e3e3e3"
                                            }
                                            onInput={(event: Event) => {
                                                const target =
                                                    event.target as HTMLInputElement;
                                                updateStyle(
                                                    "boxBorderColor",
                                                    target.value,
                                                );
                                            }}
                                        />
                                        <s-stack gap="small-400">
                                            <s-text>Thin</s-text>
                                            <RtpbRangeSlider
                                                values={
                                                    style.boxBorderWidth ?? 1
                                                }
                                                maxValue={5}
                                                action={(val) =>
                                                    updateStyle(
                                                        "boxBorderWidth",
                                                        val,
                                                    )
                                                }
                                            />
                                        </s-stack>
                                    </s-stack>
                                )}

                                <s-stack gap="small-400">
                                    <s-text>Corner radius</s-text>
                                    <RtpbRangeSlider
                                        values={style.boxRadius ?? 12}
                                        maxValue={30}
                                        action={(val) =>
                                            updateStyle("boxRadius", val)
                                        }
                                    />
                                </s-stack>
                                <s-stack
                                    direction="inline"
                                    alignItems="center"
                                    gap="small-300"
                                >
                                    <s-text>Image align</s-text>
                                    <s-button-group>
                                        <s-button
                                            slot="secondary-actions"
                                            variant="primary"
                                            onClick={() =>
                                                updateStyle(
                                                    "productAlign",
                                                    "row",
                                                )
                                            }
                                        >
                                            Left
                                        </s-button>
                                        <s-button
                                            slot="secondary-actions"
                                            onClick={() =>
                                                updateStyle(
                                                    "productAlign",
                                                    "row-reverse",
                                                )
                                            }
                                        >
                                            Right
                                        </s-button>
                                    </s-button-group>
                                </s-stack>
                            </s-stack>
                        </s-stack>
                    </s-stack>
                </div>
            </s-stack>
        </s-section>
    );
}
