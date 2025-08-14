"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
    Badge,
    BlockStack,
    Box,
    Button,
    CalloutCard,
    Card,
    Divider,
    Grid,
    InlineStack,
    Layout,
    Page,
    Text,
} from "@shopify/polaris";
import type { BundleType } from "@/types";
import { InfoIcon } from "@shopify/polaris-icons";

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
        popular: true,
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
        popular: true,
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
        popular: true,
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
        const urlType = bundleType.toLowerCase().replace("_", "-");
        router.push(`/bundles/create/${urlType}`);
    };

    const handleBack = () => {
        router.push("/bundles");
    };

    const renderBundleTypeCard = (bundleType: BundleTypeConfig) => (
        <Grid.Cell key={bundleType.id}>
            <Card>
                <BlockStack gap="400">
                    {/* Bundle Type Illustration */}
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

                    {/* Bundle Type Info */}
                    <BlockStack gap="300">
                        {/* Title and Badge */}
                        <InlineStack
                            gap="200"
                            align="space-between"
                            blockAlign="center"
                        >
                            <Text variant="headingMd" as="h3">
                                {bundleType.title}
                            </Text>
                            <InlineStack gap="200">
                                {bundleType.badge && (
                                    <Badge tone={bundleType.badge.tone}>
                                        {bundleType.badge.text}
                                    </Badge>
                                )}
                                <Button
                                    variant="plain"
                                    icon={InfoIcon}
                                    size="micro"
                                />
                            </InlineStack>
                        </InlineStack>

                        {/* Description */}
                        <Text variant="bodySm" tone="subdued" as="p">
                            {bundleType.description}
                        </Text>

                        {/* Features List */}
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

                    {/* Select Button */}
                    <Button
                        fullWidth
                        variant={bundleType.popular ? "primary" : "secondary"}
                        onClick={() => handleBundleTypeSelect(bundleType.id)}
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
                onAction: handleBack,
            }}
        >
            <Layout>
                {/* Bundle Types Section */}
                <Layout.Section>
                    {/* 3-Column Responsive Grid */}
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
                            url: "/bundle-studio",
                        }}
                    >
                        <p>
                            There are several ways to create bundles, we have
                            some suggestions for you to get started.
                        </p>
                    </CalloutCard>
                </Layout.Section>

                {/* Help Section */}
                <Layout.Section>
                    <div className="pb-6">
                        <Card>
                            <BlockStack gap="400">
                                <BlockStack gap="200">
                                    <InlineStack gap="200" blockAlign="center">
                                        <Button
                                            variant="plain"
                                            icon={InfoIcon}
                                            size="micro"
                                        />
                                        <Text variant="headingMd" as="h3">
                                            Need help choosing?
                                        </Text>
                                    </InlineStack>

                                    <Text
                                        variant="bodySm"
                                        tone="subdued"
                                        as="p"
                                    >
                                        Not sure which bundle type is right for
                                        your products? Here are some quick
                                        guidelines:
                                    </Text>
                                </BlockStack>

                                <Divider />

                                {/* Guidelines in 2x2 Grid */}
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
                                                Volume Discounts, Cross Sell
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
                                                For clearing inventory:
                                            </Text>
                                            <Text
                                                variant="bodySm"
                                                tone="subdued"
                                                as="p"
                                            >
                                                BOGO, Flash Sale
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
                                                Mix & Match, Gift Bundles
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
                                                Buy X Get Y, Tiered
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
