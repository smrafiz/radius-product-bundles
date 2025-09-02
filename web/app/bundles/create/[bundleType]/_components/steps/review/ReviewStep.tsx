import React from "react";
import { useBundleStore } from "@/stores";
import { BlockStack, Card, Text } from "@shopify/polaris";
import { StepHeading } from "@/bundles/create/[bundleType]/_components/shared";
import { BundleSummary } from "@/bundles/create/[bundleType]/_components/steps/review";
import SelectedProductsAccordion from "@/components/shared/SelectedProductsAccordion";

export default function ReviewStep() {
    const { bundleData } = useBundleStore();

    return (
        <BlockStack gap="500">
            <StepHeading
                title="Review & Publish"
                description="Review your bundle settings and publish when ready."
            />

            <SelectedProductsAccordion />
            <BundleSummary />
        </BlockStack>
    );
}
