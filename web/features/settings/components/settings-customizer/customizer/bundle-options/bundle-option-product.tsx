"use client";

import { useState } from "react";
import { RtpbRangeSlider } from "@/shared";
import { useBundleStore } from "@/features/bundles";

export function BundleOptionsProduct() {
    const { displaySettings, updateDisplaySettings } = useBundleStore();
    const style = displaySettings.style ?? {};
    const [open, setOpen] = useState(false);

    /**
     * Updates a style property in the store
     */
    const updateStyle = (key: string, value: string | number | boolean) => {
        updateDisplaySettings("style", {
            ...style,
            [key]: value,
        });
    };

    return (
        <s-stack>
            <div
                className="cursor-pointer z-30 border-b border-[#e3e3e3] p-4 hover:bg-[#f7f7f7]"
                onClick={() => setOpen((prev) => !prev)}
            >
                <s-stack
                    direction="inline"
                    justifyContent="space-between"
                    alignItems="center"
                    gap="small"
                    aria-expanded={open}
                >
                    <s-heading>Bundle Product</s-heading>
                    <s-icon type={open ? "chevron-up" : "chevron-down"} />
                </s-stack>
            </div>

            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out
                         ${open ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}
                    `}
            >
                <s-stack gap="base" padding="base">
                    {/* Product styling */}
                    <s-stack gap="base">
                        <s-heading>Product</s-heading>
                        <s-grid
                            gridTemplateColumns="repeat(12, 1fr)"
                            gap="base"
                        >
                            <s-grid-item gridColumn="span 4" gridRow="span 3">
                                <s-color-field
                                    label="Background"
                                    name="productBgColor"
                                    placeholder="Select a color"
                                    value={style.productBgColor || "#f7f7f7"}
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
                            <s-grid-item gridColumn="span 4" gridRow="span 3">
                                <s-color-field
                                    label="Text"
                                    name="productTextColor"
                                    placeholder="Select a color"
                                    value={style.productTextColor || "#303030"}
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
                            <s-grid-item gridColumn="span 4" gridRow="span 3">
                                <s-color-field
                                    label="Review stars"
                                    name="productStarColor"
                                    placeholder="Select a color"
                                    value={style.productStarColor || "#ffce07"}
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
                                value={style.productBorderColor || "#e3e3e3"}
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
                                action={(val) =>
                                    updateStyle("productRadius", val)
                                }
                            />
                        </s-stack>
                    </s-stack>
                </s-stack>
            </div>
        </s-stack>
    );
}
