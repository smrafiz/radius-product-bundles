import { timingSafeEqual } from "crypto";
import {
    pruneAnalytics,
    pruneAutomationLogs,
} from "@/features/analytics/repositories";

const ANALYTICS_RETENTION_DAYS = 730; // 2 years
const AUTOMATION_LOG_RETENTION_DAYS = 90;

/**
 * Cron endpoint for data retention pruning.
 *
 * Deletes bundle_analytics rows older than 2 years and
 * automation_logs rows older than 90 days.
 *
 * Protected by CRON_SECRET bearer token.
 * Schedule: Once per day.
 */
export async function GET(request: Request) {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || cronSecret.length < 16) {
        console.error("[Cron/prune] CRON_SECRET is missing or too short");
        return Response.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (
        token.length === 0 ||
        token.length !== cronSecret.length ||
        !timingSafeEqual(Buffer.from(token), Buffer.from(cronSecret))
    ) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const [analyticsDeleted, logsDeleted] = await Promise.all([
            pruneAnalytics(ANALYTICS_RETENTION_DAYS),
            pruneAutomationLogs(AUTOMATION_LOG_RETENTION_DAYS),
        ]);

        console.log(
            `[Cron/prune] analytics=${analyticsDeleted} automation_logs=${logsDeleted}`,
        );

        return Response.json({
            analyticsDeleted,
            logsDeleted,
            retentionDays: {
                analytics: ANALYTICS_RETENTION_DAYS,
                automationLogs: AUTOMATION_LOG_RETENTION_DAYS,
            },
        });
    } catch (error) {
        console.error("[Cron/prune] Error:", error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}
