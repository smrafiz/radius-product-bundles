/*
 * Bundle actions constants
 */

import { BundleAction, BundleHelpItem } from "@/features/bundles";

/**
 * Bundle listing actions
 */
export const BUNDLE_LISTING_ACTIONS: BundleAction[] = [
    {
        key: "edit",
        icon: "edit",
        tooltip: "Edit bundle",
    },
    {
        key: "view",
        icon: "view",
        tooltip: "View bundle",
    },
    {
        key: "duplicate",
        icon: "duplicate",
        tooltip: "Duplicate bundle",
    },
    {
        key: "delete",
        icon: "delete",
        tooltip: "Delete bundle",
        tone: "critical",
    },
];

export const BUNDLE_HELP_ITEMS: BundleHelpItem[] = [
    {
        title: "For increasing order value:",
        bundles: "Volume Discount, Fixed Bundle",
    },
    {
        title: "For product discovery:",
        bundles: "Mix & Match, Frequently Bought Together",
    },
    {
        title: "For customer acquisition:",
        bundles: "Buy X Get Y, Gift with Purchase",
    },
    {
        title: "For promotional campaigns:",
        bundles: "Buy X Get Y, BOGO",
    },
];
