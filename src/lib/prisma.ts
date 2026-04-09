import { PrismaClient } from "@prisma/client";
import { createClient } from "@libsql/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

function createPrismaClient() {
    // Use Turso in production / when TURSO_AUTH_TOKEN is present
    if (process.env.TURSO_AUTH_TOKEN && process.env.DATABASE_URL?.startsWith("libsql://")) {
        const libsql = createClient({
            url: process.env.DATABASE_URL,
            authToken: process.env.TURSO_AUTH_TOKEN,
        });
        const adapter = new PrismaLibSQL(libsql);
        return new PrismaClient({ adapter } as any);
    }
    
    // Fallback to local SQLite for development
    return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
