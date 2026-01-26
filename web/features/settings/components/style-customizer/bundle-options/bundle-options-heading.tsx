"use client";

import { RefObject, useState } from "react";
import { useCustomizer } from "@/features/settings/hooks/use-customizer";
import { CustomizerStyles } from "@/features/settings";

interface BundleOptionsHeadingProps {
    formRef?: RefObject<HTMLFormElement | null>;
}

/**
 * Heading style options for the customizer.
 *
 * Handles font size, color, and text transform settings.
 */
export function BundleOptionsHeading({ formRef }: BundleOptionsHeadingProps) {
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
                    <s-heading>Heading</s-heading>
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
                        justifyContent="space-between"
                    >
                        <s-text>Font size</s-text>
                        <s-button-group gap="none">
                            <s-button
                                slot="secondary-actions"
                                variant={
                                    styles.headingFontSize === 18
                                        ? "primary"
                                        : "secondary"
                                }
                                onClick={() =>
                                    handleStyleChange("headingFontSize", 18)
                                }
                            >
                                Small
                            </s-button>
                            <s-button
                                slot="secondary-actions"
                                variant={
                                    styles.headingFontSize === 20
                                        ? "primary"
                                        : "secondary"
                                }
                                onClick={() =>
                                    handleStyleChange("headingFontSize", 20)
                                }
                            >
                                Medium
                            </s-button>
                            <s-button
                                slot="secondary-actions"
                                variant={
                                    styles.headingFontSize === 22
                                        ? "primary"
                                        : "secondary"
                                }
                                onClick={() =>
                                    handleStyleChange("headingFontSize", 22)
                                }
                            >
                                Large
                            </s-button>
                        </s-button-group>
                    </s-stack>
                    <s-stack>
                        <s-color-field
                            label="Text"
                            name="headingColor"
                            placeholder="Select a color"
                            value={styles.headingColor}
                            onInput={(event: Event) => {
                                const target = event.target as HTMLInputElement;
                                handleStyleChange("headingColor", target.value);
                            }}
                        />
                    </s-stack>
                    <s-stack
                        direction="inline"
                        alignItems="center"
                        gap="small-300"
                        justifyContent="space-between"
                    >
                        <s-text>Transform</s-text>
                        <s-stack>
                            <s-select
                                label="Transform"
                                labelAccessibilityVisibility="exclusive"
                                value={styles.headingTransform}
                                onInput={(event: Event) => {
                                    const value = (
                                        event.target as HTMLSelectElement
                                    ).value as
                                        | "none"
                                        | "uppercase"
                                        | "capitalize";
                                    handleStyleChange(
                                        "headingTransform",
                                        value,
                                    );
                                }}
                            >
                                <s-option value="none">None</s-option>
                                <s-option value="uppercase">Uppercase</s-option>
                                <s-option value="capitalize">
                                    Capitalize
                                </s-option>
                            </s-select>
                        </s-stack>
                    </s-stack>
                </s-stack>
            </div>
        </s-stack>
    );
}
