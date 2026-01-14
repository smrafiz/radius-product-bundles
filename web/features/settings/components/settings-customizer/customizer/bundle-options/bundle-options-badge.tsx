"use client";

import { useState } from "react";
import { RtpbRangeSlider } from "@/shared";
import { useBundleStore } from "@/features/bundles";

export function BundleOptionsBadge() {
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
                    <s-heading>Badge</s-heading>
                    <s-icon type={open ? "chevron-up" : "chevron-down"} />
                </s-stack>
            </div>

            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out
                         ${open ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}
                    `}
            >
                <s-stack gap="base" padding="base">
                    {/* Add to cart button styling */}
                    <s-stack gap="base">
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
                                        updateStyle("badgeFontSize", 14)
                                    }
                                >
                                    Small
                                </s-button>
                                <s-button
                                    slot="secondary-actions"
                                    onClick={() =>
                                        updateStyle("badgeFontSize", 16)
                                    }
                                >
                                    Medium
                                </s-button>
                                <s-button
                                    slot="secondary-actions"
                                    onClick={() =>
                                        updateStyle("badgeFontSize", 18)
                                    }
                                >
                                    Large
                                </s-button>
                            </s-button-group>
                        </s-stack>
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
                                    name="badgeBgColor"
                                    placeholder="Select a color"
                                    value={style.badgeBgColor || "#303030"}
                                    onInput={(event: Event) => {
                                        const target =
                                            event.target as HTMLInputElement;
                                        updateStyle(
                                            "badgeBgColor",
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
                                    name="badgeTextColor"
                                    placeholder="Select a color"
                                    value={
                                        style.badgeTextColor || "#ffffff"
                                    }
                                    onInput={(event: Event) => {
                                        const target =
                                            event.target as HTMLInputElement;
                                        updateStyle(
                                            "badgeTextColor",
                                            target.value,
                                        );
                                    }}
                                />
                            </s-grid-item>
                        </s-grid>
                        <s-stack>
                            <s-text>Corner radius</s-text>
                            <RtpbRangeSlider
                                values={style.badgeRadius ?? 8}
                                maxValue={30}
                                action={(val) =>
                                    updateStyle("badgeRadius", val)
                                }
                            />
                        </s-stack>
                    </s-stack>
                </s-stack>
            </div>
        </s-stack>
    );
}
