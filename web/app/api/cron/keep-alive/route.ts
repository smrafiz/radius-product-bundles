/**
 * This keep-alive endpoint was designed for Neon serverless PostgreSQL
 * (free tier suspends after inactivity, causing cold-start latency).
 *
 * This app runs on EC2 with a local PostgreSQL instance that is always on,
 * so the keep-alive ping is unnecessary and has been removed.
 */
export async function GET() {
    return Response.json({ ok: true, note: "Keep-alive not needed on EC2" });
}
