import type { BundleStatus, BundleStatusBadge } from "@/types";

export const bundleStatusConfigs: Record<BundleStatus, BundleStatusBadge> = {
    ACTIVE: { text: "Active", tone: "success" },
    DRAFT: { text: "Draft", tone: "subdued" },
    PAUSED: { text: "Paused", tone: "warning" },
    SCHEDULED: { text: "Scheduled", tone: "info" },
    ARCHIVED: { text: "Archived", tone: "critical" },
};