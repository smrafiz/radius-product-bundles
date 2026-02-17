import type { BundleStatus, BundleStatusBadge } from "@/features/bundles";

/**
 * Bundle status badge configurations
 */
export const BUNDLE_STATUSES = {
    DRAFT: {
        text: "Draft",
        tone: "info",
        desc: "Work in progress, not visible to customers",
    },
    ACTIVE: {
        text: "Active",
        tone: "success",
        desc: "Live and available for purchase",
    },
    SCHEDULED: {
        text: "Scheduled",
        tone: "caution",
        desc: "Will go live at the scheduled time",
    },
    PAUSED: {
        text: "Paused",
        tone: "warning",
        desc: "Temporarily hidden, settings preserved",
    },
    ARCHIVED: {
        text: "Archived",
        tone: "critical",
        desc: "Permanently deactivated and hidden",
    },
    DELETED: {
        text: "Deleted",
        tone: "neutral",
        desc: "Permanently removed",
    },
} as const satisfies Record<BundleStatus, BundleStatusBadge>;

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
