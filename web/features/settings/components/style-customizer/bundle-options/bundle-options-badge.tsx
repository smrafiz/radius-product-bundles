"use client";

import { RefObject, useState } from "react";
import { RtpbRangeSlider } from "@/shared";
import { useCustomizer } from "@/features/settings/hooks/use-customizer";
import { CustomizerStyles } from "@/features/settings";

interface BundleOptionsBadgeProps {
    formRef?: RefObject<HTMLFormElement | null>;
}

/**
 * Badge style options for the customizer.
 *
 * Handles font size, colors, and border radius settings.
 */
export function BundleOptionsBadge({ formRef }: BundleOptionsBadgeProps) {
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
                                    variant={
                                        styles.badgeFontSize === 14
                                            ? "primary"
                                            : "secondary"
                                    }
                                    onClick={() =>
                                        handleStyleChange("badgeFontSize", 14)
                                    }
                                >
                                    Small
                                </s-button>
                                <s-button
                                    slot="secondary-actions"
                                    variant={
                                        styles.badgeFontSize === 16
                                            ? "primary"
                                            : "secondary"
                                    }
                                    onClick={() =>
                                        handleStyleChange("badgeFontSize", 16)
                                    }
                                >
                                    Medium
                                </s-button>
                                <s-button
                                    slot="secondary-actions"
                                    variant={
                                        styles.badgeFontSize === 18
                                            ? "primary"
                                            : "secondary"
                                    }
                                    onClick={() =>
                                        handleStyleChange("badgeFontSize", 18)
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
                            <s-grid-item gridColumn="span 6" gridRow="span 2">
                                <s-color-field
                                    label="Background"
                                    name="badgeBgColor"
                                    placeholder="Select a color"
                                    value={styles.badgeBgColor}
                                    onInput={(event: Event) => {
                                        const target =
                                            event.target as HTMLInputElement;
                                        handleStyleChange(
                                            "badgeBgColor",
                                            target.value,
                                        );
                                    }}
                                />
                            </s-grid-item>
                            <s-grid-item gridColumn="span 6" gridRow="span 2">
                                <s-color-field
                                    label="Text"
                                    name="badgeTextColor"
                                    placeholder="Select a color"
                                    value={styles.badgeTextColor}
                                    onInput={(event: Event) => {
                                        const target =
                                            event.target as HTMLInputElement;
                                        handleStyleChange(
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
                                values={styles.badgeRadius}
                                maxValue={30}
                                action={(val) =>
                                    handleStyleChange("badgeRadius", val)
                                }
                            />
                        </s-stack>
                    </s-stack>
                </s-stack>
            </div>
        </s-stack>
    );
}
