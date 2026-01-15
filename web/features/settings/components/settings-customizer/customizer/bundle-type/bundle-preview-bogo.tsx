"use client";
import { useBundleStore } from "@/features/bundles";

export function BundlePreviewBogo() {
    const { displaySettings } = useBundleStore();
    const styleData = displaySettings.style || {};

    return (
        <div>BOGO</div>
    );
}
