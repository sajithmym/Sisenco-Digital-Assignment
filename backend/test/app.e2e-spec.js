const { Test } = require("@nestjs/testing");
const { JwtService } = require("@nestjs/jwt");
const { ValidationPipe } = require("@nestjs/common");
const request = require("supertest");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const { AppModule } = require("../src/app.module");
const { PrismaService } = require("../src/database/prisma.service");
const { GlobalExceptionFilter } = require("../src/common/filters");
const { ReportsService } = require("../src/reports/reports.service");
const { AUTH_SETTINGS } = require("../src/settings");

describe("HTTP authorization, reports, and dashboard with an isolated PostgreSQL schema", () => {
  let app,
    prisma,
    http,
    member,
    other,
    manager,
    admin,
    project,
    tokens,
    reportId;
  const dates = { weekStart: "2026-08-31", weekEnd: "2026-09-06" };
  const task = {
    taskName: "Deliver feature",
    status: "DONE",
    plannedPercentage: 80,
    actualPercentage: 100,
    plannedMinutes: 90,
    actualMinutes: 80,
    deliverable: "Release evidence",
  };
  const auth = (role) => ({ Authorization: `Bearer ${tokens[role]}` });
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix("api/v1");
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();
    http = app.getHttpServer();
    prisma = app.get(PrismaService);
    const passwordHash = await bcrypt.hash("password123", 4);
    [member, other, manager, admin] = await Promise.all(
      ["TEAM_MEMBER", "TEAM_MEMBER", "MANAGER", "ADMIN"].map((role, index) =>
        prisma.user.create({
          data: {
            name: `Fixture ${index}`,
            email: `fixture${index}@example.invalid`,
            passwordHash,
            role,
          },
        }),
      ),
    );
    project = await prisma.project.create({
      data: { name: "Fixture project" },
    });
    const jwt = new JwtService({ secret: AUTH_SETTINGS.jwtAccessSecret });
    tokens = Object.fromEntries(
      [
        ["member", member],
        ["other", other],
        ["manager", manager],
        ["admin", admin],
      ].map(([key, user]) => [
        key,
        jwt.sign({ sub: user.id, email: user.email, role: user.role }),
      ]),
    );
  });
  afterAll(async () => {
    if (app) await app.close();
  });

  it("rejects anonymous access, member manager-access, and manager admin-access", async () => {
    await request(http).get("/api/v1/reports/my").expect(401);
    await request(http)
      .get("/api/v1/manager/reports")
      .set(auth("member"))
      .expect(403);
    await request(http)
      .patch(`/api/v1/users/${other.id}/role`)
      .set(auth("manager"))
      .send({ role: "ADMIN" })
      .expect(403);
    await request(http)
      .post("/api/v1/projects")
      .set(auth("member"))
      .send({ name: "Forbidden project" })
      .expect(403);
    await request(http)
      .post("/api/v1/users")
      .set(auth("admin"))
      .send({
        name: "Invited user",
        email: "invited@example.invalid",
        password: "password123",
        role: "MANAGER",
      })
      .expect(201);
  });

  it("creates private drafts and rejects blank fields/null arrays", async () => {
    await request(http)
      .post("/api/v1/reports")
      .set(auth("member"))
      .send({ ...dates, tasks: [{ taskName: "  " }] })
      .expect(400);
    const response = await request(http)
      .post("/api/v1/reports")
      .set(auth("member"))
      .send({
        ...dates,
        projectId: project.id,
        tasks: [task],
        nextWeekTasks: [{ description: "Next delivery" }],
        notes: "Original notes",
      })
      .expect(201);
    reportId = response.body.data.id;
    await request(http)
      .get(`/api/v1/reports/${reportId}`)
      .set(auth("other"))
      .expect(403);
    await request(http)
      .get(`/api/v1/manager/reports/${reportId}`)
      .set(auth("manager"))
      .expect(403);
    const list = await request(http)
      .get("/api/v1/manager/reports")
      .set(auth("manager"))
      .expect(200);
    expect(list.body.data).toEqual([]);
    await request(http)
      .patch(`/api/v1/reports/${reportId}`)
      .set(auth("member"))
      .send({ tasks: null })
      .expect(400);
    await request(http)
      .patch(`/api/v1/reports/${reportId}`)
      .set(auth("manager"))
      .send({ notes: "Forbidden edit" })
      .expect(403);
  });

  it("tracks draft/not-started metadata without leaking draft content", async () => {
    const roster = await request(http)
      .get("/api/v1/manager/dashboard/roster")
      .query(dates)
      .set(auth("manager"))
      .expect(200);
    expect(
      roster.body.data.find((row) => row.userId === member.id),
    ).toMatchObject({ status: "DRAFT", reportId: null });
    expect(
      roster.body.data.find((row) => row.userId === other.id),
    ).toMatchObject({ status: "NOT_STARTED", reportId: null });
    expect(JSON.stringify(roster.body)).not.toContain("Original notes");
    const summary = await request(http)
      .get("/api/v1/manager/dashboard/summary")
      .query(dates)
      .set(auth("manager"))
      .expect(200);
    expect(summary.body.data).toMatchObject({
      complianceRate: 0,
      pendingCount: 2,
      submittedCount: 0,
    });
  });

  it("completes correction/resubmission/approval and preserves full versions with associated comments", async () => {
    await request(http)
      .post(`/api/v1/reports/${reportId}/submit`)
      .set(auth("member"))
      .expect(200);
    await request(http)
      .patch(`/api/v1/reports/${reportId}`)
      .set(auth("member"))
      .send({ notes: "Locked" })
      .expect(403);
    await request(http)
      .post(`/api/v1/manager/reports/${reportId}/request-changes`)
      .set(auth("manager"))
      .send({ comment: " " })
      .expect(400);
    await request(http)
      .post(`/api/v1/manager/reports/${reportId}/request-changes`)
      .set(auth("manager"))
      .send({ comment: "Please improve the output." })
      .expect(200);
    await request(http)
      .patch(`/api/v1/reports/${reportId}`)
      .set(auth("member"))
      .send({ notes: "Revised notes" })
      .expect(200);
    await request(http)
      .post(`/api/v1/reports/${reportId}/submit`)
      .set(auth("member"))
      .expect(200);
    await request(http)
      .post(`/api/v1/manager/reports/${reportId}/approve`)
      .set(auth("manager"))
      .expect(200);
    await request(http)
      .post(`/api/v1/manager/reports/${reportId}/approve`)
      .set(auth("manager"))
      .expect(400);
    await request(http)
      .patch(`/api/v1/reports/${reportId}`)
      .set(auth("member"))
      .send({ notes: "Locked" })
      .expect(403);
    const result = await request(http)
      .get(`/api/v1/manager/reports/${reportId}`)
      .set(auth("manager"))
      .expect(200);
    expect(result.body.data.versions).toHaveLength(2);
    expect(result.body.data.versions[0].snapshotJson.notes).toBe(
      "Revised notes",
    );
    expect(result.body.data.versions[1].snapshotJson).toMatchObject({
      notes: "Original notes",
      tasks: [task],
      nextWeekTasks: [{ description: "Next delivery" }],
    });
    expect(
      result.body.data.reviews.find(
        (review) => review.action === "CHANGES_REQUESTED",
      ).reportVersion.versionNumber,
    ).toBe(1);
    expect(
      result.body.data.reviews.find((review) => review.action === "APPROVED")
        .reportVersion.versionNumber,
    ).toBe(2);
    const summary = await request(http)
      .get("/api/v1/manager/dashboard/summary")
      .query(dates)
      .set(auth("manager"))
      .expect(200);
    expect(summary.body.data).toMatchObject({
      submittedCount: 1,
      approvedCount: 1,
      expectedCount: 2,
      complianceRate: 50,
    });
  });

  it("supports project clearing and corrections retaining archived projects", async () => {
    const created = await request(http)
      .post("/api/v1/reports")
      .set(auth("other"))
      .send({ ...dates, projectId: project.id, tasks: [task] })
      .expect(201);
    const id = created.body.data.id;
    const cleared = await request(http)
      .patch(`/api/v1/reports/${id}`)
      .set(auth("other"))
      .send({ projectId: null })
      .expect(200);
    expect(cleared.body.data.projectId).toBeNull();
    await request(http)
      .post(`/api/v1/reports/${id}/submit`)
      .set(auth("other"))
      .expect(400);
    await request(http)
      .patch(`/api/v1/reports/${id}`)
      .set(auth("other"))
      .send({ projectId: project.id })
      .expect(200);
    await request(http)
      .delete(`/api/v1/projects/${project.id}`)
      .set(auth("manager"))
      .expect(200);
    await request(http)
      .patch(`/api/v1/reports/${id}`)
      .set(auth("other"))
      .send({ projectId: project.id, notes: "Still editable" })
      .expect(200);
    const workload = await request(http)
      .get("/api/v1/manager/dashboard/project-workload")
      .query(dates)
      .set(auth("manager"))
      .expect(200);
    expect(workload.body.data[0].projectName).toContain("(archived)");
    expect(workload.body.data[0].reportCount).toBe(1);
  });

  it("issues unique real refresh tokens, rejects replay, and logs out", async () => {
    const credentials = { email: member.email, password: "password123" };
    const first = await request(http)
      .post("/api/v1/auth/login")
      .send(credentials)
      .expect(200);
    const second = await request(http)
      .post("/api/v1/auth/login")
      .send(credentials)
      .expect(200);
    const cookie = (response) =>
      response.headers["set-cookie"][0].split(";")[0];
    expect(cookie(first)).not.toBe(cookie(second));
    expect(first.headers["set-cookie"][0]).toContain("HttpOnly");
    expect(first.body.data.refreshToken).toBeUndefined();
    const rotated = await request(http)
      .post("/api/v1/auth/refresh")
      .set("Cookie", cookie(first))
      .set(AUTH_SETTINGS.csrfHeaderName, AUTH_SETTINGS.csrfHeaderValue)
      .expect(200);
    expect(cookie(rotated)).not.toBe(cookie(first));
    await request(http)
      .post("/api/v1/auth/refresh")
      .set("Cookie", cookie(first))
      .set(AUTH_SETTINGS.csrfHeaderName, AUTH_SETTINGS.csrfHeaderValue)
      .expect(401);
    await request(http)
      .post("/api/v1/auth/logout")
      .set("Cookie", cookie(rotated))
      .set(AUTH_SETTINGS.csrfHeaderName, AUTH_SETTINGS.csrfHeaderValue)
      .expect(200);
    await request(http)
      .post("/api/v1/auth/refresh")
      .set("Cookie", cookie(rotated))
      .set(AUTH_SETTINGS.csrfHeaderName, AUTH_SETTINGS.csrfHeaderValue)
      .expect(401);
  });

  it("rechecks editability after waiting for a concurrent transition row lock", async () => {
    const draft = await prisma.report.findFirstOrThrow({
      where: { userId: other.id },
    });
    let locked, release;
    const acquired = new Promise((resolve) => {
      locked = resolve;
    });
    const gate = new Promise((resolve) => {
      release = resolve;
    });
    const transition = prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM reports WHERE id = ${draft.id} FOR UPDATE`;
      locked();
      await gate;
      await tx.report.update({
        where: { id: draft.id },
        data: { status: "SUBMITTED" },
      });
    });
    await acquired;
    const editing = app
      .get(ReportsService)
      .update(draft.id, other.id, {
        notes: "Must not overwrite submitted content",
      });
    const rejected = expect(editing).rejects.toMatchObject({ status: 403 });
    release();
    await transition;
    await rejected;
    expect(
      (await prisma.report.findUnique({ where: { id: draft.id } })).notes,
    ).toBe("Still editable");
  });

  it("seeds complete version histories and an admin idempotently on the migrated database", async () => {
    const { execFileSync } = require("node:child_process");
    const path = require("node:path");
    for (let index = 0; index < 2; index++)
      execFileSync(
        process.execPath,
        ["-r", "ts-node/register", "prisma/seed.ts"],
        { cwd: path.resolve(__dirname, ".."), env: process.env, stdio: "pipe" },
      );
    expect(
      (await prisma.user.findUnique({ where: { email: "admin@example.com" } }))
        .role,
    ).toBe("ADMIN");
    const demo = await prisma.report.findMany({
      where: {
        user: {
          email: {
            in: [
              "kasun@example.com",
              "ayesha@example.com",
              "mohamed@example.com",
              "nimal@example.com",
            ],
          },
        },
      },
      include: { versions: true },
    });
    expect(demo).toHaveLength(16);
    for (const report of demo) {
      expect(report.latestVersionNumber).toBe(
        Math.max(0, ...report.versions.map((version) => version.versionNumber)),
      );
      for (const version of report.versions)
        expect(version.snapshotJson.nextWeekTasks).toHaveLength(3);
    }
    expect(
      demo.find((report) => report.status === "APPROVED").versions,
    ).toHaveLength(2);
  });
});
