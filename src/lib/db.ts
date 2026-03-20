import { PrismaClient } from "@/generated/prisma/client";

let prismaInstance: PrismaClient | null = null;

async function createPrismaClient(): Promise<PrismaClient> {
  if (process.env.TURSO_DATABASE_URL) {
    // Production: use libsql adapter for Turso
    const { PrismaLibSQL } = await import("@prisma/adapter-libsql");
    const { createClient } = await import("@libsql/client/http");
    const libsql = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    const adapter = new PrismaLibSQL(libsql);
    return new PrismaClient({ adapter } as any);
  } else {
    // Local dev: use better-sqlite3 adapter
    const { PrismaBetterSqlite3 } = await import(
      "@prisma/adapter-better-sqlite3"
    );
    const path = await import("path");
    const adapter = new PrismaBetterSqlite3({
      url: `file:${path.join(process.cwd(), "dev.db")}`,
    });
    return new PrismaClient({ adapter } as any);
  }
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Synchronous export — initialize lazily on first use via a Proxy
function getOrCreatePrisma(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  // For the initial creation we need to handle the async init.
  // We use a synchronous fallback for Turso since @libsql/client/http is lightweight.
  if (process.env.TURSO_DATABASE_URL) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSQL } = require("@prisma/adapter-libsql");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require("@libsql/client/http");
    const libsql = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    const adapter = new PrismaLibSQL(libsql);
    const client = new PrismaClient({ adapter } as any);
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
    return client;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require("path");
    const adapter = new PrismaBetterSqlite3({
      url: `file:${path.join(process.cwd(), "dev.db")}`,
    });
    const client = new PrismaClient({ adapter } as any);
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
    return client;
  }
}

export const prisma = getOrCreatePrisma();
