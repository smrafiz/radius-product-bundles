import {
    AdvancedOptions,
    WidgetAppearance,
    WidgetLayout,
    WidgetPosition,
} from "@/features/bundles";
import { BlockStack } from "@shopify/polaris";

export function DisplayStep() {
    return (
        <BlockStack gap="500">
            <WidgetLayout />
            <WidgetPosition />
            <WidgetAppearance />
            <AdvancedOptions />
        </BlockStack>
    );
}
