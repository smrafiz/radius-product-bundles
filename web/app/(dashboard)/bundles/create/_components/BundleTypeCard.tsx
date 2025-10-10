import {
    Badge,
    BlockStack,
    Box,
    Button,
    Card,
    Grid,
    InlineStack,
    Text,
} from "@shopify/polaris";
import { withLoader } from "@/utils";
import type { BundleConfig } from "@/types";
import { useRouter } from "next/navigation";

interface Props {
    bundleType: BundleConfig;
}

export default function BundleTypeCard({ bundleType }: Props) {
    const router = useRouter();

    const handleSelect = () => {
        const urlType = bundleType.slug;
        router.push(`/bundles/create/${urlType}`);
    };

    return (
        <Grid.Cell key={bundleType.id + bundleType.label}>
            <Card>
                <BlockStack gap="400">
                    <InlineStack align="space-between" blockAlign="start">
                        <Box />
                        {bundleType.badge && (
                            <Badge tone={bundleType.badge.tone}>
                                {bundleType.badge.text}
                            </Badge>
                        )}
                    </InlineStack>

                    <Box
                        padding="800"
                        background="bg-surface-secondary"
                        borderRadius="200"
                    >
                        <InlineStack align="center">
                            {bundleType.icon && (
                                <Box
                                    padding="800"
                                    background="bg-surface-secondary"
                                    borderRadius="200"
                                >
                                    <InlineStack align="center">
                                        <Text variant="heading2xl" as="span">
                                            {bundleType.icon}
                                        </Text>
                                    </InlineStack>
                                </Box>
                            )}
                        </InlineStack>
                    </Box>

                    <BlockStack gap="300">
                        <Text variant="headingMd" as="h3">
                            {bundleType.label}
                        </Text>
                        <Text variant="bodySm" tone="subdued" as="p">
                            {bundleType.description}
                        </Text>

                        <BlockStack gap="150">
                            {bundleType.features?.map((feature, index) => (
                                <InlineStack
                                    key={index}
                                    gap="200"
                                    blockAlign="start"
                                >
                                    <Box
                                        background="bg-fill-success"
                                        borderRadius="full"
                                        minWidth="6px"
                                        minHeight="6px"
                                        padding="025"
                                    />
                                    <Text
                                        variant="bodySm"
                                        tone="subdued"
                                        as="p"
                                    >
                                        {feature}
                                    </Text>
                                </InlineStack>
                            ))}
                        </BlockStack>
                    </BlockStack>

                    <Button
                        fullWidth
                        variant="secondary"
                        onClick={withLoader(() => handleSelect())}
                    >
                        Select
                    </Button>
                </BlockStack>
            </Card>
        </Grid.Cell>
    );
}
