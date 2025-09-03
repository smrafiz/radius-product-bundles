"use client";

import React from "react";
import { useBundleStore } from "@/stores";
import { Knob } from "@/components/fields/Knob";
import { ADVANCED_OPTIONS } from "@/lib/constants";
import { BlockStack, Card, Divider, InlineStack, Text } from "@shopify/polaris";

export default function AdvancedOptions() {
    const { displaySettings, updateDisplaySettings } = useBundleStore();

    return (
        <Card>
            <BlockStack gap="400">
                <Text as="p" variant="headingMd" fontWeight="medium">
                    Advanced Options
                </Text>

                <BlockStack gap="300">
                    {ADVANCED_OPTIONS.map(
                        ({ key, title, description }, index) => {
                            const selected = displaySettings[key];
                            return (
                                <React.Fragment key={key}>
                                    <InlineStack
                                        align="space-between"
                                        blockAlign="center"
                                        wrap={false}
                                        gap="200"
                                    >
                                        <BlockStack gap="050">
                                            <InlineStack
                                                align="start"
                                                gap="100"
                                            >
                                                <Text
                                                    as="p"
                                                    variant="bodyMd"
                                                    fontWeight="medium"
                                                >
                                                    {title}
                                                </Text>
                                            </InlineStack>
                                            <Text
                                                as="p"
                                                variant="bodySm"
                                                tone="subdued"
                                            >
                                                {description}
                                            </Text>
                                        </BlockStack>

                                        <Knob
                                            selected={selected}
                                            ariaLabel={title}
                                            onClick={() =>
                                                updateDisplaySettings(
                                                    key,
                                                    !selected,
                                                )
                                            }
                                        />
                                    </InlineStack>

                                    {index < ADVANCED_OPTIONS.length - 1 && (
                                        <Divider />
                                    )}
                                </React.Fragment>
                            );
                        },
                    )}
                </BlockStack>
            </BlockStack>
        </Card>
    );
}
