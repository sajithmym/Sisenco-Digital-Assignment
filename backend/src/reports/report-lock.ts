import { Prisma } from "@prisma/client";

/** All content edits and workflow transitions acquire this lock before reading. */
export async function lockReport(tx: Prisma.TransactionClient, id: string) {
  await tx.$queryRaw`SELECT id FROM reports WHERE id = ${id} FOR UPDATE`;
}
