"use client";

import React from "react";
import { BUNDLE_TYPES } from "@/features/bundles/constants";

/**
 * Bundle type tab component.
 */
export function BundleTypeTab({
    activeId,
    onChangeAction,
}: {
    activeId: string;
    onChangeAction: (id: string) => void;
}) {
    const types = Object.values(BUNDLE_TYPES);

    return (
        <s-section>
            <s-stack direction="inline" alignItems="center" gap="small">
                <s-heading>Select Template Type</s-heading>
                <s-stack direction="inline">
                    <div className="min-w-60">
                        <s-select
                            value={activeId}
                            icon="package"
                            label="Bundle Type"
                            labelAccessibilityVisibility="exclusive"
                            onChange={(e: Event) => {
                                const target = e.target as HTMLSelectElement;
                                onChangeAction(target.value);
                            }}
                        >
                            {types.map((type) => (
                                <s-option key={type.id} value={type.id}>
                                    {type.label}
                                </s-option>
                            ))}
                        </s-select>
                    </div>
                </s-stack>
            </s-stack>
        </s-section>
    );
}
