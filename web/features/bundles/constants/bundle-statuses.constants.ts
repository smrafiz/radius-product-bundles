/*
 * Bundle statuses constants
 */

import type { BundleStatus, BundleStatusBadge } from "@/features/bundles";

/**
 * Bundle status badge configurations
 */
export const BUNDLE_STATUSES = {
    ACTIVE: { text: "Active", tone: "success" },
    DRAFT: { text: "Draft", tone: "new" },
    PAUSED: { text: "Paused", tone: "warning" },
    SCHEDULED: { text: "Scheduled", tone: "info" },
    ARCHIVED: { text: "Archived", tone: "critical" },
} as const satisfies Record<BundleStatus, BundleStatusBadge>;
