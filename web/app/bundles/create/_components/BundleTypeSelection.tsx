"use client";

import {
    Badge,
    Button,
    Card,
    Layout,
    Page,
    Text,
    Grid,
    Box,
    Divider,
    InlineStack,
    BlockStack,
    CalloutCard,
} from "@shopify/polaris";
import React from "react";
import { withLoader } from "@/utils";
import type { BundleType } from "@/types";
import { useRouter } from "next/navigation";

interface BundleTypeConfig {
    id: BundleType;
    title: string;
    description: string;
    features: string[];
    icon: string;
    badge?: {
        text: string;
        tone: "success" | "warning" | "info" | "critical";
    };
    popular?: boolean;
}

const bundleTypesConfig: BundleTypeConfig[] = [
    {
        id: "FIXED_BUNDLE",
        title: "Fixed Bundle",
        description: "Bundle products together at a fixed price with discount",
        features: [
            "Fixed bundle price",
            "Multiple products",
            "Set discount amount",
        ],
        icon: "📦",
    },
    {
        id: "VOLUME_DISCOUNT",
        title: "Volume Discount",
        description: "Offer discounts based on quantity purchased",
        features: [
            "Buy 2 Save 10%",
            "Buy 5 Save 20%",
            "Automatic tier detection",
        ],
        icon: "📊",
    },
    {
        id: "MIX_MATCH",
        title: "Mix & Match",
        description: "Choose any combination from selected products",
        features: [
            "Pick any 3 for $50",
            "Mix different categories",
            "Flexible combinations",
        ],
        icon: "🔀",
    },
    {
        id: "BUY_X_GET_Y",
        title: "Buy X Get Y",
        description:
            "Customer buys X items and gets Y items free or discounted",
        features: [
            "Buy 2 Get 1 Free",
            "Buy 3 Get 2nd 50% Off",
            "Flexible quantity rules",
        ],
        icon: "🎁",
    },
    {
        id: "BOGO",
        title: "BOGO (Buy One Get One)",
        description:
            "Classic buy one get one offer with various discount options",
        features: [
            "Buy 1 Get 1 Free",
            "Buy 1 Get 1 50% Off",
            "Same or different products",
        ],
        icon: "🔄",
    },
    {
        id: "CROSS_SELL",
        title: "Frequently Bought Together",
        description: "Show products that are commonly purchased together",
        features: [
            "Smart product suggestions",
            "AI-powered recommendations",
            "Increase order value",
        ],
        icon: "🤝",
        badge: { text: "AI", tone: "success" },
    },
];

export default function BundleTypeSelection() {
    const router = useRouter();

    const handleBundleTypeSelect = (bundleType: BundleType) => {
        const urlType = bundleType
            .toLowerCase()
            .replace(/_/g, "-")
            .replace(/\s+/g, "-");
        console.log(bundleType);
        router.push(`/bundles/create/${urlType}`);
    };

    const handleBack = () => {
        router.push("/bundles");
    };

    const renderBundleTypeCard = (bundleType: BundleTypeConfig) => (
        <Grid.Cell key={bundleType.id + bundleType.title}>
            <Card>
                <BlockStack gap="400">
                    <InlineStack align="space-between" blockAlign="start">
                        <Box />
                        {bundleType.popular && (
                            <Badge tone="success">Popular</Badge>
                        )}
                    </InlineStack>

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

                    <BlockStack gap="300">
                        <InlineStack
                            gap="200"
                            align="space-between"
                            blockAlign="center"
                        >
                            <Text variant="headingMd" as="h3">
                                {bundleType.title}
                            </Text>
                            {bundleType.badge && (
                                <Badge tone={bundleType.badge.tone}>
                                    {bundleType.badge.text}
                                </Badge>
                            )}
                        </InlineStack>

                        <Text variant="bodySm" tone="subdued" as="p">
                            {bundleType.description}
                        </Text>

                        <BlockStack gap="150">
                            {bundleType.features.map((feature, index) => (
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
                        variant={bundleType.popular ? "primary" : "secondary"}
                        onClick={withLoader(() =>
                            handleBundleTypeSelect(bundleType.id),
                        )}
                    >
                        Select
                    </Button>
                </BlockStack>
            </Card>
        </Grid.Cell>
    );

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
                        {bundleTypesConfig.map(renderBundleTypeCard)}
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
                                                Gift with Purchase, Buy X Get Y
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
