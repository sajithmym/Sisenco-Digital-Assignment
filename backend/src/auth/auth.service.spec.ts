import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

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
});
