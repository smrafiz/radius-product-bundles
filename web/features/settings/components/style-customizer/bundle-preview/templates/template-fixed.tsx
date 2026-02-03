"use client";

import type { BundleTemplateProps } from "@/features/settings/types/template.types";
import {
    BundleGrid,
    BundleList,
    BundleCarousel,
    BundleCompact,
} from "@/features/settings";

export function TemplateFixed({ activeLayout }: BundleTemplateProps) {
    switch (activeLayout) {
        case "GRID":
            return <BundleGrid />;
        case "CAROUSEL":
            return <BundleCarousel />;
        case "COMPACT":
            return <BundleCompact />;
        case "LIST":
        default:
            return <BundleList />;
    }
}
