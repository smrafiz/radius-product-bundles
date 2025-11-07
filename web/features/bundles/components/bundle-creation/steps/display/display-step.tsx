import {
    AdvancedOptions,
    WidgetAppearance,
    WidgetLayout,
    WidgetPosition,
} from "@/features/bundles";

export function DisplayStep() {
    return (
        <s-stack gap="base">
            <WidgetLayout />
            <WidgetPosition />
            <WidgetAppearance />
            <AdvancedOptions />
        </s-stack>
    );
}
