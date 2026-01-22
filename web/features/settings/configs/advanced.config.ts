import { SettingsTabConfig } from "@/features/settings";

/**
 * Advanced tab configuration
 */
export const ADVANCED_TAB: SettingsTabConfig = {
    id: "advanced",
    title: "Advanced",
    icon: "dns-settings",
    sections: [
        // ─────────────────────────────────────────────────────────────────
        // CURRENCY SECTION
        // ─────────────────────────────────────────────────────────────────
        {
            id: "currency",
            title: "Currency",
            tooltip: "Advanced currency formatting options.",
            fields: [
                {
                    type: "text",
                    name: "currencyFormat",
                    label: "Currency format",
                    placeholder: "",
                    details:
                        "Custom currency format. Use {{amount}}, {{amount_no_decimals}}, or {{currency_symbol}}. Leave blank to use store default.",
                    defaultValue: "",
                    validation: {
                        maxLength: {
                            value: 50,
                            message:
                                "Currency format cannot exceed 50 characters",
                        },
                    },
                },
            ],
        },

        // ─────────────────────────────────────────────────────────────────
        // CUSTOM CSS SECTION
        // ─────────────────────────────────────────────────────────────────
        {
            id: "custom-css",
            title: "Custom CSS",
            tooltip:
                "Add custom CSS for advanced styling. Only use if you have CSS knowledge.",
            fields: [
                {
                    type: "text",
                    name: "customCssClass",
                    label: "Custom CSS class",
                    placeholder: "",
                    details:
                        "Add a custom class to the bundle widget container for targeted styling.",
                    defaultValue: "",
                    validation: {
                        maxLength: {
                            value: 100,
                            message:
                                "Custom CSS class cannot exceed 100 characters",
                        },
                    },
                },
                {
                    type: "textarea",
                    name: "customCss",
                    label: "Custom CSS",
                    placeholder: ".radius-bundle { /* Your custom styles */ }",
                    details:
                        "Write custom CSS for unique visual customizations. Applied to all pages where the bundle widget loads.",
                    rows: 8,
                    defaultValue: "",
                    validation: {
                        maxLength: {
                            value: 10000,
                            message:
                                "Custom CSS cannot exceed 10,000 characters",
                        },
                    },
                },
            ],
        },
    ],
};
