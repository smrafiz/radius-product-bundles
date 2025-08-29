// web/app/bundles/create/[bundleType]/_components/shared/HorizontalStepIndicator.tsx
"use client";

import React from 'react';
import {
    Card,
    InlineStack,
    BlockStack,
    Text,
    Box,
    Icon
} from '@shopify/polaris';
import { CheckIcon } from '@shopify/polaris-icons';
import { useStepIndicator } from '@/hooks/ui/useStepIndicator';

export default function HorizontalStepIndicator() {
    const {
        steps,
        currentStep,
        getStepStatus,
        getStepColor,
        getProgressLineColor,
        canNavigateToStep,
        navigateToStep,
    } = useStepIndicator();

    return (
        <Card>
            <InlineStack align="space-between" gap="400">
                {steps.map((step, index) => (
                    <React.Fragment key={step.number}>
                        {/* Step Item */}
                        <InlineStack
                            gap="300"
                            blockAlign="center"
                            style={{
                                cursor: canNavigateToStep(step.number) ? 'pointer' : 'default',
                                opacity: canNavigateToStep(step.number) ? 1 : 0.6
                            }}
                            onClick={() => navigateToStep(step.number)}
                        >
                            {/* Step Circle */}
                            <Box
                                background={getStepColor(getStepStatus(step.number))}
                                borderRadius="full"
                                padding="300"
                                minWidth="40px"
                                minHeight="40px"
                            >
                                <InlineStack align="center">
                                    {getStepStatus(step.number) === 'completed' ? (
                                        <Icon source={CheckIcon} tone="text-inverse" />
                                    ) : (
                                        <Text
                                            variant="bodyMd"
                                            fontWeight="medium"
                                            tone={getStepStatus(step.number) === 'current' ? 'text-inverse' : 'subdued'}
                                            as="span"
                                        >
                                            {String(step.number).padStart(2, '0')}
                                        </Text>
                                    )}
                                </InlineStack>
                            </Box>

                            {/* Step Content */}
                            <BlockStack gap="050">
                                <Text
                                    as="p"
                                    variant="bodyMd"
                                    fontWeight={getStepStatus(step.number) === 'current' ? "medium" : "regular"}
                                    tone={getStepStatus(step.number) === 'current' ? "base" : "subdued"}
                                >
                                    {step.title}
                                </Text>
                                <Text variant="caption" tone="subdued">
                                    {step.description}
                                </Text>
                            </BlockStack>
                        </InlineStack>

                        {/* Progress Line */}
                        {index < steps.length - 1 && (
                            <Box
                                background={getProgressLineColor(step.number)}
                                minHeight="3px"
                                style={{
                                    flex: 1,
                                    maxWidth: '120px',
                                    minWidth: '60px'
                                }}
                            />
                        )}
                    </React.Fragment>
                ))}
            </InlineStack>
        </Card>
    );
}