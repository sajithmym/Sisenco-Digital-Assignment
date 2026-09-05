import { PrismaClient } from "@prisma/client";
import { SEED_SETTINGS, SERVER_SETTINGS } from "../src/settings";
import { DAY_MS } from "../src/reports/report-date";

const prisma = new PrismaClient();
async function main() {
  if (SERVER_SETTINGS.nodeEnv === "production")
    throw new Error("Demo repair is disabled in production.");
  let repaired = 0;
  await prisma.$transaction(async (tx) => {
    const reports = await tx.report.findMany({
      where: {
        user: {
          email: { in: SEED_SETTINGS.members.map((member) => member.email) },
        },
      },
      include: { versions: true, user: true },
    });
    for (const report of reports) {
      // Restrict repairs to the exact old seed marker. Keep actual report and snapshot content intact.
      if (!/^Week [1-4] notes for /.test(report.notes || "")) continue;
      const max = Math.max(
        0,
        ...report.versions.map((version) => version.versionNumber),
      );
      let start = report.weekStart;
      // Original Colombo seed used Monday local midnight (Sunday 18:30 UTC).
      if (
        start.getUTCDay() === 0 &&
        start.getUTCHours() === 18 &&
        start.getUTCMinutes() === 30
      )
        start = new Date(start.getTime() + 330 * 60000);
      if (
        start.getUTCDay() !== 1 ||
        start.getUTCHours() !== 0 ||
        start.getUTCMinutes() !== 0
      )
        continue;
      const conflict = await tx.report.findFirst({
        where: {
          userId: report.userId,
          weekStart: start,
          id: { not: report.id },
        },
      });
      if (conflict)
        throw new Error(
          "Conflicting reporting weeks require manual review; no records were changed.",
        );
      const end = new Date(start.getTime() + 6 * DAY_MS);
      const changed =
        report.latestVersionNumber !== max ||
        report.weekStart.getTime() !== start.getTime() ||
        report.weekEnd.getTime() !== end.getTime();
      if (changed) {
        await tx.report.update({
          where: { id: report.id },
          data: { latestVersionNumber: max, weekStart: start, weekEnd: end },
        });
        repaired++;
      }
    }
  });
  console.log(
    `Repaired ${repaired} legacy demo report counters/date ranges. Historical snapshots were preserved; incomplete legacy snapshots are labeled in the UI.`,
  );
}
main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
