"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import NProgress from "nprogress";
import {
    InlineStack,
    Text,
    Box,
    Button,
} from '@shopify/polaris';
import { ChevronLeftIcon, ChevronRightIcon } from '@shopify/polaris-icons';
import { useStepNavigation } from '@/hooks/bundle/useStepNavigation';
import { useBundleSave } from '@/hooks/bundle/useBundleSave';
import { BUNDLE_STEPS } from '@/lib/constants/bundleConstants';

export default function StepNavigation() {
    const router = useRouter();
    const {
        currentStep,
        totalSteps,
        goToPreviousStep,
        goToNextStep,
        canGoNext,
        canGoPrevious,
    } = useStepNavigation();

    const { saveBundle, isSaving } = useBundleSave();

    const handleBack = () => {
        if (currentStep === 1) {
            NProgress.start();
            router.push('/bundles/create');
        } else {
            goToPreviousStep();
        }
    };

    const handleNext = async () => {
        if (currentStep === totalSteps) {
            // Final step - save bundle
            try {
                await saveBundle();
                router.push('/bundles');
            } catch (error) {
                console.error('Failed to save bundle:', error);
                // Handle error (show toast, etc.)
            }
        } else {
            goToNextStep();
        }
    };

    const getCurrentStepInfo = () => {
        return BUNDLE_STEPS[currentStep - 1] || { title: 'Step' };
    };

    const getPrevStepTitle = () => {
        if (currentStep === 1) return 'Bundle types';
        return BUNDLE_STEPS[currentStep - 2]?.title || 'Previous';
    };

    const getNextStepTitle = () => {
        if (currentStep === totalSteps) return 'Create bundle';
        return BUNDLE_STEPS[currentStep]?.title || 'Next';
    };

    return (
        <InlineStack align="space-between">
            {/* Previous Button */}
            <Button
                variant="secondary"
                icon={ChevronLeftIcon}
                onClick={handleBack}
                disabled={!canGoPrevious && currentStep !== 1}
            >
                {getPrevStepTitle()}
            </Button>

            {/* Current Step Indicator */}
            <Box
                background="bg-surface-secondary"
                padding="200"
                borderRadius="100"
            >
                <Text as="p" variant="bodySm" tone="subdued">
                    Step {currentStep} of {totalSteps}: {getCurrentStepInfo().title}
                </Text>
            </Box>

            {/* Next Button */}
            <Button
                variant="primary"
                iconAlignment="end"
                icon={currentStep === totalSteps ? undefined : ChevronRightIcon}
                onClick={handleNext}
                disabled={!canGoNext}
                loading={isSaving && currentStep === totalSteps}
            >
                {getNextStepTitle()}
            </Button>
        </InlineStack>
    );
}