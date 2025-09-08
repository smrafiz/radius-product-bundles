"use client";

import { Fragment } from "react";
import { useStepIndicator } from "@/hooks/";
import { CheckIcon } from "@shopify/polaris-icons";
import { BlockStack, Card, Icon, Text } from "@shopify/polaris";

export default function HorizontalStepIndicator() {
    const {
        steps,
        getStepStatus,
        getStepColor,
        getProgressLineColor,
        canNavigateToStep,
        navigateToStep,
    } = useStepIndicator();

    return (
        <Card>
            <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                    <Fragment key={step.number}>
                        {/* Step Item */}
                        <div
                            className={`flex gap-[12px] items-center ${
                                canNavigateToStep(step.number)
                                    ? "cursor-pointer opacity-100"
                                    : "cursor-default opacity-60"
                            }`}
                            onClick={() =>
                                canNavigateToStep(step.number) &&
                                navigateToStep(step.number)
                            }
                        >
                            {/* Step Circle */}
                            <div
                                className={`flex items-center justify-center rounded-full w-10 h-10 ${
                                    getStepStatus(step.number) === "completed"
                                        ? getStepColor("completed")
                                        : getStepColor(
                                              getStepStatus(step.number),
                                          )
                                }`}
                            >
                                {getStepStatus(step.number) === "completed" ? (
                                    <Icon source={CheckIcon} tone="subdued" />
                                ) : (
                                    <span
                                        className={`flex items-center justify-center rounded-full w-6 h-6 ${
                                            getStepStatus(step.number) ===
                                            "current"
                                                ? "bg-green-400 text-black"
                                                : "bg-gray-200 text-gray-600"
                                        } font-medium text-sm`}
                                    >
                                        {String(step.number).padStart(2, "0")}
                                    </span>
                                )}
                            </div>

                            {/* Step Content */}
                            <BlockStack gap="050">
                                <Text
                                    as="p"
                                    variant="bodyMd"
                                    fontWeight="medium"
                                    tone={
                                        getStepStatus(step.number) === "current"
                                            ? "base"
                                            : "subdued"
                                    }
                                >
                                    {step.title}
                                </Text>
                                <Text as="p" variant="bodySm" tone="subdued">
                                    {step.description}
                                </Text>
                            </BlockStack>
                        </div>

                        {/* Progress Line */}
                        {index < steps.length - 1 && (
                            <div
                                className={`h-[3px] flex-1 max-w-[120px] min-w-[60px]`}
                                style={{
                                    backgroundColor: getProgressLineColor(
                                        step.number,
                                    ),
                                }}
                            />
                        )}
                    </Fragment>
                ))}
            </div>
        </Card>
    );
}
