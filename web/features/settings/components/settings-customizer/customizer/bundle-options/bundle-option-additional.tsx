"use client";

import { useState } from "react";
import { RtpbRangeSlider } from "@/shared";
import { useBundleStore } from "@/features/bundles";

export function BundleOptionsAdditional() {
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

    interface ChoiceListElement extends HTMLElement {
        values: string[];
    }

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
                    <s-heading>Additional</s-heading>
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
                        <s-text>Title font size</s-text>
                        <s-button-group gap="none">
                            <s-button
                                slot="secondary-actions"
                                onClick={() =>
                                    updateStyle("titleFontSize", 18)
                                }
                            >
                                Small
                            </s-button>
                            <s-button
                                slot="secondary-actions"
                                onClick={() =>
                                    updateStyle("titleFontSize", 20)
                                }
                            >
                                Medium
                            </s-button>
                            <s-button
                                slot="secondary-actions"
                                onClick={() =>
                                    updateStyle("titleFontSize", 22)
                                }
                            >
                                Large
                            </s-button>
                        </s-button-group>
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
                </s-stack>
            </div>
        </s-stack>
    );
}
