/**
 * Prisma client singleton with Neon serverless adapter for v7.
 * Compatible with edge and serverless environments.
 */

import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/prisma/generated/client";

/**
 * Creates and configures the Prisma client with Neon adapter.
 *
 * @returns Configured PrismaClient instance
 */
function createPrismaClient(): PrismaClient {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        throw new Error("DATABASE_URL environment variable is not set");
    }

    const adapter = new PrismaNeon({ connectionString });

    const client = new PrismaClient({
        adapter,
        log:
            process.env.NODE_ENV === "development"
                ? [
                      { level: "error", emit: "event" },
                      { level: "warn", emit: "stdout" },
                  ]
                : [{ level: "error", emit: "event" }],
    });

    if (process.env.NODE_ENV === "development") {
        client.$on("error", (e) => {
            if (
                e.message.includes("P2002") ||
                e.message.includes("Unique constraint")
            ) {
                return;
            }
            console.error("[Prisma Error]", e.message);
        });
    }

    return client;
}

const globalForPrisma = globalThis as unknown as {
    prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

export default prisma;
