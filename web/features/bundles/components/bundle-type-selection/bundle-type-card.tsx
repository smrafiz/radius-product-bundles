"use client";

import {
    Badge,
    BlockStack,
    Box,
    Button,
    Card,
    InlineStack,
    Text,
} from "@shopify/polaris";
import { useState } from "react";
import type { BundleConfig } from "@/features/bundles";
import { useAppNavigation, withLoader } from "@/shared";

export function BundleTypeCard({ bundleType }: { bundleType: BundleConfig }) {
    const { bundleData } = useAppNavigation();

    const [isSelecting, setIsSelecting] = useState(false);

    const handleSelect = async () => {
        setIsSelecting(true);

        try {
            const navigate = bundleData.create(bundleType.slug);
            navigate();
        } catch (error) {
            console.error("Navigation error:", error);
            setIsSelecting(false);
        }
    };

    return (
        <Card>
            <BlockStack gap="400">
                {/* Badge Section */}
                <InlineStack align="space-between" blockAlign="start">
                    <Box />
                    {bundleType.badge && (
                        <Badge tone={bundleType.badge.tone}>
                            {bundleType.badge.text}
                        </Badge>
                    )}
                </InlineStack>

                {/* Icon Section */}
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

                {/* Content Section */}
                <BlockStack gap="300">
                    <Text variant="headingMd" as="h3">
                        {bundleType.label}
                    </Text>

                    <Text variant="bodySm" tone="subdued" as="p">
                        {bundleType.description}
                    </Text>

                    {/* Features List */}
                    {bundleType.features && bundleType.features.length > 0 && (
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
                    )}
                </BlockStack>

                {/* Action Button */}
                <Button
                    fullWidth
                    variant="secondary"
                    onClick={withLoader(handleSelect)}
                    loading={isSelecting}
                    disabled={bundleType.comingSoon}
                >
                    {bundleType.comingSoon ? "Coming Soon" : "Select"}
                </Button>
            </BlockStack>
        </Card>
    );
}
