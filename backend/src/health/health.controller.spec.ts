import { HealthController } from "./health.controller";

describe("HealthController", () => {
  it("reports connected and degraded database states without throwing", async () => {
    const prisma = { $queryRaw: jest.fn().mockResolvedValue([{ "?column?": 1 }]) };
    const controller = new HealthController(prisma as never);

    await expect(controller.check()).resolves.toMatchObject({
      success: true,
      data: { status: "ok", database: "connected" },
    });

    prisma.$queryRaw.mockRejectedValueOnce(new Error("connection lost"));
    await expect(controller.check()).resolves.toMatchObject({
      success: true,
      data: { status: "error", database: "disconnected" },
    });
  });
});
