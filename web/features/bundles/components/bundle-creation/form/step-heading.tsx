import { BlockStack, Text } from "@shopify/polaris";
import { StepHeadingProps } from "@/features/bundles";

export function StepHeading({
    title,
    description,
    gap = "200",
}: StepHeadingProps) {
    return (
        <BlockStack gap={gap}>
            <Text as="h2" variant="headingLg">
                {title}
            </Text>
            {description && (
                <Text as="p" variant="bodySm" tone="subdued">
                    {description}
                </Text>
            )}
        </BlockStack>
    );
}
