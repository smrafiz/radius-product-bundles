"use client";

import {
    BlockStack,
    CalloutCard,
    Card,
    Divider,
    Grid,
    Layout,
    Page,
    Text,
} from "@shopify/polaris";
import { withLoader } from "@/utils";
import { useRouter } from "next/navigation";
import { bundleTypeConfigs } from "@/config";
import BundleTypeCard from "@/bundles/create/_components/BundleTypeCard";

export default function BundleTypeSelection() {
    const router = useRouter();

    const handleBack = () => {
        router.push("/bundles");
    };

    return (
        <Page
            title="Select bundle type"
            subtitle="Choose the type of bundle that best fits your offer"
            backAction={{
                content: "Bundles",
                onAction: withLoader(() => handleBack()),
            }}
        >
            <Layout>
                <Layout.Section>
                    <Grid columns={{ xs: 1, sm: 2, md: 3, lg: 3, xl: 3 }}>
                        {Object.values(bundleTypeConfigs).map((bundleType) => (
                            <BundleTypeCard
                                key={bundleType.id}
                                bundleType={bundleType}
                            />
                        ))}
                    </Grid>
                </Layout.Section>

                <Layout.Section>
                    <CalloutCard
                        title="Need some ideas?"
                        illustration="https://cdn.shopify.com/s/assets/admin/checkout/settings-customizecart-705f57c725ac05be5a34ec20c05b94298cb8afd10aac7bd9c7ad02030f48cfa0.svg"
                        primaryAction={{
                            content: "Show me some ideas",
                            onAction: withLoader(() =>
                                router.push("/bundle-studio"),
                            ),
                        }}
                    >
                        <p>
                            There are several ways to create bundles, we have
                            some suggestions for you to get started.
                        </p>
                    </CalloutCard>
                </Layout.Section>

                <Layout.Section>
                    <div className="pb-6">
                        <Card>
                            <BlockStack gap="400">
                                <Text variant="headingMd" as="h3">
                                    Need help choosing?
                                </Text>
                                <Text variant="bodySm" tone="subdued" as="p">
                                    Not sure which bundle type is right for your
                                    products? Here are some quick guidelines:
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
                                    <Grid.Cell>
                                        <BlockStack gap="100">
                                            <Text
                                                variant="bodyMd"
                                                fontWeight="medium"
                                                as="p"
                                            >
                                                For increasing order value:
                                            </Text>
                                            <Text
                                                variant="bodySm"
                                                tone="subdued"
                                                as="p"
                                            >
                                                Volume Discount, Fixed Bundle
                                            </Text>
                                        </BlockStack>
                                    </Grid.Cell>
                                    <Grid.Cell>
                                        <BlockStack gap="100">
                                            <Text
                                                variant="bodyMd"
                                                fontWeight="medium"
                                                as="p"
                                            >
                                                For product discovery:
                                            </Text>
                                            <Text
                                                variant="bodySm"
                                                tone="subdued"
                                                as="p"
                                            >
                                                Mix & Match, Frequently Bought
                                                Together
                                            </Text>
                                        </BlockStack>
                                    </Grid.Cell>
                                    <Grid.Cell>
                                        <BlockStack gap="100">
                                            <Text
                                                variant="bodyMd"
                                                fontWeight="medium"
                                                as="p"
                                            >
                                                For customer acquisition:
                                            </Text>
                                            <Text
                                                variant="bodySm"
                                                tone="subdued"
                                                as="p"
                                            >
                                                Buy X Get Y, Gift with Purchase
                                            </Text>
                                        </BlockStack>
                                    </Grid.Cell>
                                    <Grid.Cell>
                                        <BlockStack gap="100">
                                            <Text
                                                variant="bodyMd"
                                                fontWeight="medium"
                                                as="p"
                                            >
                                                For promotional campaigns:
                                            </Text>
                                            <Text
                                                variant="bodySm"
                                                tone="subdued"
                                                as="p"
                                            >
                                                Buy X Get Y, BOGO
                                            </Text>
                                        </BlockStack>
                                    </Grid.Cell>
                                </Grid>
                            </BlockStack>
                        </Card>
                    </div>
                </Layout.Section>
            </Layout>
        </Page>
    );
}
