import {
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import * as bcrypt from "bcrypt";

describe('AuthService.refreshTokens', () => {
  const refreshToken = 'valid-refresh-token';
  const user = {
    id: 'user-1',
    email: 'member@example.com',
    role: 'TEAM_MEMBER',
    isActive: true,
  };

  const createService = () => {
    const transaction = {
      refreshToken: {
        deleteMany: jest.fn(),
        create: jest.fn(),
      },
    };
    const prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      refreshToken: {
        findUnique: jest.fn(),
        deleteMany: jest.fn(),
        create: jest.fn(),
      },
      $transaction: jest.fn((callback: (client: typeof transaction) => unknown) => callback(transaction)),
    };
    const jwtService = {
      verifyAsync: jest.fn(),
      signAsync: jest.fn(),
    };

    return {
      service: new AuthService(prisma as never, jwtService as never),
      prisma,
      transaction,
      jwtService,
    };
  };

  const createTokenRecord = (expiresAt = new Date(Date.now() + 60_000)) => ({
    id: 'token-1',
    userId: user.id,
    tokenHash: 'hashed-refresh-token',
    expiresAt,
    user,
  });

  it('rejects a refresh token that fails signature verification', async () => {
    const { service, prisma, jwtService } = createService();
    jwtService.verifyAsync.mockRejectedValue(new Error('invalid signature'));

    await expect(service.refreshTokens(refreshToken)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(prisma.refreshToken.findUnique).not.toHaveBeenCalled();
  });

  it('removes an expired token and returns an unauthorized response', async () => {
    const { service, prisma, jwtService } = createService();
    jwtService.verifyAsync.mockResolvedValue({ sub: user.id });
    prisma.refreshToken.findUnique.mockResolvedValue(createTokenRecord(new Date(Date.now() - 60_000)));

    await expect(service.refreshTokens(refreshToken)).rejects.toThrow('Refresh token expired');
    expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({ where: { id: 'token-1' } });
  });

  it('rejects a replayed token when another request has already consumed it', async () => {
    const { service, prisma, transaction, jwtService } = createService();
    jwtService.verifyAsync.mockResolvedValue({ sub: user.id });
    prisma.refreshToken.findUnique.mockResolvedValue(createTokenRecord());
    transaction.refreshToken.deleteMany.mockResolvedValue({ count: 0 });

    await expect(service.refreshTokens(refreshToken)).rejects.toThrow('Refresh token has already been used');
    expect(transaction.refreshToken.create).not.toHaveBeenCalled();
  });

  it('rotates a valid token after atomically consuming it', async () => {
    const { service, prisma, transaction, jwtService } = createService();
    jwtService.verifyAsync.mockResolvedValue({ sub: user.id });
    jwtService.signAsync.mockResolvedValueOnce('new-access-token').mockResolvedValueOnce('new-refresh-token');
    prisma.refreshToken.findUnique.mockResolvedValue(createTokenRecord());
    transaction.refreshToken.deleteMany.mockResolvedValue({ count: 1 });
    transaction.refreshToken.create.mockResolvedValue({});

    await expect(service.refreshTokens(refreshToken)).resolves.toEqual({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });
    expect(transaction.refreshToken.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ userId: user.id, tokenHash: expect.any(String) }),
    }));
  });

  it("normalizes registration data and rejects an existing email", async () => {
    const { service, prisma } = createService();
    const created = {
      id: "user-2",
      name: "New Member",
      email: "new@example.com",
      role: "TEAM_MEMBER",
      isActive: false,
      createdAt: new Date(),
    };
    prisma.user.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: "user-2" });
    prisma.user.create.mockResolvedValue(created);

    await expect(
      service.register({
        name: "  New Member  ",
        email: " NEW@EXAMPLE.COM ",
        password: "password123",
      }),
    ).resolves.toEqual({ user: created });
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "New Member",
          email: "new@example.com",
          isActive: false,
          passwordHash: expect.any(String),
        }),
      }),
    );
    await expect(
      service.register({
        name: "New Member",
        email: "new@example.com",
        password: "password123",
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("does not authenticate missing, inactive, or incorrectly authenticated accounts", async () => {
    const { service, prisma } = createService();
    const passwordHash = await bcrypt.hash("password123", 4);
    prisma.user.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ ...user, isActive: false, passwordHash })
      .mockResolvedValueOnce({ ...user, passwordHash });

    await expect(service.login(user.email, "password123")).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    await expect(service.login(user.email, "password123")).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    await expect(service.login(user.email, "incorrect-password")).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(prisma.refreshToken.create).not.toHaveBeenCalled();
  });

  it("invalidates all sessions when a refresh token belongs to a deactivated user", async () => {
    const { service, prisma, jwtService } = createService();
    jwtService.verifyAsync.mockResolvedValue({ sub: user.id });
    prisma.refreshToken.findUnique.mockResolvedValue({
      ...createTokenRecord(),
      user: { ...user, isActive: false },
    });

    await expect(service.refreshTokens(refreshToken)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
      where: { userId: user.id },
    });
  });

  it("returns the current user without credentials and clears refresh tokens on logout", async () => {
    const { service, prisma } = createService();
    const profile = {
      id: user.id,
      name: "Member",
      email: user.email,
      role: user.role,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    prisma.user.findUnique.mockResolvedValueOnce(profile).mockResolvedValueOnce(null);

    await expect(service.getMe(user.id)).resolves.toBe(profile);
    await expect(service.getMe("missing")).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    await service.logout(refreshToken);
    expect(prisma.refreshToken.deleteMany).toHaveBeenLastCalledWith({
      where: { tokenHash: expect.any(String) },
    });
  });
});
