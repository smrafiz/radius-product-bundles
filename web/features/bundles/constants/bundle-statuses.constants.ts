import type {
    BundleStatus,
    BundleStatusBadge,
    BundleStatusBadgeNew,
} from "@/features/bundles";

/**
 * Bundle status badge configurations
 */
export const BUNDLE_STATUSES = {
    ACTIVE: { text: "Active", tone: "success" },
    DRAFT: { text: "Draft", tone: "info" },
    PAUSED: { text: "Paused", tone: "warning" },
    SCHEDULED: { text: "Scheduled", tone: "caution" },
    ARCHIVED: { text: "Archived", tone: "critical" },
} as const satisfies Record<BundleStatus, BundleStatusBadgeNew>;