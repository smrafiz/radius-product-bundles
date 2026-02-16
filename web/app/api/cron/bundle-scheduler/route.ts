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
    const authHeader = request.headers.get("authorization");

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
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
