import {
    WidgetDisplaySettings,
    WidgetLayout,
    WidgetPosition,
} from "@/features/bundles";

export function AppearanceStep() {
    return (
        <s-stack gap="base">
            <WidgetLayout />
            <WidgetPosition />
            <WidgetDisplaySettings />
        </s-stack>
    );
}
