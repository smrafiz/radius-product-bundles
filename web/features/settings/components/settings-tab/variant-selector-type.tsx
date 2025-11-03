"use client";

import { CallbackEvent } from "@shopify/polaris-types";
import { useState } from "react";

export function SettingsVariantSelectorType() {
    const [variantType, setVariantType] = useState<"dropdown" | "swatches">("dropdown");

    const handleChange = (event: CallbackEvent<"s-choice-list">) => {
        const selectedValue = event.currentTarget.values?.[0] as "dropdown" | "swatches";
        if (selectedValue) {
            setVariantType(selectedValue);
        }
    };

    return (
        <s-section heading="Variant Selector Type">
            <s-paragraph>
                Select the type of variant selector shown to customers in the bundle.
            </s-paragraph>

            <s-choice-list name="button_action" onChange={handleChange}>
                <s-choice value="dropdown" selected={variantType === "dropdown"}>
                    Dropdown
                </s-choice>
                <s-choice value="swatches" selected={variantType === "swatches"}>
                    Swatches
                </s-choice>
            </s-choice-list>

            {variantType === "swatches" && (
                <s-stack
                    paddingBlockStart="small"
                    paddingInlineStart="large"
                    gap="small"
                >
                    <s-paragraph>
                        Option values with a color show as color swatches, with an image as
                        image swatches, and without either as text.
                    </s-paragraph>
                    <s-button icon="variant">Set swatches</s-button>
                </s-stack>
            )}
        </s-section>
    );
}
