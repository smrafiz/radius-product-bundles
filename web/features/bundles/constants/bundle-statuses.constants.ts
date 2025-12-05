import type { BundleStatus, BundleStatusBadgeNew } from "@/features/bundles";

/**
 * Bundle status badge configurations
 */
export const BUNDLE_STATUSES = {
    DRAFT: { text: "Draft", tone: "info" },
    ACTIVE: { text: "Active", tone: "success" },
    SCHEDULED: { text: "Scheduled", tone: "caution" },
    PAUSED: { text: "Paused", tone: "warning" },
    ARCHIVED: { text: "Archived", tone: "critical" },
} as const satisfies Record<BundleStatus, BundleStatusBadgeNew>;

/**
 * Statuses available when creating a new bundle
 */
export const CREATE_STATUSES: BundleStatus[] = ["DRAFT", "ACTIVE", "SCHEDULED"];

/**
 * Statuses available when editing an existing bundle
 */
export const EDIT_STATUSES: BundleStatus[] = ["DRAFT", "ACTIVE", "SCHEDULED", "PAUSED", "ARCHIVED"];