"use client";

import { useState } from "react";
import { RtpbRangeSlider } from "@/shared";
import { useBundleStore } from "@/features/bundles";

export function BundleOptionsImage() {
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
                className={`cursor-pointer z-30 border-b border-[#e3e3e3] p-4 hover:bg-[#f7f7f7] ${open ? "bg-[#f7f7f7]" : ""}`}
                onClick={() => setOpen((prev) => !prev)}
            >
                <s-stack
                    direction="inline"
                    justifyContent="space-between"
                    alignItems="center"
                    gap="small"
                    aria-expanded={open}
                >
                    <s-heading>Image</s-heading>
                    <s-icon type={open ? "chevron-up" : "chevron-down"} />
                </s-stack>
            </div>

            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out
                         ${open ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}
                    `}
            >
                <s-stack gap="base" padding="base">
                    {/* Image styling */}
                    <s-stack gap="base">
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
                            <s-text>Corner radius</s-text>
                            <RtpbRangeSlider
                                values={style.imageRadius ?? 6}
                                action={(val) =>
                                    updateStyle("imageRadius", val)
                                }
                            />
                        </s-stack>
                    </s-stack>
                </s-stack>
            </div>
        </s-stack>
    );
}
