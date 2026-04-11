import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/prisma/generated/client";
import { Pool } from "pg";

/**
 * Connection pool configuration.
 *
 * In PM2 cluster mode each worker gets its own pool, so per-worker max
 * must be sized to stay within PostgreSQL's max_connections budget.
 *
 * Formula: total_connections = MAX_POOL_SIZE × NUM_WORKERS
 * Default PostgreSQL max_connections = 100.
 * With 4 CPU cores → 4 workers × 5 connections = 20 connections max,
 * leaving plenty of headroom for migrations, crons, and admin tools.
 *
 * Tune MAX_POOL_SIZE via environment variable if you have more RAM / a
 * higher max_connections setting on your EC2 PostgreSQL instance.
 */
const MAX_POOL_SIZE = parseInt(process.env.DB_POOL_SIZE ?? "5", 10);

function createPrismaClient() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error("DATABASE_URL environment variable is not set");
    }

    const pool = new Pool({
        connectionString,
        max: MAX_POOL_SIZE,
        // Release idle connections after 30s to avoid holding open handles
        idleTimeoutMillis: 30_000,
        // Fail fast if a connection can't be acquired — avoids request pile-up
        connectionTimeoutMillis: 5_000,
        // Keep TCP connections alive to avoid silent drops on EC2
        keepAlive: true,
    });

    // Surface pool errors to logs rather than crashing the process
    pool.on("error", (err) => {
        console.error("[DB Pool] Unexpected error on idle client:", err.message);
    });

    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
    prisma?: ReturnType<typeof createPrismaClient>;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

export default prisma;
