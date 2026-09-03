import { PrismaClient, UserRole, ReportStatus, ReviewAction } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { SEED_SETTINGS, AUTH_SETTINGS } from '../src/settings';

const prisma = new PrismaClient();

async function hashPassword(password: string) {
  return bcrypt.hash(password, AUTH_SETTINGS.passwordHashRounds);
}

async function main() {
  console.log('🌱 Seeding database...');

  const password = await hashPassword(SEED_SETTINGS.defaultPassword);

  // ─── Users ─────────────────────────────────────────────
  const manager = await prisma.user.upsert({
    where: { email: SEED_SETTINGS.manager.email },
    update: {},
    create: {
      name: SEED_SETTINGS.manager.name,
      email: SEED_SETTINGS.manager.email,
      passwordHash: password,
      role: UserRole.MANAGER,
    },
  });

  const members = await Promise.all(
    SEED_SETTINGS.members.map((m) =>
      prisma.user.upsert({
        where: { email: m.email },
        update: {},
        create: {
          name: m.name,
          email: m.email,
          passwordHash: password,
          role: UserRole.TEAM_MEMBER,
        },
      }),
    ),
  );

  console.log('✅ Users created');

  // ─── Projects ──────────────────────────────────────────
  const projects = await Promise.all(
    SEED_SETTINGS.projects.map((p) =>
      prisma.project.create({ data: { name: p.name, description: p.description } }),
    ),
  );

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
    for (let w = 0; w < SEED_SETTINGS.weeksToSeed; w++) {
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
          submittedAt: status !== ReportStatus.DRAFT ? weekEnd : null,
          approvedAt: status === ReportStatus.APPROVED ? weekEnd : null,
          tasks: {
            create: [...SEED_SETTINGS.seedTasks],
          },
          nextWeekTasks: {
            create: [...SEED_SETTINGS.seedNextWeekTasks],
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
            create: [...SEED_SETTINGS.seedWorkHours],
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
