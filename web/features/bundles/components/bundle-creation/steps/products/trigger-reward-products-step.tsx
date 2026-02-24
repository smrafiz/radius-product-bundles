"use client";

import {
    BundleDetails,
    BundleType,
    useBundleStore,
    useBundleValidation,
} from "@/features/bundles";
import { TriggerSection } from "./trigger-section";
import { RewardSection } from "./reward-section";
import { SameProductToggle } from "./same-product-toggle";
import { DealSummaryCard } from "./deal-summary-card";

export function TriggerRewardProductsStep({
    bundleType,
}: {
    bundleType: BundleType;
}) {
    const { validationAttempted } = useBundleStore();
    const { getAllErrors } = useBundleValidation();

    const errors = getAllErrors();
    const productErrorMessage =
        validationAttempted
            ? errors.find(
                  (error) =>
                      error.field === "products" || error.path === "products",
              )?.message
            : undefined;

    return (
        <s-stack gap="base">
            <s-section>
                <BundleDetails bundleType={bundleType} />
            </s-section>

            {productErrorMessage && (
                <s-banner tone="critical" data-fieldid="products">
                    {productErrorMessage}
                </s-banner>
            )}

            <SameProductToggle />
            <TriggerSection />
            <RewardSection />
            <DealSummaryCard />
        </s-stack>
    );
}
