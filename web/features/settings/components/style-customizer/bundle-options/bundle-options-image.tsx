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
                        <s-stack gap="base" paddingBlockEnd="base">
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
                                <s-text>Size</s-text>
                                <RtpbRangeSlider
                                    values={style.imageSize ?? undefined}
                                    maxValue={300}
                                    action={(val) =>
                                        updateStyle("imageSize", val)
                                    }
                                />
                            </s-stack>
                            <s-stack
                                direction="inline"
                                alignItems="center"
                                gap="small-300"
                                justifyContent="space-between"
                            >
                                <s-heading>Image fit</s-heading>
                                <s-button-group gap="none">
                                    <s-button
                                        slot="secondary-actions"
                                        onClick={() =>
                                            updateStyle("imageFit", "cover")
                                        }
                                    >
                                        Cover
                                    </s-button>
                                    <s-button
                                        slot="secondary-actions"
                                        onClick={() =>
                                            updateStyle("imageFit", "contain")
                                        }
                                    >
                                        Contain
                                    </s-button>
                                    <s-button
                                        slot="secondary-actions"
                                        onClick={() =>
                                            updateStyle("imageFit", "fill")
                                        }
                                    >
                                        Fill
                                    </s-button>
                                </s-button-group>
                            </s-stack>
                        </s-stack>
                    </s-stack>
                </s-stack>
            </div>
        </s-stack>
    );
}
