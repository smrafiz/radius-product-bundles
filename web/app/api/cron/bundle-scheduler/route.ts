import { timingSafeEqual } from "crypto";
import { processScheduledBundles } from "@/features/bundles/services";

/**
 * Cron endpoint for processing scheduled bundle transitions.
 *
 * Activates SCHEDULED bundles whose startDate has arrived,
 * and pauses ACTIVE bundles whose endDate has passed.
 *
 * Protected by CRON_SECRET bearer token.
 * Schedule: Once per day (configured in vercel.json or external cron).
 */
export async function GET(request: Request) {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || cronSecret.length < 16) {
        console.error("[Cron] CRON_SECRET is missing or too short");
        return Response.json(
            { error: "Server misconfigured" },
            { status: 500 },
        );
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
        const result = await processScheduledBundles();
        return Response.json(result);
    } catch (error) {
        console.error("[Cron] Bundle scheduler error:", error);
        return Response.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
