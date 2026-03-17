import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generated/client";
import { encryptToken } from "../lib/crypto/token-encryption";

async function main() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error("DATABASE_URL environment variable is not set");
    }
    const adapter = new PrismaPg({ connectionString });
    const prisma = new PrismaClient({ adapter });
    const sessions = await prisma.session.findMany({
        where: { accessToken: { not: null } },
    });

    let count = 0;
    for (const session of sessions) {
        if (session.accessToken && session.accessToken.startsWith("shpat_")) {
            await prisma.session.update({
                where: { id: session.id },
                data: { accessToken: encryptToken(session.accessToken) },
            });
            count++;
        }
    }
    console.log(`Encrypted ${count} tokens`);
    await prisma.$disconnect();
}

main();
