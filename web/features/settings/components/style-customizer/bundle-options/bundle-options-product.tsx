"use client";

import { RefObject, useState } from "react";
import { RtpbRangeSlider } from "@/shared";
import { useCustomizer } from "@/features/settings/hooks/use-customizer";
import { CustomizerStyles } from "@/features/settings";

interface BundleOptionsProductProps {
    formRef?: RefObject<HTMLFormElement | null>;
}

/**
 * Product card style options for the customizer.
 *
 * Handles font size, colors, border, and radius settings.
 */
export function BundleOptionsProduct({ formRef }: BundleOptionsProductProps) {
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
                    <s-heading>Product</s-heading>
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
                        <s-heading>Font size</s-heading>
                        <s-button-group gap="none">
                            <s-button
                                slot="secondary-actions"
                                variant={
                                    styles.productFontSize === 14
                                        ? "primary"
                                        : "secondary"
                                }
                                onClick={() =>
                                    handleStyleChange("productFontSize", 14)
                                }
                            >
                                Small
                            </s-button>
                            <s-button
                                slot="secondary-actions"
                                variant={
                                    styles.productFontSize === 16
                                        ? "primary"
                                        : "secondary"
                                }
                                onClick={() =>
                                    handleStyleChange("productFontSize", 16)
                                }
                            >
                                Medium
                            </s-button>
                            <s-button
                                slot="secondary-actions"
                                variant={
                                    styles.productFontSize === 18
                                        ? "primary"
                                        : "secondary"
                                }
                                onClick={() =>
                                    handleStyleChange("productFontSize", 18)
                                }
                            >
                                Large
                            </s-button>
                        </s-button-group>
                    </s-stack>
                    {/* Product styling */}
                    <s-stack gap="base">
                        <s-grid
                            gridTemplateColumns="repeat(12, 1fr)"
                            gap="base"
                        >
                            <s-grid-item gridColumn="span 6" gridRow="span 1">
                                <s-color-field
                                    label="Background"
                                    name="productBgColor"
                                    placeholder="Select a color"
                                    value={styles.productBgColor}
                                    onInput={(event: Event) => {
                                        const target =
                                            event.target as HTMLInputElement;
                                        handleStyleChange(
                                            "productBgColor",
                                            target.value,
                                        );
                                    }}
                                />
                            </s-grid-item>
                            <s-grid-item gridColumn="span 6" gridRow="span 1">
                                <s-color-field
                                    label="Text"
                                    name="productTextColor"
                                    placeholder="Select a color"
                                    value={styles.productTextColor}
                                    onInput={(event: Event) => {
                                        const target =
                                            event.target as HTMLInputElement;
                                        handleStyleChange(
                                            "productTextColor",
                                            target.value,
                                        );
                                    }}
                                />
                            </s-grid-item>
                        </s-grid>
                    </s-stack>
                    <s-stack gap="base">
                        <s-color-field
                            label="Border color"
                            name="productBorderColor"
                            placeholder="Select a color"
                            value={styles.productBorderColor}
                            onInput={(event: Event) => {
                                const target = event.target as HTMLInputElement;
                                handleStyleChange(
                                    "productBorderColor",
                                    target.value,
                                );
                            }}
                        />
                        <s-stack>
                            <s-text>Corner radius</s-text>
                            <RtpbRangeSlider
                                values={styles.productRadius}
                                maxValue={30}
                                action={(val) =>
                                    handleStyleChange("productRadius", val)
                                }
                            />
                        </s-stack>
                    </s-stack>
                </s-stack>
            </div>
        </s-stack>
    );
}
