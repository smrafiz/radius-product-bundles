"use client";

import { useState } from "react";
import { RtpbRangeSlider } from "@/shared";
import { useBundleStore } from "@/features/bundles";

export function BundleOptionsButton() {
    const { displaySettings, updateDisplaySettings } = useBundleStore();
    const style = displaySettings.style ?? {};
    const [open, setOpen] = useState(false);

    const [activeTab, setActiveTab] = useState("normal");

    const tabs = [
        { id: "normal", label: "Normal" },
        { id: "hover", label: "Hover" },
    ];

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
                    <s-heading>Button</s-heading>
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
                            justifyContent="space-between"
                        >
                            <s-heading>Font size</s-heading>
                            <s-button-group gap="none">
                                <s-button
                                    slot="secondary-actions"
                                    onClick={() =>
                                        updateStyle("buttonFontSize", 14)
                                    }
                                >
                                    Small
                                </s-button>
                                <s-button
                                    slot="secondary-actions"
                                    onClick={() =>
                                        updateStyle("buttonFontSize", 16)
                                    }
                                >
                                    Medium
                                </s-button>
                                <s-button
                                    slot="secondary-actions"
                                    onClick={() =>
                                        updateStyle("buttonFontSize", 18)
                                    }
                                >
                                    Large
                                </s-button>
                            </s-button-group>
                        </s-stack>

                        <s-stack gap="base">
                            {/* Tab Navigation */}
                            <s-stack direction="inline">
                                <s-stack
                                    direction="inline"
                                    gap="none"
                                    border="base"
                                    borderRadius="base"
                                    padding="small-400"
                                    background="subdued"
                                >
                                    {tabs.map((tab) => (
                                        <s-button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            variant={
                                                activeTab === tab.id
                                                    ? "secondary"
                                                    : "tertiary"
                                            }
                                        >
                                            {tab.label}
                                        </s-button>
                                    ))}
                                </s-stack>
                            </s-stack>

                            {/* Tab Content */}
                            <s-box>
                                {activeTab === "normal" && (
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
                                                    style.buttonBgColor ||
                                                    "#333333"
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
                                )}

                                {activeTab === "hover" && (
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
                                                name="buttonHoverBgColor"
                                                placeholder="Select a color"
                                                value={
                                                    style.buttonHoverBgColor ||
                                                    "#666666"
                                                }
                                                onInput={(event: Event) => {
                                                    const target =
                                                        event.target as HTMLInputElement;
                                                    updateStyle(
                                                        "buttonHoverBgColor",
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
                                                name="buttonHoverTextColor"
                                                placeholder="Select a color"
                                                value={
                                                    style.buttonHoverTextColor ||
                                                    "#ffffff"
                                                }
                                                onInput={(event: Event) => {
                                                    const target =
                                                        event.target as HTMLInputElement;
                                                    updateStyle(
                                                        "buttonHoverTextColor",
                                                        target.value,
                                                    );
                                                }}
                                            />
                                        </s-grid-item>
                                    </s-grid>
                                )}
                            </s-box>
                        </s-stack>

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
                </s-stack>
            </div>
        </s-stack>
    );
}
