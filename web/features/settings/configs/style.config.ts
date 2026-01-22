import { SettingsTabConfig } from "@/features/settings";

/**
 * Style tab configuration
 */
export const STYLE_TAB: SettingsTabConfig = {
    id: "style",
    title: "Style",
    icon: "paint-brush-round",
    type: "style",
    sections: [
        {
            id: "style-customizer",
            title: "Style Customizer",
            tooltip:
                "Set global colors, typography, and styling for all bundle widgets.",
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
