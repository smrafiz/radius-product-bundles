"use client";
import { useBundleStore } from "@/features/bundles";

export function BundlePreviewFixed() {
    const { displaySettings } = useBundleStore();
    const styleData = displaySettings.style || {};

    return (
        <div>Fixed</div>
    );
}
