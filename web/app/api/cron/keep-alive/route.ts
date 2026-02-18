import { prisma } from "@/shared/repositories";

/**
 * Keep-alive cron to prevent Neon free-tier DB from auto-suspending.
 *
 * Runs every 4 minutes via Vercel Cron. A simple SELECT 1 keeps
 * the Neon compute endpoint warm, avoiding 500ms-2s cold start penalty.
 */
export async function GET(request: Request) {
    const authHeader = request.headers.get("authorization");

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await prisma.$queryRawUnsafe("SELECT 1");
        return Response.json({ ok: true, timestamp: new Date().toISOString() });
    } catch (error) {
        console.error("[Cron] Keep-alive ping failed:", error);
        return Response.json(
            { error: "Database ping failed" },
            { status: 500 },
        );
    }
}
