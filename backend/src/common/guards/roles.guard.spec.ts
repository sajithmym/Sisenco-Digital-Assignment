import { ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RolesGuard } from "./roles.guard";
import { Roles } from "../decorators/roles.decorator";
import { UserRole } from "../enums";

class ProtectedFixture {
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  review() {
    return true;
  }
}
describe("Role authorization", () => {
  const guard = new RolesGuard(new Reflector());
  const context = (role?: UserRole) =>
    ({
      getHandler: () => ProtectedFixture.prototype.review,
      getClass: () => ProtectedFixture,
      switchToHttp: () => ({
        getRequest: () => ({ user: role ? { role } : undefined }),
      }),
    }) as unknown as ExecutionContext;
  it("rejects unauthenticated requests", () =>
    expect(() => guard.canActivate(context())).toThrow(
      "Authentication required",
    ));
  it("rejects members from review endpoints", () =>
    expect(() => guard.canActivate(context(UserRole.TEAM_MEMBER))).toThrow(
      "Access denied",
    ));
  it.each([UserRole.MANAGER, UserRole.ADMIN])("allows %s to review", (role) =>
    expect(guard.canActivate(context(role))).toBe(true),
  );
});
