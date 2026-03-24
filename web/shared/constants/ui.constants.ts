export const NPROGRESS_ENABLED = false;

export const ACTION_THEMES = {
    success: {
        backgroundColor: "var(--p-color-bg-surface-success-hover)",
        iconColor: "success" as const,
    },
    info: {
        backgroundColor: "var(--p-color-bg-surface-info-hover)",
        iconColor: "info" as const,
    },
    critical: {
        backgroundColor: "var(--p-color-bg-surface-critical-hover)",
        iconColor: "critical" as const,
    },
    warning: {
        backgroundColor: "var(--p-color-bg-surface-warning-hover)",
        iconColor: "warning" as const,
    },
    emphasis: {
        backgroundColor: "var(--p-color-bg-surface-emphasis-hover)",
        iconColor: "emphasis" as const,
    },
} as const;
