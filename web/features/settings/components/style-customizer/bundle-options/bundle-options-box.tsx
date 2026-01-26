"use client";

import { RefObject, useState } from "react";
import { RtpbRangeSlider } from "@/shared";
import { useCustomizer } from "@/features/settings/hooks/use-customizer";
import { CustomizerStyles } from "@/features/settings";

interface BundleOptionsBoxProps {
    formRef?: RefObject<HTMLFormElement | null>;
}

/**
 * Box/container style options for the customizer.
 *
 * Handles max width, alignment, background, border, and radius settings.
 */
export function BundleOptionsBox({ formRef }: BundleOptionsBoxProps) {
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
                    <s-stack gap="base">
                        <s-stack
                            direction="inline"
                            alignItems="center"
                            gap="small-300"
                            justifyContent="space-between"
                        >
                            <s-heading>Maximum width</s-heading>
                            <s-stack>
                                <s-number-field
                                    label="Maximum width"
                                    labelAccessibilityVisibility="exclusive"
                                    placeholder="0"
                                    step={5}
                                    min={400}
                                    max={1200}
                                    value={String(styles.boxMaxWidth)}
                                    onInput={(event: Event) => {
                                        const target =
                                            event.target as HTMLInputElement;
                                        handleStyleChange(
                                            "boxMaxWidth",
                                            Number(target.value) || 500,
                                        );
                                    }}
                                />
                            </s-stack>
                        </s-stack>

                        <s-stack
                            direction="inline"
                            alignItems="center"
                            gap="small-300"
                            justifyContent="space-between"
                        >
                            <s-heading>Box alignment</s-heading>
                            <s-button-group gap="none">
                                <s-button
                                    slot="secondary-actions"
                                    variant={
                                        styles.boxAlignment === "left"
                                            ? "primary"
                                            : "secondary"
                                    }
                                    onClick={() =>
                                        handleStyleChange(
                                            "boxAlignment",
                                            "left",
                                        )
                                    }
                                >
                                    Left
                                </s-button>
                                <s-button
                                    slot="secondary-actions"
                                    variant={
                                        styles.boxAlignment === "center"
                                            ? "primary"
                                            : "secondary"
                                    }
                                    onClick={() =>
                                        handleStyleChange(
                                            "boxAlignment",
                                            "center",
                                        )
                                    }
                                >
                                    Center
                                </s-button>
                                <s-button
                                    slot="secondary-actions"
                                    variant={
                                        styles.boxAlignment === "right"
                                            ? "primary"
                                            : "secondary"
                                    }
                                    onClick={() =>
                                        handleStyleChange(
                                            "boxAlignment",
                                            "right",
                                        )
                                    }
                                >
                                    Right
                                </s-button>
                            </s-button-group>
                        </s-stack>

                        <s-grid
                            gridTemplateColumns="repeat(12, 1fr)"
                            gap="base"
                        >
                            <s-grid-item gridColumn="span 6" gridRow="span 2">
                                <s-color-field
                                    label="Background"
                                    name="boxBgColor"
                                    placeholder="Select a color"
                                    value={styles.boxBgColor}
                                    onInput={(event: Event) => {
                                        const target =
                                            event.target as HTMLInputElement;
                                        handleStyleChange(
                                            "boxBgColor",
                                            target.value,
                                        );
                                    }}
                                />
                            </s-grid-item>
                            <s-grid-item gridColumn="span 6" gridRow="span 2">
                                <s-color-field
                                    label="Border"
                                    name="boxBorderColor"
                                    placeholder="Select a color"
                                    value={styles.boxBorderColor}
                                    onInput={(event: Event) => {
                                        const target =
                                            event.target as HTMLInputElement;
                                        handleStyleChange(
                                            "boxBorderColor",
                                            target.value,
                                        );
                                    }}
                                />
                            </s-grid-item>
                        </s-grid>
                        <s-stack gap="base" paddingBlockEnd="base">
                            <s-stack gap="small-400">
                                <s-text>Border width</s-text>
                                <RtpbRangeSlider
                                    values={styles.boxBorderWidth}
                                    maxValue={5}
                                    action={(val) =>
                                        handleStyleChange("boxBorderWidth", val)
                                    }
                                />
                            </s-stack>
                            <s-stack>
                                <s-text>Corner radius</s-text>
                                <RtpbRangeSlider
                                    values={styles.boxRadius}
                                    maxValue={30}
                                    action={(val) =>
                                        handleStyleChange("boxRadius", val)
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
