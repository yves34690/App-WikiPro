import { Test, TestingModule } from '@nestjs/testing';
import { RegistryService } from './registry.service';
import { BaseProvider, ProviderConfig } from '@shared/interfaces/provider.interface';

class MockProvider extends BaseProvider {
  readonly capabilities = { textGeneration: true };

  constructor(config: ProviderConfig) {
    super(config);
  }

  get name(): string {
    return this.config.name;
  }

  get version(): string {
    return this.config.version;
  }

  async initialize(): Promise<void> {
    // Mock implementation
  }

  async healthCheck(): Promise<boolean> {
    return this.config.enabled;
  }

  getMetrics() {
    return this.metrics;
  }
}

describe('RegistryService', () => {
  let service: RegistryService;
  let mockProvider: MockProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RegistryService],
    }).compile();

    service = module.get<RegistryService>(RegistryService);

    const config: ProviderConfig = {
      name: 'mock-provider',
      version: '1.0.0',
      enabled: true,
      priority: 100,
    };

    mockProvider = new MockProvider(config);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should register a provider', () => {
    service.register('test-type', 'mock-provider', mockProvider, mockProvider.config);
    
    const retrieved = service.get('test-type', 'mock-provider');
    expect(retrieved).toBe(mockProvider);
  });

  it('should unregister a provider', () => {
    service.register('test-type', 'mock-provider', mockProvider, mockProvider.config);
    
    const unregistered = service.unregister('test-type', 'mock-provider');
    expect(unregistered).toBe(true);
    
    const retrieved = service.get('test-type', 'mock-provider');
    expect(retrieved).toBeNull();
  });

  it('should return providers by type', () => {
    service.register('test-type', 'mock-provider', mockProvider, mockProvider.config);
    
    const providers = service.getByType('test-type');
    expect(providers).toHaveLength(1);
    expect(providers[0]).toBe(mockProvider);
  });

  it('should return best provider', async () => {
    const config1: ProviderConfig = {
      name: 'provider-1',
      version: '1.0.0',
      enabled: true,
      priority: 50,
    };
    
    const config2: ProviderConfig = {
      name: 'provider-2',
      version: '1.0.0',
      enabled: true,
      priority: 100,
    };

    const provider1 = new MockProvider(config1);
    const provider2 = new MockProvider(config2);

    service.register('test-type', 'provider-1', provider1, config1);
    service.register('test-type', 'provider-2', provider2, config2);

    // Effectuer un health check pour marquer les providers comme sains
    await service.healthCheck();

    const best = service.getBest('test-type');
    expect(best).toBe(provider2); // Plus haute priorité
  });

  it('should return provider types', () => {
    service.register('type-1', 'provider-1', mockProvider, mockProvider.config);
    service.register('type-2', 'provider-2', mockProvider, mockProvider.config);

    const types = service.getProviderTypes();
    expect(types).toContain('type-1');
    expect(types).toContain('type-2');
  });

  it('should perform health check', async () => {
    service.register('test-type', 'mock-provider', mockProvider, mockProvider.config);
    
    const results = await service.healthCheck();
    
    expect(results.has('test-type:mock-provider')).toBe(true);
    expect(results.get('test-type:mock-provider')).toBe(true);
  });
});