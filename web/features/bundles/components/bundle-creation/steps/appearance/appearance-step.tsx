import {
    WidgetDisplaySettings,
    WidgetAppearance,
    WidgetLayout,
    WidgetPosition,
} from "@/features/bundles";

export function AppearanceStep() {
    return (
        <s-stack gap="base">
            <WidgetLayout />
            <WidgetPosition />
            {/*<WidgetAppearance />*/}
            <WidgetDisplaySettings />
        </s-stack>
    );
}
