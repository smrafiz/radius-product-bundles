"use client";

import { RefObject, useState } from "react";
import { RtpbRangeSlider } from "@/shared";
import { useCustomizer } from "@/features/settings/hooks/use-customizer";
import { CustomizerStyles } from "@/features/settings";

interface BundleOptionsImageProps {
    formRef?: RefObject<HTMLFormElement | null>;
}

/**
 * Image style options for the customizer.
 *
 * Handles corner radius, size, and fit settings.
 */
export function BundleOptionsImage({ formRef }: BundleOptionsImageProps) {
    const { styles, updateStyle } = useCustomizer();
    const [open, setOpen] = useState(false);

    /**
     * Updates style and triggers form change for save bar.
     */
    const handleStyleChange = <K extends keyof CustomizerStyles>(
        key: K,
        value: CustomizerStyles[K],
    ) => {
        updateStyle(key, value);
        formRef?.current?.dispatchEvent(new Event("input", { bubbles: true }));
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
                    <s-stack gap="base">
                        <s-stack gap="base" paddingBlockEnd="base">
                            <s-stack>
                                <s-text>Corner radius</s-text>
                                <RtpbRangeSlider
                                    values={styles.imageRadius}
                                    maxValue={100}
                                    action={(val) =>
                                        handleStyleChange("imageRadius", val)
                                    }
                                />
                            </s-stack>
                            <s-stack>
                                <s-text>Size</s-text>
                                <RtpbRangeSlider
                                    values={styles.imageSize}
                                    maxValue={300}
                                    action={(val) =>
                                        handleStyleChange("imageSize", val)
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
                                        variant={
                                            styles.imageFit === "cover"
                                                ? "primary"
                                                : "secondary"
                                        }
                                        onClick={() =>
                                            handleStyleChange(
                                                "imageFit",
                                                "cover",
                                            )
                                        }
                                    >
                                        Cover
                                    </s-button>
                                    <s-button
                                        slot="secondary-actions"
                                        variant={
                                            styles.imageFit === "contain"
                                                ? "primary"
                                                : "secondary"
                                        }
                                        onClick={() =>
                                            handleStyleChange(
                                                "imageFit",
                                                "contain",
                                            )
                                        }
                                    >
                                        Contain
                                    </s-button>
                                    <s-button
                                        slot="secondary-actions"
                                        variant={
                                            styles.imageFit === "fill"
                                                ? "primary"
                                                : "secondary"
                                        }
                                        onClick={() =>
                                            handleStyleChange(
                                                "imageFit",
                                                "fill",
                                            )
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
