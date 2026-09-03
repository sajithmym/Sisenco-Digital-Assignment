import { PrismaClient, UserRole, ReportStatus, ReviewAction } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log('🌱 Seeding database...');

  const password = await hashPassword('password123');

  // ─── Users ─────────────────────────────────────────────
  const manager = await prisma.user.upsert({
    where: { email: 'sarah@example.com' },
    update: {},
    create: {
      name: 'Sarah Fernando',
      email: 'sarah@example.com',
      passwordHash: password,
      role: UserRole.MANAGER,
    },
  });

  const members = await Promise.all([
    prisma.user.upsert({
      where: { email: 'kasun@example.com' },
      update: {},
      create: {
        name: 'Kasun Silva',
        email: 'kasun@example.com',
        passwordHash: password,
        role: UserRole.TEAM_MEMBER,
      },
    }),
    prisma.user.upsert({
      where: { email: 'ayesha@example.com' },
      update: {},
      create: {
        name: 'Ayesha Perera',
        email: 'ayesha@example.com',
        passwordHash: password,
        role: UserRole.TEAM_MEMBER,
      },
    }),
    prisma.user.upsert({
      where: { email: 'mohamed@example.com' },
      update: {},
      create: {
        name: 'Mohamed Rizwan',
        email: 'mohamed@example.com',
        passwordHash: password,
        role: UserRole.TEAM_MEMBER,
      },
    }),
    prisma.user.upsert({
      where: { email: 'nimal@example.com' },
      update: {},
      create: {
        name: 'Nimal Jayasinghe',
        email: 'nimal@example.com',
        passwordHash: password,
        role: UserRole.TEAM_MEMBER,
      },
    }),
  ]);

  console.log('✅ Users created');

  // ─── Projects ──────────────────────────────────────────
  const projects = await Promise.all([
    prisma.project.create({
      data: { name: 'Client Portal', description: 'Client-facing web portal' },
    }),
    prisma.project.create({
      data: { name: 'Internal ERP', description: 'Internal enterprise resource planning system' },
    }),
    prisma.project.create({
      data: { name: 'Mobile Application', description: 'Cross-platform mobile app' },
    }),
    prisma.project.create({
      data: { name: 'Research & Development', description: 'R&D projects and experiments' },
    }),
  ]);

  console.log('✅ Projects created');

  // ─── Reports ───────────────────────────────────────────
  const now = new Date();
  const getWeekStart = (weeksAgo: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - d.getDay() + 1 - weeksAgo * 7);
    d.setHours(0, 0, 0, 0);
    return d;
  };
  const getWeekEnd = (weekStart: Date) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 6);
    d.setHours(23, 59, 59, 999);
    return d;
  };

  // Create reports for each member across several weeks
  for (const member of members) {
    for (let w = 0; w < 4; w++) {
      const weekStart = getWeekStart(w);
      const weekEnd = getWeekEnd(weekStart);
      const status =
        w === 0
          ? ReportStatus.SUBMITTED
          : w === 1
          ? ReportStatus.APPROVED
          : w === 2
          ? ReportStatus.DRAFT
          : ReportStatus.NEEDS_CORRECTION;

      const report = await prisma.report.create({
        data: {
          userId: member.id,
          projectId: projects[w % projects.length].id,
          weekStart,
          weekEnd,
          status,
          notes: `Week ${w + 1} notes for ${member.name}`,
          latestVersionNumber: w === 1 ? 2 : 1,
          submittedAt: [ReportStatus.SUBMITTED, ReportStatus.APPROVED, ReportStatus.NEEDS_CORRECTION].includes(status) ? weekEnd : null,
          approvedAt: status === ReportStatus.APPROVED ? weekEnd : null,
          tasks: {
            create: [
              {
                taskName: 'Feature development',
                priority: 'HIGH',
                plannedPercentage: 60,
                actualPercentage: 55,
                status: 'DONE',
                plannedMinutes: 480,
                actualMinutes: 440,
                deliverable: 'Implemented feature X',
              },
              {
                taskName: 'Code review',
                priority: 'MEDIUM',
                plannedPercentage: 20,
                actualPercentage: 25,
                status: 'DONE',
                plannedMinutes: 160,
                actualMinutes: 200,
              },
              {
                taskName: 'Bug fixes',
                priority: 'LOW',
                plannedPercentage: 20,
                actualPercentage: 20,
                status: 'IN_PROGRESS',
                plannedMinutes: 160,
                actualMinutes: 160,
              },
            ],
          },
          nextWeekTasks: {
            create: [
              { description: 'Continue feature development', sortOrder: 0 },
              { description: 'Write unit tests', sortOrder: 1 },
              { description: 'Update documentation', sortOrder: 2 },
            ],
          },
          blockers: {
            create: [
              {
                description: 'Waiting for API credentials from client',
                isKeyIssue: w === 0,
                isResolved: w !== 0,
              },
            ],
          },
          achievements: {
            create: [
              {
                description: 'Completed sprint backlog ahead of schedule',
                isKeyAchievement: w === 1,
              },
            ],
          },
          workHours: {
            create: [
              { type: 'DEVELOPMENT', minutes: 480 },
              { type: 'TESTING', minutes: 120 },
              { type: 'MEETINGS', minutes: 60 },
              { type: 'DOCUMENTATION', minutes: 60 },
            ],
          },
        },
        include: { tasks: true },
      });

      // Create version snapshots
      if (status !== ReportStatus.DRAFT) {
        await prisma.reportVersion.create({
          data: {
            reportId: report.id,
            versionNumber: 1,
            snapshotJson: {
              reportId: report.id,
              tasks: report.tasks.map((t) => ({ taskName: t.taskName })),
              weekStart,
              weekEnd,
            },
            createdById: member.id,
          },
        });
      }

      // Create reviews for non-draft reports
      if (status === ReportStatus.APPROVED || status === ReportStatus.NEEDS_CORRECTION) {
        const version = await prisma.reportVersion.findFirst({
          where: { reportId: report.id, versionNumber: 1 },
        });

        await prisma.review.create({
          data: {
            reportId: report.id,
            reportVersionId: version?.id,
            reviewerId: manager.id,
            action:
              status === ReportStatus.APPROVED
                ? ReviewAction.APPROVED
                : ReviewAction.CHANGES_REQUESTED,
            comment:
              status === ReportStatus.APPROVED
                ? 'Good work this week!'
                : 'Please provide more details on the blockers section.',
          },
        });
      }
    }
  }

  console.log('✅ Reports, versions, and reviews created');
  console.log('🎉 Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
