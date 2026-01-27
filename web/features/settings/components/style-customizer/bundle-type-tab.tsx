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
            <s-stack gap="none">
                <s-select
                    value={activeId}
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
            </s-stack>
        </s-section>
    );
}
