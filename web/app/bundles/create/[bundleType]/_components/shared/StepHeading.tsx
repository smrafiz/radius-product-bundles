import { BlockStack, Text } from "@shopify/polaris";

type Gap = "050" | "100" | "200" | "300" | "400" | "500";

interface Props {
    title: string;
    description?: string;
    gap?: Gap;
}

export default function StepHeading({
    title,
    description,
    gap = "200",
}: Props) {
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
