"use client";
import { useBundleStore } from "@/features/bundles";

export function BundlePreviewBuyGet() {
    const { displaySettings } = useBundleStore();
    const styleData = displaySettings.style || {};

    return (
        <div>Buy X Get Y</div>
    );
}
