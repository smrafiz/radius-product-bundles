"use client";

import { useState } from "react";
import { RtpbRangeSlider } from "@/shared";
import { useBundleStore } from "@/features/bundles";

export function BundleOptionsBox() {
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
                    <s-heading>Box</s-heading>
                    <s-icon type={open ? "chevron-up" : "chevron-down"} />
                </s-stack>
            </div>

            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out
                         ${open ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}
                    `}
            >
                <s-stack gap="base" padding="base">
                    {/* Widget styling */}

                    <s-stack gap="base">
                        <s-grid
                            gridTemplateColumns="repeat(12, 1fr)"
                            gap="base"
                        >
                            <s-grid-item gridColumn="span 6" gridRow="span 2">
                                <s-color-field
                                    label="Background"
                                    name="boxBgColor"
                                    placeholder="Select a color"
                                    value={style.boxBgColor || "#ffffff"}
                                    onInput={(event: Event) => {
                                        const target =
                                            event.target as HTMLInputElement;
                                        updateStyle("boxBgColor", target.value);
                                    }}
                                />
                            </s-grid-item>
                            <s-grid-item gridColumn="span 6" gridRow="span 2">
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
                                <s-color-field
                                    label="Border color"
                                    name="boxBorderColor"
                                    placeholder="Select a color"
                                    value={style.boxBorderColor || "#e3e3e3"}
                                    onInput={(event: Event) => {
                                        const target =
                                            event.target as HTMLInputElement;
                                        updateStyle(
                                            "boxBorderColor",
                                            target.value,
                                        );
                                    }}
                                />
                            )}
                            <s-stack>
                                <s-text>Corner radius</s-text>
                                <RtpbRangeSlider
                                    values={style.boxRadius ?? 12}
                                    action={(val) =>
                                        updateStyle("widgetRadius", val)
                                    }
                                />
                            </s-stack>
                        </s-stack>
                    </s-stack>
                </s-stack>
            </div>
        </s-stack>
    );
}
