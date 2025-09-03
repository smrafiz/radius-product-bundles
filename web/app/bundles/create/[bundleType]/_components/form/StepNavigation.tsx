"use client";

import React from "react";
import NProgress from "nprogress";
import { useRouter } from "next/navigation";
import { BUNDLE_STEPS } from "@/lib/constants";
import { Box, Button, InlineStack, Text } from "@shopify/polaris";
import { ArrowLeftIcon, ArrowRightIcon } from "@shopify/polaris-icons";

import { useBundleSave, useStepNavigation, useBundleValidation } from "@/hooks";

import { useBundleStore } from "@/stores";

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
    const { canProceedToNextStep } = useBundleValidation();
    const { setValidationAttempted } = useBundleStore();

    const handleBack = () => {
        if (currentStep === 1) {
            NProgress.start();
            router.push("/bundles/create");
        } else {
            goToPreviousStep();
        }
    };

    const handleNext = async () => {
        if (currentStep === totalSteps) {
            try {
                await saveBundle();
                router.push("/bundles");
            } catch (error) {
                // Handle error (show toast, etc.)
            }
        } else {
            setValidationAttempted(true);

            if (canProceedToNextStep()) {
                goToNextStep();
            }
        }
    };

    const getCurrentStepInfo = () => {
        return BUNDLE_STEPS[currentStep - 1] || { title: "Step" };
    };

    const getPrevStepTitle = () => {
        if (currentStep === 1) return "Bundle types";
        return BUNDLE_STEPS[currentStep - 2]?.title || "Previous";
    };

    const getNextStepTitle = () => {
        if (currentStep === totalSteps) return "Create bundle";
        return BUNDLE_STEPS[currentStep]?.title || "Next";
    };

    return (
        <InlineStack align="space-between">
            {/* Previous Button */}
            <Button
                variant="secondary"
                icon={ArrowLeftIcon}
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
                    Step {currentStep} of {totalSteps}:{" "}
                    {getCurrentStepInfo().title}
                </Text>
            </Box>

            {/* Next Button */}
            <div className="rt-bundle-next-button">
                <Button
                    variant="primary"
                    icon={
                        currentStep === totalSteps ? undefined : ArrowRightIcon
                    }
                    onClick={handleNext}
                    // Remove disabled prop - let users click to trigger validation
                    loading={isSaving && currentStep === totalSteps}
                >
                    {getNextStepTitle()}
                </Button>
            </div>
        </InlineStack>
    );
}
