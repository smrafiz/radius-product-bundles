"use client";

import { useState } from "react";
import { CallbackEvent } from "@shopify/polaris-types";

export function SettingsVariantSelectorType() {
    const [loading, setLoading] = useState(false);
    const [variantType, setVariantType] = useState<"dropdown" | "swatches">(
        "dropdown",
    );

    const handleChange = (event: CallbackEvent<"s-choice-list">) => {
        const selectedValue = event.currentTarget.values?.[0] as
            | "dropdown"
            | "swatches";
        if (selectedValue) {
            setVariantType(selectedValue);
        }
    };

    const handleApply = async () => {
        setLoading(true);

        try {
            await new Promise((resolve) => setTimeout(resolve, 800));
        } finally {
            setLoading(false);
            document
                .querySelector("#modal")
                ?.dispatchEvent(new CustomEvent("--hide", { bubbles: true }));
        }
    };

    return (
        <s-section>
            <s-stack gap="small">
                <s-heading>
                    <div className="text-base">Variant selector type</div>
                </s-heading>

                <s-divider />

                <s-paragraph>
                    Select the type of variant selector shown to customers in
                    the bundle.
                </s-paragraph>

                <s-banner>
                    Changes to the variant selector type will apply to all
                    bundles in your store.
                </s-banner>

                <s-choice-list
                    labelAccessibilityVisibility="exclusive"
                    label="Variant type"
                    name="button_action"
                    onChange={handleChange}
                >
                    <s-choice
                        value="dropdown"
                        selected={variantType === "dropdown"}
                    >
                        Dropdown
                    </s-choice>
                    <s-choice
                        value="swatches"
                        selected={variantType === "swatches"}
                    >
                        Swatches
                    </s-choice>
                </s-choice-list>

                {variantType === "swatches" && (
                    <s-stack paddingInlineStart="large" gap="small">
                        <s-paragraph>
                            Option values with a color show as color swatches,
                            with an image as image swatches, and without either
                            as text.
                        </s-paragraph>
                        <>
                            <s-button commandFor="modal" icon="variant">
                                Set swatches
                            </s-button>
                            <s-modal id="modal" heading="Swatch editor">
                                <s-paragraph>
                                    Displaying more details here.
                                </s-paragraph>

                                <s-button
                                    slot="secondary-actions"
                                    commandFor="modal"
                                    command="--hide"
                                >
                                    Close
                                </s-button>
                                <s-button
                                    slot="primary-action"
                                    variant="primary"
                                    loading={loading}
                                    disabled={loading}
                                    onClick={handleApply}
                                >
                                    {loading ? "Applying..." : "Apply changes"}
                                </s-button>
                            </s-modal>
                        </>
                    </s-stack>
                )}
            </s-stack>
        </s-section>
    );
}
