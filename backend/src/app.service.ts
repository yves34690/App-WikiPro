import { Injectable, Optional } from '@nestjs/common';
import { AIHealthService } from './ai-gateway/health/ai-health.service';
import { AIConfigService } from './ai-gateway/config/ai-config.service';

@Injectable()
export class AppService {
  constructor(
    @Optional() private aiHealthService?: AIHealthService,
    @Optional() private aiConfigService?: AIConfigService,
  ) {}

  async getHealth(): Promise<{
    status: string;
    timestamp: string;
    version: string;
    ai?: {
      status: string;
      providers: number;
      activeProvider: string;
      lastCheck?: string;
    };
  }> {
    const baseHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };

    // Si l'AI Gateway n'est pas configuré, on retourne juste le health de base
    if (!this.aiHealthService || !this.aiConfigService) {
      return baseHealth;
    }

    try {
      // Récupération du statut IA
      const aiSummary = this.aiHealthService.getHealthSummary();
      const lastReport = this.aiHealthService.getLastHealthReport();

      const aiHealth = {
        status: aiSummary.status,
        providers: aiSummary.availableProviders,
        activeProvider: aiSummary.activeProvider,
        lastCheck: lastReport?.timestamp?.toISOString(),
      };

      // Le statut global est degraded si l'IA est unhealthy
      const globalStatus = aiSummary.status === 'unhealthy' ? 'degraded' : 'healthy';

      return {
        ...baseHealth,
        status: globalStatus,
        ai: aiHealth,
      };
    } catch (error) {
      // En cas d'erreur avec l'IA, on retourne le health de base avec un warning
      return {
        ...baseHealth,
        status: 'degraded',
        ai: {
          status: 'error',
          providers: 0,
          activeProvider: 'none',
          lastCheck: undefined,
        },
      };
    }
  }

  ping(): { message: string } {
    return { message: 'pong' };
  }
}