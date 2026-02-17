"use client";

import React from "react";
import { triggerSaveBar, useAppNavigation } from "@/shared";
import {
    useBundleFormMethods,
    useBundleStore,
    useBundleValidation,
} from "@/features/bundles";
import { useSettingsStore } from "@/features/settings";

export function BundlePriority() {
    const { bundleData, updateBundleField, markDirty, markFieldTouched } =
        useBundleStore();
    const { setValue, trigger } = useBundleFormMethods();
    const { getFieldError } = useBundleValidation();
    const { settings } = useAppNavigation();

    const globalPriorityType =
        useSettingsStore.getState().getEffectiveData()?.bundlePriorityType ??
        "index_based";

    const strategyLabel =
        globalPriorityType === "discount_based"
            ? "Discount based"
            : "Index based";

    return (
        <s-section>
            <s-stack gap="small-200">
                <s-stack
                    direction="inline"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <s-heading>Bundle priority</s-heading>
                    <s-tooltip id="bundle-priority-tooltip">
                        <s-text>
                            {globalPriorityType === "index_based"
                                ? "The bundle with the highest priority is displayed when multiple bundles apply to a product."
                                : "The bundle with the highest discount value is displayed when multiple bundles apply to a product."}
                        </s-text>
                    </s-tooltip>
                    <s-icon
                        tone="neutral"
                        type="info"
                        interestFor="bundle-priority-tooltip"
                    />
                </s-stack>

                <s-stack gap="small-300">
                    <s-stack
                        direction="inline"
                        gap="small-200"
                        alignItems="center"
                        justifyContent="space-between"
                    >
                        <s-text color="subdued">
                            Strategy: {strategyLabel}
                        </s-text>
                        <s-link onClick={settings}>
                            <span className="underline text-[#303030]">
                                Change strategy
                            </span>
                        </s-link>
                    </s-stack>

                    {globalPriorityType === "index_based" && (
                        <s-number-field
                            label="Priority"
                            details="Higher number = higher priority (0–500)"
                            placeholder="0"
                            step={1}
                            min={0}
                            max={500}
                            value={String(bundleData.priority ?? 0)}
                            error={getFieldError("priority")}
                            onChange={(e: any) => {
                                const val = Number(e.target.value);
                                const numVal = isNaN(val) ? 0 : val;
                                setValue("priority", numVal, {
                                    shouldDirty: true,
                                });
                                updateBundleField("priority", numVal);
                                markDirty();
                                triggerSaveBar();
                            }}
                            onBlur={() => {
                                markFieldTouched("priority");
                                void trigger("priority");
                            }}
                        />
                    )}
                </s-stack>
            </s-stack>
        </s-section>
    );
}
