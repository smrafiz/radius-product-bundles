"use client";

import { RefObject, useState } from "react";
import { useCustomizer } from "@/features/settings/hooks/use-customizer";
import { CustomizerStyles } from "@/features/settings";

interface BundleOptionsGeneralProps {
    formRef?: RefObject<HTMLFormElement | null>;
}

/**
 * General style options for the customizer.
 *
 * Handles primary, secondary, and text color settings.
 */
export function BundleOptionsGeneral({ formRef }: BundleOptionsGeneralProps) {
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
        // Trigger form input event for native save bar
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
                            <s-grid-item gridColumn="span 4" gridRow="span 2">
                                <s-color-field
                                    label="Primary"
                                    name="primaryColor"
                                    placeholder="Select a color"
                                    value={styles.primaryColor}
                                    onInput={(event: Event) => {
                                        const target =
                                            event.target as HTMLInputElement;
                                        handleStyleChange(
                                            "primaryColor",
                                            target.value,
                                        );
                                    }}
                                />
                            </s-grid-item>
                            <s-grid-item gridColumn="span 4" gridRow="span 2">
                                <s-color-field
                                    label="Secondary"
                                    name="secondaryColor"
                                    placeholder="Select a color"
                                    value={styles.secondaryColor}
                                    onInput={(event: Event) => {
                                        const target =
                                            event.target as HTMLInputElement;
                                        handleStyleChange(
                                            "secondaryColor",
                                            target.value,
                                        );
                                    }}
                                />
                            </s-grid-item>
                            <s-grid-item gridColumn="span 4" gridRow="span 2">
                                <s-color-field
                                    label="Text"
                                    name="textColor"
                                    placeholder="Select a color"
                                    value={styles.textColor}
                                    onInput={(event: Event) => {
                                        const target =
                                            event.target as HTMLInputElement;
                                        handleStyleChange(
                                            "textColor",
                                            target.value,
                                        );
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
