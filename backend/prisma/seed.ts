import { PrismaClient, UserRole, Prisma, Project, User } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { SEED_SETTINGS, AUTH_SETTINGS } from "../src/settings";
import { ReportsService } from "../src/reports/reports.service";
import { ReportWorkflowService } from "../src/reports/report-workflow.service";
import { PrismaService } from "../src/database/prisma.service";
import { DAY_MS, weekOf } from "../src/reports/report-date";

const prisma = new PrismaClient();
async function main() {
  if (process.env.NODE_ENV === "production")
    throw new Error("Seeding is disabled in production.");
  const passwordHash = await bcrypt.hash(
    SEED_SETTINGS.defaultPassword,
    AUTH_SETTINGS.passwordHashRounds,
  );
  const accounts = [
    {
      name: "Demo Administrator",
      email: "admin@example.com",
      role: UserRole.ADMIN,
    },
    { ...SEED_SETTINGS.manager, role: UserRole.MANAGER },
    ...SEED_SETTINGS.members.map((member) => ({
      ...member,
      role: UserRole.TEAM_MEMBER,
    })),
  ];
  const users: User[] = [];
  for (const account of accounts) {
    users.push(
      await prisma.user.upsert({
        where: { email: account.email },
        update: {},
        create: { ...account, passwordHash },
      }),
    );
  }
  const manager = users.find(
    (user) => user.email === SEED_SETTINGS.manager.email,
  )!;
  const projects: Project[] = [];
  for (const project of SEED_SETTINGS.projects)
    projects.push(
      (await prisma.project.findFirst({ where: { name: project.name } })) ||
        (await prisma.project.create({ data: project })),
    );

  for (const member of users.filter((user) => user.role === "TEAM_MEMBER")) {
    for (let offset = 0; offset < 5; offset++) {
      if (
        offset === 4 &&
        (await prisma.reportVersion.count({
          where: { versionNumber: 2, report: { userId: member.id } },
        }))
      )
        continue;
      const approvedDemo = offset === 1 || offset === 4;
      const weekStart = new Date(weekOf().getTime() - offset * 7 * DAY_MS);
      const weekEnd = new Date(weekStart.getTime() + 6 * DAY_MS);
      if (
        await prisma.report.findUnique({
          where: { userId_weekStart: { userId: member.id, weekStart } },
        })
      )
        continue;
      await prisma.$transaction(async (tx) => {
        // Nested services share one transaction so a seed report cannot be left half-created.
        const client = {
          report: tx.report,
          project: tx.project,
          reportVersion: tx.reportVersion,
          review: tx.review,
          $transaction: (
            callback: (transaction: Prisma.TransactionClient) => unknown,
          ) => callback(tx),
        } as unknown as PrismaService;
        const reports = new ReportsService(client);
        const workflow = new ReportWorkflowService(client);
        const report = await reports.create(member.id, {
          weekStart: weekStart.toISOString().slice(0, 10),
          weekEnd: weekEnd.toISOString().slice(0, 10),
          projectId: projects[offset % projects.length].id,
          notes: `Week ${offset + 1} notes for ${member.name}`,
          tasks: SEED_SETTINGS.seedTasks.map((task) => ({ ...task })),
          nextWeekTasks: SEED_SETTINGS.seedNextWeekTasks.map((task) => ({
            ...task,
          })),
          blockers: [
            {
              description: "Waiting for client API credentials",
              isKeyIssue: true,
              isResolved: offset !== 0,
            },
          ],
          achievements: [
            {
              description: "Completed the planned delivery",
              isKeyAchievement: true,
            },
          ],
          workHours: SEED_SETTINGS.seedWorkHours.map((hour) => ({ ...hour })),
        });
        if (offset === 2) return;
        await workflow.submit(report.id, member.id);
        if (approvedDemo || offset === 3)
          await workflow.requestChanges(
            report.id,
            manager.id,
            "Please add the delivery verification details.",
          );
        if (approvedDemo) {
          await reports.update(report.id, member.id, {
            notes: "Delivery verified and documented after manager feedback.",
          });
          await workflow.submit(report.id, member.id);
          await workflow.approve(report.id, manager.id);
        }
        // Historical demo events happen within their reporting week, never in the future.
        const firstSubmission = new Date(
          Math.min(Date.now(), weekStart.getTime() + 4 * DAY_MS),
        );
        const versions = await tx.reportVersion.findMany({
          where: { reportId: report.id },
          orderBy: { versionNumber: "asc" },
        });
        for (const version of versions) {
          const timestamp = new Date(
            Math.min(
              Date.now(),
              firstSubmission.getTime() + (version.versionNumber - 1) * 3600000,
            ),
          );
          await tx.reportVersion.update({
            where: { id: version.id },
            data: { submittedAt: timestamp },
          });
          await tx.review.updateMany({
            where: { reportVersionId: version.id },
            data: { createdAt: timestamp },
          });
        }
        const latest = new Date(
          Math.min(
            Date.now(),
            firstSubmission.getTime() + (versions.length - 1) * 3600000,
          ),
        );
        await tx.report.update({
          where: { id: report.id },
          data: {
            submittedAt: latest,
            approvedAt: approvedDemo ? latest : null,
          },
        });
      });
    }
  }
  console.log(
    "Seed ready: admin, manager, four members, four reporting weeks, and a complete two-version correction example.",
  );
}
main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
