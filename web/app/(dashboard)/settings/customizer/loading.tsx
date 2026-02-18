"use client";

import { CustomizerSkeleton } from "@/features/settings/components/style-customizer";

/**
 * Customizer page loading skeleton
 */
export default function Loading() {
    return (
        <s-page heading="Style Customizer" inlineSize="large">
            <CustomizerSkeleton />
        </s-page>
    );
}
