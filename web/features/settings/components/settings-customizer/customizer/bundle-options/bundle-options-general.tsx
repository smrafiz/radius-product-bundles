"use client";

import { useState } from "react";
import { useBundleStore } from "@/features/bundles";

export function BundleOptionsGeneral() {
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
                    <s-heading>General</s-heading>
                    <s-icon type={open ? "chevron-up" : "chevron-down"} />
                </s-stack>
            </div>

            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out
                         ${open ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}
                    `}
            >
                <s-stack gap="base" padding="base">
                    <s-stack gap="base">
                        <s-grid
                            gridTemplateColumns="repeat(12, 1fr)"
                            gap="base"
                        >
                            <s-grid-item
                                gridColumn="span 4"
                                gridRow="span 2"
                            >
                                <s-color-field
                                    label="Primary"
                                    name="primaryColor"
                                    placeholder="Select a color"
                                    value={style.primaryColor || "#303030"}
                                    onInput={(event: Event) => {
                                        const target =
                                            event.target as HTMLInputElement;
                                        updateStyle("primaryColor", target.value);
                                    }}
                                />
                            </s-grid-item>
                            <s-grid-item
                                gridColumn="span 4"
                                gridRow="span 2"
                            >
                                <s-color-field
                                    label="Secondary"
                                    name="secondaryColor"
                                    placeholder="Select a color"
                                    value={
                                        style.secondaryColor || "#666666"
                                    }
                                    onInput={(event: Event) => {
                                        const target =
                                            event.target as HTMLInputElement;
                                        updateStyle(
                                            "secondaryColor",
                                            target.value,
                                        );
                                    }}
                                />
                            </s-grid-item>
                            <s-grid-item
                                gridColumn="span 4"
                                gridRow="span 2"
                            >
                                <s-color-field
                                    label="Text"
                                    name="textColor"
                                    placeholder="Select a color"
                                    value={style.textColor || "#333333"}
                                    onInput={(event: Event) => {
                                        const target =
                                            event.target as HTMLInputElement;
                                        updateStyle("textColor", target.value);
                                    }}
                                />
                            </s-grid-item>
                        </s-grid>
                    </s-stack>
                </s-stack>
            </div>
        </s-stack>
    );
}
