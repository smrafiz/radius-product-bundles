import { prisma } from "@/shared/repositories";

/**
 * Keep-alive cron to prevent Neon free-tier DB from auto-suspending.
 *
 * Runs every 4 minutes via Vercel Cron. A simple SELECT 1 keeps
 * the Neon compute endpoint warm, avoiding 500ms-2s cold start penalty.
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
        await prisma.$queryRaw`SELECT 1`;
        return Response.json({ ok: true, timestamp: new Date().toISOString() });
    } catch (error) {
        console.error("[Cron] Keep-alive ping failed:", error);
        return Response.json(
            { error: "Database ping failed" },
            { status: 500 },
        );
    }
}
