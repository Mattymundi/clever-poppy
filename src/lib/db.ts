import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

function createPrismaClient() {
  const url = process.env.TURSO_DATABASE_URL || "file:dev.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;

  const libsql = createClient({
    url,
    ...(authToken ? { authToken } : {}),
  });

  const adapter = new PrismaLibSql(libsql);
  return new PrismaClient({ adapter } as any);
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || createPrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
