import { BlockStack } from "@shopify/polaris";
import {
    AdvancedOptions,
    StepHeading,
    WidgetAppearance,
    WidgetLayout,
    WidgetPosition,
} from "@/features/bundles";

export function DisplayStep() {
    return (
        <BlockStack gap="500">
            <StepHeading
                title="Display"
                description="Customize how your bundle appears to customers"
            />

            <WidgetLayout />
            <WidgetPosition />
            <WidgetAppearance />
            <AdvancedOptions />
        </BlockStack>
    );
}
