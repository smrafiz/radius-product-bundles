"use client";

import { useSettingsField } from "@/features/settings";

/**
 * Advanced settings component
 */
export function SettingsAdvanced() {
    const currencyFormat = useSettingsField({ name: "currencyFormat" });
    const customCssClass = useSettingsField({ name: "customCssClass" });
    const customCss = useSettingsField({ name: "customCss" });

    return (
        <s-stack gap="large">
            {/* Currency Section */}
            <s-section>
                <s-stack gap="base">
                    <s-stack
                        direction="inline"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <s-heading>Currency</s-heading>
                        <s-tooltip id="currency-tooltip">
                            <s-text>
                                Advanced currency formatting options.
                            </s-text>
                        </s-tooltip>
                        <s-icon
                            tone="neutral"
                            type="info"
                            interestFor="currency-tooltip"
                        />
                    </s-stack>

                    <s-text-field
                        label="Currency format"
                        name="currencyFormat"
                        placeholder=""
                        value={currencyFormat.value || ""}
                        onChange={currencyFormat.onShopifyChange}
                        details="Custom currency format. Use {{amount}}, {{amount_no_decimals}}, or {{currency_symbol}}. Leave blank to use store default."
                        error={currencyFormat.error}
                    />
                </s-stack>
            </s-section>

            {/* Custom CSS Section */}
            <s-section>
                <s-stack gap="base">
                    <s-stack
                        direction="inline"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <s-heading>Custom CSS</s-heading>
                        <s-tooltip id="custom-css-tooltip">
                            <s-text>
                                Add custom CSS for advanced styling. Only use if
                                you have CSS knowledge.
                            </s-text>
                        </s-tooltip>
                        <s-icon
                            tone="neutral"
                            type="info"
                            interestFor="custom-css-tooltip"
                        />
                    </s-stack>

                    <s-text-field
                        label="Custom CSS class"
                        name="customCssClass"
                        placeholder=""
                        value={customCssClass.value || ""}
                        onChange={customCssClass.onShopifyChange}
                        details="Add a custom class to the bundle widget container for targeted styling."
                        error={customCssClass.error}
                    />

                    <s-text-area
                        label="Custom CSS"
                        labelAccessibilityVisibility="exclusive"
                        name="customCss"
                        value={customCss.value || ""}
                        onChange={customCss.onShopifyChange}
                        rows={8}
                        placeholder=".radius-bundle { /* Your custom styles */ }"
                        details="Write custom CSS for unique visual customizations. Applied to all pages where the bundle widget loads."
                        error={customCss.error}
                    />
                </s-stack>
            </s-section>
        </s-stack>
    );
}
