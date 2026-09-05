import { JwtService } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { PrismaService } from "../database/prisma.service";
import * as bcrypt from "bcrypt";
import { AUTH_SETTINGS } from "../settings";

describe("Real JWT token issuance", () => {
  it("issues different refresh tokens within one second and uses configured expiry", async () => {
    const passwordHash = await bcrypt.hash("password123", 4);
    const records: Array<{ tokenHash: string; expiresAt: Date }> = [];
    const prisma = {
      user: {
        findUnique: async () => ({
          id: "member",
          email: "member@example.invalid",
          role: "TEAM_MEMBER",
          isActive: true,
          passwordHash,
        }),
      },
      refreshToken: {
        deleteMany: async () => ({ count: 0 }),
        create: async ({ data }: { data: (typeof records)[number] }) =>
          records.push(data),
      },
    };
    const jwt = new JwtService({ secret: "unit-test-access-secret" });
    const service = new AuthService(prisma as unknown as PrismaService, jwt);
    const clock = jest.spyOn(Date, "now").mockReturnValue(1800000000000);
    try {
      const first = await service.login(
        "member@example.invalid",
        "password123",
      );
      const second = await service.login(
        "member@example.invalid",
        "password123",
      );
      expect(first.refreshToken).not.toBe(second.refreshToken);
      expect(records[0].tokenHash).not.toBe(records[1].tokenHash);
      expect(records[0].expiresAt.getTime()).toBe(
        Date.now() + AUTH_SETTINGS.refreshCookie.maxAge,
      );
      expect(jwt.decode(first.refreshToken)).toMatchObject({
        jti: expect.any(String),
      });
    } finally {
      clock.mockRestore();
    }
  });
});
