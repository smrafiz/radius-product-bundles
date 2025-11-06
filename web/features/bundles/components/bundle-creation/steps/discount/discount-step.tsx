import {
    BundleBehavior,
    DiscountSettings,
} from "@/features/bundles";
import { BlockStack } from "@shopify/polaris";

export function DiscountStep() {
    return (
        <BlockStack gap="500">
            <DiscountSettings />
            <BundleBehavior />
        </BlockStack>
    );
}
