"use client";

import {
    useBundleFormMethods,
    useBundleStore,
    useStepIndicator,
} from "@/features/bundles";
import { submitForm } from "@/shared";
import { usePathname } from "next/navigation";

export function HorizontalStepIndicator() {
    const {
        steps,
        getStepStatus,
        getProgressLineColor,
        canNavigateToStep,
        navigateToStep,
    } = useStepIndicator();

    const { currentStep, totalSteps, prevStep, canGoPrevious, isSaving } =
        useBundleStore();
    const { handleNextStep } = useBundleFormMethods();
    const pathname = usePathname();
    const isEditMode = pathname.includes("/edit");

    const isLastStep = currentStep === totalSteps;
    const canGoPrev = canGoPrevious();

    /**
     * Handle final form submission.
     */
    const handleFinalSubmit = () => {
        submitForm();
    };

    const handleStepClick = (stepNumber: number) => {
        if (isSaving) {
            return;
        }

        if (canNavigateToStep(stepNumber)) {
            navigateToStep(stepNumber);
        }
    };

    const getNextButtonText = () => {
        switch (currentStep) {
            case 1:
            case 2:
            case 3:
                return "Continue";
            case 4:
                return isEditMode ? "Update" : "Publish";
            default:
                return "Continue";
        }
    };

    const getPrevButtonText = () => "Previous";

    return (
        <s-section>
            <s-stack
                direction="inline"
                gap="base"
                justifyContent="space-between"
            >
                {/* Prev button */}
                <s-stack>
                    <s-button
                        onClick={prevStep}
                        disabled={!canGoPrev || (isLastStep && isSaving)}
                        variant="secondary"
                        accessibilityLabel="Back"
                    >
                        <s-icon type="arrow-left" size="small" />
                        {getPrevButtonText()}
                    </s-button>
                </s-stack>

                {/* Step Indicator */}
                <s-grid gridTemplateColumns="1fr auto" alignItems="center">
                    <s-stack direction="inline" gap="small" alignItems="center">
                        {steps.map((step, index) => (
                            <s-stack key={step.number}>
                                <s-stack
                                    direction="inline"
                                    gap="small-200"
                                    alignItems="center"
                                >
                                    <div
                                        className="cursor-pointer"
                                        onClick={() =>
                                            handleStepClick(step.number)
                                        }
                                    >
                                        <s-badge
                                            size="large"
                                            icon={
                                                getStepStatus(step.number) ===
                                                "completed"
                                                    ? "check-circle"
                                                    : getStepStatus(
                                                            step.number,
                                                        ) === "current"
                                                      ? "edit"
                                                      : "circle"
                                            }
                                            tone={
                                                getStepStatus(step.number) ===
                                                "completed"
                                                    ? "success"
                                                    : getStepStatus(
                                                            step.number,
                                                        ) === "current"
                                                      ? "info"
                                                      : undefined
                                            }
                                        >
                                            {step.title}
                                        </s-badge>
                                    </div>

                                    {index < steps.length - 1 && (
                                        <s-box
                                            inlineSize="24px"
                                            borderWidth="base"
                                            borderColor={
                                                getStepStatus(step.number) ===
                                                "completed"
                                                    ? "strong"
                                                    : "base"
                                            }
                                        />
                                    )}
                                </s-stack>

                                {/* Progress Line */}
                                {index < steps.length - 1 && (
                                    <div
                                        className={`h-[3px] flex-1 max-w-[120px] min-w-[60px]`}
                                        style={{
                                            backgroundColor:
                                                getProgressLineColor(
                                                    step.number,
                                                ),
                                        }}
                                    />
                                )}
                            </s-stack>
                        ))}
                    </s-stack>
                </s-grid>

                {/* Next button */}
                <s-stack>
                    <s-button
                        onClick={
                            isLastStep ? handleFinalSubmit : handleNextStep
                        }
                        loading={isLastStep && isSaving}
                        variant="primary"
                        accessibilityLabel="Next"
                    >
                        {getNextButtonText()}
                        <s-icon type="arrow-right" size="small" />
                    </s-button>
                </s-stack>
            </s-stack>
        </s-section>
    );
}
