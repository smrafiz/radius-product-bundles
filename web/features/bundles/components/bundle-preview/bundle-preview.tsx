"use client";

import {
    BundlePriority,
    BundleLayoutGrid,
    BundleLayoutList,
    BundleLayoutCarousel,
    BundleLayoutCompact,
    BundlePreviewStatus,
    useBundleStore,
} from "@/features/bundles";
import "@/styles/components/bundle.css";

export function BundlePreview() {
    const { displaySettings } = useBundleStore();

    const renderLayout = () => {
        switch (displaySettings.layout) {
            case "GRID":
                return <BundleLayoutGrid />;

            case "LIST":
                return <BundleLayoutList />;

            case "CAROUSEL":
                return <BundleLayoutCarousel />;

            case "COMPACT":
                return <BundleLayoutCompact />;

            default:
                return <BundleLayoutGrid />;
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <BundlePreviewStatus />
            <BundlePriority />

            {renderLayout()}
        </div>
    );
}
