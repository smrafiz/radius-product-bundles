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
        return Response.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const result = await processScheduledBundles();
        return Response.json(result);
    } catch (error) {
        console.error("[Cron] Bundle scheduler error:", error);
        return Response.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Internal server error",
            },
            { status: 500 },
        );
    }
}
