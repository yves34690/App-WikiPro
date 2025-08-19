import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService as NestConfigService } from '@nestjs/config';
import { ConfigService } from './config.service';

describe('ConfigService', () => {
  let service: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true, // Pour les tests
        }),
      ],
      providers: [ConfigService],
    }).compile();

    service = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return default port', () => {
    expect(service.port).toBe(3001);
  });

  it('should return test as node env in test environment', () => {
    expect(service.nodeEnv).toBe('test');
  });

  it('should return default cors origins', () => {
    const origins = service.corsOrigins;
    expect(origins).toContain('http://localhost:3000');
  });

  it('should return database config with defaults', () => {
    const dbConfig = service.database;
    
    expect(dbConfig).toHaveProperty('host', 'localhost');
    expect(dbConfig).toHaveProperty('port', 5432);
    expect(dbConfig).toHaveProperty('username', 'postgres');
    expect(dbConfig).toHaveProperty('database', 'wikipro');
  });

  it('should return security config with defaults', () => {
    const securityConfig = service.security;
    
    expect(securityConfig).toHaveProperty('jwtSecret');
    expect(securityConfig).toHaveProperty('jwtExpiration', '24h');
    expect(securityConfig).toHaveProperty('bcryptRounds', 12);
  });

  it('should return AI config with defaults', () => {
    const aiConfig = service.ai;
    
    expect(aiConfig).toHaveProperty('geminiModel', 'gemini-2.5-flash-002');
    expect(aiConfig).toHaveProperty('maxTokens', 4096);
    expect(aiConfig).toHaveProperty('temperature', 0.7);
  });

  it('should identify test environment correctly', () => {
    expect(service.isDevelopment).toBe(false);
    expect(service.isProduction).toBe(false);
  });
});