import { UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtAuthGuard } from "./jwt-auth.guard";

describe("JwtAuthGuard", () => {
  const guard = new JwtAuthGuard(new Reflector());

  it("returns authenticated users and preserves underlying guard errors", () => {
    const user = { sub: "user-1", email: "member@example.com", role: "TEAM_MEMBER" };
    expect(guard.handleRequest(null, user, undefined)).toBe(user);
    const error = new UnauthorizedException("custom failure");
    expect(() => guard.handleRequest(error, undefined, undefined)).toThrow(error);
  });

  it.each([
    ["jwt expired", "Session expired. Please log in again."],
    ["No auth token", "Authentication token is missing."],
    ["invalid token", "invalid token"],
    [undefined, "Unauthorized."],
  ])("translates authentication failure %#", (source, message) => {
    expect(() => guard.handleRequest(null, undefined, { message: source })).toThrow(
      message,
    );
  });
});
