"use client";

import React from "react";
import { PREVIEW_TEMPLATE_OPTIONS } from "@/features/settings/constants/customizer.constants";

/**
 * Template type tab component.
 */
export function BundleTypeTab({
    activeId,
    onChangeAction,
}: {
    activeId: string;
    onChangeAction: (id: string) => void;
}) {
    return (
        <s-section>
            <s-stack direction="inline" alignItems="center" gap="small">
                <s-heading>Select Template Type</s-heading>
                <s-stack direction="inline">
                    <div className="min-w-60">
                        <s-select
                            value={activeId}
                            icon="package"
                            label="Template Type"
                            labelAccessibilityVisibility="exclusive"
                            onChange={(e: Event) => {
                                const target = e.target as HTMLSelectElement;
                                onChangeAction(target.value);
                            }}
                        >
                            {PREVIEW_TEMPLATE_OPTIONS.map((opt) => (
                                <s-option key={opt.id} value={opt.id}>
                                    {opt.label}
                                </s-option>
                            ))}
                        </s-select>
                    </div>
                </s-stack>
            </s-stack>
        </s-section>
    );
}
