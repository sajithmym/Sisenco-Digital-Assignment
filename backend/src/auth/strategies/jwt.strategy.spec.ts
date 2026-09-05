import { UnauthorizedException } from "@nestjs/common";

jest.mock("@nestjs/passport", () => ({
  PassportStrategy: () => class {},
}));

import { JwtStrategy } from "./jwt.strategy";

describe("JwtStrategy", () => {
  it("uses the current active database user instead of trusting stale token claims", async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: "user-1",
          email: "current@example.com",
          role: "MANAGER",
          isActive: true,
        }),
      },
    };
    const strategy = new JwtStrategy(prisma as never);

    await expect(
      strategy.validate({ sub: "user-1", email: "stale@example.com", role: "TEAM_MEMBER" }),
    ).resolves.toEqual({
      sub: "user-1",
      email: "current@example.com",
      role: "MANAGER",
    });
  });

  it.each([null, { id: "user-1", isActive: false }])(
    "rejects missing or inactive users",
    async (user) => {
      const prisma = { user: { findUnique: jest.fn().mockResolvedValue(user) } };
      const strategy = new JwtStrategy(prisma as never);

      await expect(
        strategy.validate({ sub: "user-1", email: "member@example.com", role: "TEAM_MEMBER" }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    },
  );
});
