import { timingSafeEqual } from "crypto";
import { pruneStaleData } from "@/features/analytics/services";

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
        const result = await pruneStaleData();
        return Response.json(result);
    } catch (error) {
        console.error("[Cron/prune] Error:", error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}
