import { BlockStack } from "@shopify/polaris";
import {
    AdvancedOptions,
    WidgetAppearance,
    WidgetLayout,
    WidgetPosition,
} from "@/bundles/create/[bundleType]/_components/steps/display";
import { StepHeading } from "@/bundles/create/[bundleType]/_components/shared";

export default function DisplayStep() {
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
