import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService, JwtPayload } from './auth.service';
import { ConfigService } from '@core/config/config.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  const mockConfigService = {
    security: {
      bcryptRounds: 10,
      jwtSecret: 'test-secret',
      jwtExpiration: '24h',
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should hash password', async () => {
    const password = 'test-password';
    const hash = await service.hashPassword(password);
    
    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
    expect(typeof hash).toBe('string');
  });

  it('should compare passwords correctly', async () => {
    const password = 'test-password';
    const hash = await service.hashPassword(password);
    
    const isValid = await service.comparePasswords(password, hash);
    expect(isValid).toBe(true);
    
    const isInvalid = await service.comparePasswords('wrong-password', hash);
    expect(isInvalid).toBe(false);
  });

  it('should generate tokens', async () => {
    const payload: JwtPayload = {
      sub: 'user-123',
      email: 'test@example.com',
      tenantId: 'tenant-123',
      roles: ['user'],
    };

    const result = await service.generateTokens(payload);
    
    expect(result).toHaveProperty('user');
    expect(result).toHaveProperty('accessToken', 'mock-jwt-token');
    expect(result.user.id).toBe(payload.sub);
    expect(result.user.email).toBe(payload.email);
    expect(result.user.tenantId).toBe(payload.tenantId);
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: payload.sub,
      email: payload.email,
      tenantId: payload.tenantId,
      roles: payload.roles,
    });
  });

  it('should validate user payload', async () => {
    const validPayload: JwtPayload = {
      sub: 'user-123',
      email: 'test@example.com',
      tenantId: 'tenant-123',
      roles: ['user'],
    };

    const result = await service.validateUser(validPayload);
    expect(result).toEqual(validPayload);
  });

  it('should reject invalid user payload', async () => {
    const invalidPayload: Partial<JwtPayload> = {
      sub: 'user-123',
      email: 'test@example.com',
      // tenantId manquant
      roles: ['user'],
    };

    await expect(service.validateUser(invalidPayload as JwtPayload))
      .rejects.toThrow('Payload JWT invalide');
  });

  it('should check roles correctly', () => {
    const user: JwtPayload = {
      sub: 'user-123',
      email: 'test@example.com',
      tenantId: 'tenant-123',
      roles: ['user', 'moderator'],
    };

    expect(service.hasRole(user, 'user')).toBe(true);
    expect(service.hasRole(user, 'moderator')).toBe(true);
    expect(service.hasRole(user, 'admin')).toBe(false);
    
    expect(service.hasAnyRole(user, ['admin', 'moderator'])).toBe(true);
    expect(service.hasAnyRole(user, ['admin', 'super-admin'])).toBe(false);
    
    expect(service.isAdmin(user)).toBe(false);
  });
});