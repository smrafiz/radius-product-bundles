import { FeatureContext, SettingsTabNavInfo } from "@/features/settings";
import { SETTINGS_TAB_NAV } from "@/features/settings/constants/settings.constants";

export function useSettingsTabs(ctx: FeatureContext): SettingsTabNavInfo[] {
    return SETTINGS_TAB_NAV.filter((tab) =>
        tab.visible ? tab.visible(ctx) : true,
    );
}
