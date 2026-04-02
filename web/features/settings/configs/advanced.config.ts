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
        // CUSTOM CSS SECTION
        // ─────────────────────────────────────────────────────────────────
        {
            id: "custom-css",
            title: "Custom CSS",
            tooltip:
                "Add custom CSS for advanced styling. Only use if you have CSS knowledge.",
            proFeature: "custom_css",
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
