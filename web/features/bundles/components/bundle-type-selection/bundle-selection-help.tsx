"use client";

import { BUNDLE_HELP_ITEMS } from "@/features/bundles";
import { BlockStack, Card, Divider, Grid, Text } from "@shopify/polaris";

export function BundleSelectionHelp() {
    return (
        <Card>
            <BlockStack gap="400">
                <Text variant="headingMd" as="h3">
                    Need help choosing?
                </Text>

                <Text variant="bodySm" tone="subdued" as="p">
                    Not sure which bundle type is right for your products? Here
                    are some quick guidelines:
                </Text>

                <Divider />

                <Grid
                    columns={{
                        xs: 1,
                        sm: 2,
                        md: 2,
                        lg: 2,
                        xl: 2,
                    }}
                >
                    {BUNDLE_HELP_ITEMS.map((item, index) => (
                        <Grid.Cell key={index}>
                            <BlockStack gap="100">
                                <Text
                                    variant="bodyMd"
                                    fontWeight="medium"
                                    as="p"
                                >
                                    {item.title}
                                </Text>
                                <Text variant="bodySm" tone="subdued" as="p">
                                    {item.bundles}
                                </Text>
                            </BlockStack>
                        </Grid.Cell>
                    ))}
                </Grid>
            </BlockStack>
        </Card>
    );
}
