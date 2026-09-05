import { HttpStatus, ServiceUnavailableException } from "@nestjs/common";
import { HealthController } from "./health.controller";

describe("HealthController", () => {
  it("reports a connected database", async () => {
    const prisma = {
      $queryRaw: jest.fn().mockResolvedValue([{ "?column?": 1 }]),
    };
    const controller = new HealthController(prisma as never);

    await expect(controller.check()).resolves.toMatchObject({
      success: true,
      data: { status: "ok", database: "connected" },
    });
  });

  it("returns 503 when the database probe fails", async () => {
    const prisma = {
      $queryRaw: jest.fn().mockRejectedValue(new Error("connection lost")),
    };
    const controller = new HealthController(prisma as never);

    await controller.check().catch((error: unknown) => {
      expect(error).toBeInstanceOf(ServiceUnavailableException);
      expect((error as ServiceUnavailableException).getStatus()).toBe(
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    });
  });
});
