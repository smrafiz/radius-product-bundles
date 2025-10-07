/**
 * Centralized query keys for the dashboard
 */
export const dashboardQueryKeys = {
    all: ['dashboard'] as const,
    bundles: () => [...dashboardQueryKeys.all, 'bundles'] as const,
    metrics: () => [...dashboardQueryKeys.all, 'metrics'] as const,
    overview: () => [...dashboardQueryKeys.all, 'overview'] as const,
};