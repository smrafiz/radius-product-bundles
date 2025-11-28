"use client"
import { useState } from "react";
import { BUNDLE_STATUSES } from "@/features/bundles";

export function BundlePreviewStatus() {
    const [status, setStatus] = useState<keyof typeof BUNDLE_STATUSES>("DRAFT");

    return (
        <s-section>
            <s-heading>Bundle status</s-heading>

            <s-select
                label="Bundle status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                labelAccessibilityVisibility="exclusive"
            >
                {Object.entries(BUNDLE_STATUSES).map(([key, { text }]) => (
                    <s-option key={key} value={key}>
                        {text}
                    </s-option>
                ))}
            </s-select>

            {/* condition */}
            {status === "SCHEDULED" && (
                <s-stack gap="base" direction="inline">
                    <s-date-field
                        label="Start date"
                        name="promoStart"
                        value="2025-11-28"
                        view="YYYY-MM"
                    />
                    <s-date-field
                        label="End date"
                        name="promoEnd"
                        value="2026-11-31"
                    />
                </s-stack>
            )}
        </s-section>
    );
}
