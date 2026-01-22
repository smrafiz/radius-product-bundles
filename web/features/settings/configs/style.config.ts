import { SettingsTabConfig } from "@/features/settings";

/**
 * Style tab configuration
 */
export const STYLE_TAB: SettingsTabConfig = {
    id: "style",
    title: "Style",
    icon: "paint-brush-round",
    sections: [
        {
            id: "style-customizer",
            title: "Style Customizer",
            tooltip:
                "Set global colors, typography, and styling for all bundle widgets.",
            description:
                "Customize colors, typography, buttons, badges, and more. These styles apply to all bundle widgets and can be overridden per-page in the Theme Editor.",
            fields: [
                {
                    type: "custom",
                    name: "globalStyles",
                    label: "Style Customizer",
                    component: "CustomizerModal",
                },
            ],
        },
    ],
};
