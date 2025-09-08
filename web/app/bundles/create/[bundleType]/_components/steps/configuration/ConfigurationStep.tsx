import { BlockStack } from "@shopify/polaris";
import {
    BundleBehavior,
    BundleDetails,
    DiscountSettings,
} from "@/bundles/create/[bundleType]/_components/steps/configuration";
import { StepHeading } from "@/bundles/create/[bundleType]/_components/shared";

export default function ConfigurationStep() {
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
