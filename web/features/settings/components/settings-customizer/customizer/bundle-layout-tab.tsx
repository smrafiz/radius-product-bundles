"use client";

import React, { useState } from "react";
import { BUNDLE_TYPES } from "@/features/bundles";

export function BundleLayoutTab() {
    const types = Object.values(BUNDLE_TYPES);
    const [activeId] = useState(types[0]?.id);

    return (
        <s-section>
            <s-stack gap="none">
                <s-select value={activeId}>
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
