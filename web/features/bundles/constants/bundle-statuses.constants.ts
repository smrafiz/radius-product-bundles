import type { BundleStatus, BundleStatusBadgeNew } from "@/features/bundles";

/**
 * Bundle status badge configurations
 */
export const BUNDLE_STATUSES = {
    DRAFT: {
        text: "Draft",
        tone: "info",
        desc: "Not visible on selected sales channels or markets",
    },
    ACTIVE: {
        text: "Active",
        tone: "success",
        desc: "Sell via selected sales channels and markets",
    },
    SCHEDULED: {
        text: "Scheduled",
        tone: "caution",
        desc: "Sell via selected sales channels and markets",
    },
    PAUSED: {
        text: "Paused",
        tone: "warning",
        desc: "Sell via selected sales channels and markets",
    },
    ARCHIVED: {
        text: "Archived",
        tone: "critical",
        desc: "Sell via selected sales channels and markets",
    },
} as const satisfies Record<BundleStatus, BundleStatusBadgeNew>;

/**
 * Statuses available when creating a new bundle
 */
export const CREATE_STATUSES: BundleStatus[] = ["DRAFT", "ACTIVE", "SCHEDULED"];

/**
 * Statuses available when editing an existing bundle
 */
export const EDIT_STATUSES: BundleStatus[] = [
    "DRAFT",
    "ACTIVE",
    "SCHEDULED",
    "PAUSED",
    "ARCHIVED",
];
