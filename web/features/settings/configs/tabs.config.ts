import { STYLE_TAB } from "./style.config";
import { TOOLS_TAB } from "./tools.config";
import { LABELS_TAB } from "./labels.config";
import { GENERAL_TAB } from "./general.config";
import { ADVANCED_TAB } from "./advanced.config";
import { SettingsTabConfig } from "@/features/settings";

/**
 * All settings tabs configuration
 */
export const SETTINGS_TABS: SettingsTabConfig[] = [
    GENERAL_TAB,
    STYLE_TAB,
    LABELS_TAB,
    ADVANCED_TAB,
    TOOLS_TAB,
];
