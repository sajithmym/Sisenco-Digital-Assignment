"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const settings_1 = require("../src/settings");
const prisma = new client_1.PrismaClient();
async function hashPassword(password) {
    return bcrypt.hash(password, settings_1.AUTH_SETTINGS.passwordHashRounds);
}
async function main() {
    console.log('🌱 Seeding database...');
    const password = await hashPassword(settings_1.SEED_SETTINGS.defaultPassword);
    const manager = await prisma.user.upsert({
        where: { email: settings_1.SEED_SETTINGS.manager.email },
        update: {},
        create: {
            name: settings_1.SEED_SETTINGS.manager.name,
            email: settings_1.SEED_SETTINGS.manager.email,
            passwordHash: password,
            role: client_1.UserRole.MANAGER,
        },
    });
    const members = await Promise.all(settings_1.SEED_SETTINGS.members.map((m) => prisma.user.upsert({
        where: { email: m.email },
        update: {},
        create: {
            name: m.name,
            email: m.email,
            passwordHash: password,
            role: client_1.UserRole.TEAM_MEMBER,
        },
    })));
    console.log('✅ Users created');
    const projects = await Promise.all(settings_1.SEED_SETTINGS.projects.map((p) => prisma.project.create({ data: { name: p.name, description: p.description } })));
    console.log('✅ Projects created');
    const now = new Date();
    const getWeekStart = (weeksAgo) => {
        const d = new Date(now);
        d.setDate(d.getDate() - d.getDay() + 1 - weeksAgo * 7);
        d.setHours(0, 0, 0, 0);
        return d;
    };
    const getWeekEnd = (weekStart) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + 6);
        d.setHours(23, 59, 59, 999);
        return d;
    };
    for (const member of members) {
        for (let w = 0; w < settings_1.SEED_SETTINGS.weeksToSeed; w++) {
            const weekStart = getWeekStart(w);
            const weekEnd = getWeekEnd(weekStart);
            const status = w === 0
                ? client_1.ReportStatus.SUBMITTED
                : w === 1
                    ? client_1.ReportStatus.APPROVED
                    : w === 2
                        ? client_1.ReportStatus.DRAFT
                        : client_1.ReportStatus.NEEDS_CORRECTION;
            const report = await prisma.report.create({
                data: {
                    userId: member.id,
                    projectId: projects[w % projects.length].id,
                    weekStart,
                    weekEnd,
                    status,
                    notes: `Week ${w + 1} notes for ${member.name}`,
                    latestVersionNumber: w === 1 ? 2 : 1,
                    submittedAt: status !== client_1.ReportStatus.DRAFT ? weekEnd : null,
                    approvedAt: status === client_1.ReportStatus.APPROVED ? weekEnd : null,
                    tasks: {
                        create: [...settings_1.SEED_SETTINGS.seedTasks],
                    },
                    nextWeekTasks: {
                        create: [...settings_1.SEED_SETTINGS.seedNextWeekTasks],
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
                        create: [...settings_1.SEED_SETTINGS.seedWorkHours],
                    },
                },
                include: { tasks: true },
            });
            if (status !== client_1.ReportStatus.DRAFT) {
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
            if (status === client_1.ReportStatus.APPROVED || status === client_1.ReportStatus.NEEDS_CORRECTION) {
                const version = await prisma.reportVersion.findFirst({
                    where: { reportId: report.id, versionNumber: 1 },
                });
                await prisma.review.create({
                    data: {
                        reportId: report.id,
                        reportVersionId: version?.id,
                        reviewerId: manager.id,
                        action: status === client_1.ReportStatus.APPROVED
                            ? client_1.ReviewAction.APPROVED
                            : client_1.ReviewAction.CHANGES_REQUESTED,
                        comment: status === client_1.ReportStatus.APPROVED
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
//# sourceMappingURL=seed.js.map