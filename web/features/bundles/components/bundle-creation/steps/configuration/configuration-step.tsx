import {
    BundleBehavior,
    BundleDetails,
    DiscountSettings,
    StepHeading,
} from "@/features/bundles";
import { BlockStack } from "@shopify/polaris";

export function ConfigurationStep() {
    return (
        <BlockStack gap="500">
            <StepHeading
                title="Configuration"
                description="Set up discount rules and bundle behavior"
            />

            <BundleDetails />
            <DiscountSettings />
            <BundleBehavior />
        </BlockStack>
    );
}
