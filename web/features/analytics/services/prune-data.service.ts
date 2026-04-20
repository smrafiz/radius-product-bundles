import {
    pruneAnalytics,
    pruneAutomationLogs,
} from "@/features/analytics/repositories";

const ANALYTICS_RETENTION_DAYS = 730; // 2 years
const AUTOMATION_LOG_RETENTION_DAYS = 90;

export async function pruneStaleData() {
    const [analyticsDeleted, logsDeleted] = await Promise.all([
        pruneAnalytics(ANALYTICS_RETENTION_DAYS),
        pruneAutomationLogs(AUTOMATION_LOG_RETENTION_DAYS),
    ]);

    console.log(
        `[prune] analytics=${analyticsDeleted} automation_logs=${logsDeleted}`,
    );

    return { analyticsDeleted, logsDeleted };
}
