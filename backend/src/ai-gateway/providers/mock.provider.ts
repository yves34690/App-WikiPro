import { Injectable } from '@nestjs/common';
import { BaseAIGatewayProvider } from './base.provider';
import { LLMProvider, LLMRequest, LLMResponse } from '../interfaces/llm-provider.interface';
import { ProviderStatus } from '../interfaces/health.interface';

@Injectable()
export class MockProvider extends BaseAIGatewayProvider {
  private readonly mockResponses: string[] = [
    'Voici une réponse générée par le mock provider de WikiPro. Cette réponse démontre le fonctionnement du système IA en mode développement.',
    'Le système WikiPro analyse votre demande et génère cette réponse contextuelle. En production, cette réponse proviendrait d\'un véritable modèle IA.',
    'Cette réponse simulée illustre les capacités de WikiPro. Le système peut traiter des requêtes complexes et fournir des réponses pertinentes.',
    'MockProvider WikiPro : Simulation d\'une réponse IA intelligente. Les vrais providers utiliseront OpenAI, Anthropic ou Gemini.',
    'Réponse générée par le mock intelligent de WikiPro. Cette simulation permet de tester l\'interface utilisateur avant l\'intégration des vrais LLM.',
  ];

  private readonly contextualResponses = {
    'analyse': 'Après analyse des données fournies, voici mes conclusions : [contenu d\'analyse simulée]',
    'résumé': 'Résumé exécutif : [synthèse simulée du contenu]',
    'recommandation': 'Mes recommandations basées sur l\'analyse : 1) [point 1], 2) [point 2], 3) [point 3]',
    'explication': 'Pour expliquer ce concept : [explication détaillée simulée]',
    'définition': 'Définition : [terme] signifie [définition simulée]',
    'comparaison': 'Comparaison entre les éléments : [analyse comparative simulée]',
    'évaluation': 'Évaluation des options : [critères d\'évaluation simulés]',
    'stratégie': 'Stratégie recommandée : [plan stratégique simulé]',
  };

  private readonly knowledgeBaseResponses = {
    'processus': 'Selon notre base de connaissances WikiPro, le processus standard comprend les étapes suivantes : [étapes simulées]',
    'méthode': 'Notre méthodologie éprouvée suggère : [méthodologie simulée]',
    'politique': 'Conformément à notre politique organisationnelle : [politique simulée]',
    'procédure': 'La procédure établie prévoit : [procédure simulée]',
    'référence': 'En référence aux projets similaires : [exemples simulés]',
    'compétence': 'Les compétences requises incluent : [compétences simulées]',
  };

  constructor() {
    super(LLMProvider.MOCK, {
      provider: LLMProvider.MOCK,
      defaultModel: 'mock-gpt-4',
      maxRetries: 2,
      timeoutMs: 3000,
      rateLimits: {
        requestsPerMinute: 1000,
        tokensPerMinute: 100000,
      },
    });
  }

  async initialize(): Promise<void> {
    this.logger.log('Initialisation du MockProvider WikiPro');
    // Simulation d'une initialisation
    await new Promise(resolve => setTimeout(resolve, 100));
    this.logger.log('MockProvider initialisé avec succès');
  }

  async generateResponse(request: LLMRequest): Promise<LLMResponse> {
    // Simuler une latence réaliste (1-3 secondes)
    const latency = Math.random() * 2000 + 1000;
    await new Promise(resolve => setTimeout(resolve, latency));

    // Analyser le prompt pour générer une réponse contextuelle
    const responseText = this.generateContextualResponse(request.prompt, request.context);
    
    // Calculer les tokens utilisés (simulation)
    const tokensUsed = Math.floor((request.prompt.length + responseText.length) / 4);

    // Simulation d'erreur occasionnelle (2% de chance)
    if (Math.random() < 0.02) {
      throw new Error('MockProvider : Erreur simulée pour tester la gestion d\'erreur');
    }

    return {
      text: responseText,
      tokensUsed,
      finishReason: 'stop',
      provider: this.provider,
      model: 'mock-gpt-4',
      responseTime: latency,
      metadata: {
        temperature: request.temperature || 0.7,
        maxTokens: request.maxTokens || 1000,
        contextAnalyzed: !!request.context,
        mockVersion: '1.0.0',
        confidenceScore: Math.random() * 0.3 + 0.7, // 70-100%
      },
    };
  }

  async healthCheck(): Promise<ProviderStatus> {
    // Simulation d'un health check parfait (c'est un mock)
    return {
      provider: this.provider,
      status: 'available',
      enabled: true,
      responseTime: Math.random() * 100 + 50, // 50-150ms
      errorRate: Math.random() * 2, // 0-2%
      lastCheck: new Date(),
      apiKeyValid: true,
      rateLimitStatus: {
        remaining: 9999,
        resetTime: new Date(Date.now() + 60000),
      },
      capabilities: [
        'text-generation',
        'chat-completion',
        'context-analysis',
        'french-language',
        'mock-responses',
      ],
      metadata: {
        mockProvider: true,
        version: '1.0.0',
        lastResponse: new Date(),
      },
    };
  }

  private generateContextualResponse(prompt: string, context?: string): string {
    const promptLower = prompt.toLowerCase();
    
    // Réponses basées sur le contexte fourni
    if (context && context.trim().length > 0) {
      const contextKeywords = this.extractKeywords(context.toLowerCase());
      const contextResponse = this.findBestContextualResponse(contextKeywords);
      if (contextResponse) {
        return `${contextResponse}\n\nContexte analysé : ${context.substring(0, 100)}${context.length > 100 ? '...' : ''}`;
      }
    }

    // Réponses basées sur les mots-clés dans le prompt
    const promptKeywords = this.extractKeywords(promptLower);
    
    // Vérifier les réponses de base de connaissances
    for (const [key, response] of Object.entries(this.knowledgeBaseResponses)) {
      if (promptKeywords.some(keyword => keyword.includes(key))) {
        return response;
      }
    }

    // Vérifier les réponses contextuelles
    for (const [key, response] of Object.entries(this.contextualResponses)) {
      if (promptKeywords.some(keyword => keyword.includes(key))) {
        return response;
      }
    }

    // Réponses spécialisées pour WikiPro
    if (promptKeywords.some(k => ['wikipro', 'organisation', 'entreprise', 'connaissance'].includes(k))) {
      return 'WikiPro est votre assistant IA pour la gestion des connaissances organisationnelles. Cette réponse démontre l\'intégration de votre base de connaissances avec l\'intelligence artificielle.';
    }

    if (promptKeywords.some(k => ['projet', 'référence', 'expérience'].includes(k))) {
      return 'Basé sur notre référentiel de projets, voici les éléments pertinents : [données de projet simulées avec métriques et retours d\'expérience]';
    }

    if (promptKeywords.some(k => ['compétence', 'expertise', 'savoir-faire'].includes(k))) {
      return 'Selon notre matrice de compétences WikiPro : [cartographie des expertises disponibles et recommandations de développement]';
    }

    if (promptKeywords.some(k => ['aide', 'support', 'comment', 'pourquoi', 'quoi'].includes(k))) {
      return 'Je suis là pour vous aider avec WikiPro. Voici les informations demandées : [réponse d\'aide contextuelle simulée]';
    }

    // Réponse par défaut aléatoire
    const randomIndex = Math.floor(Math.random() * this.mockResponses.length);
    return this.mockResponses[randomIndex];
  }

  private extractKeywords(text: string): string[] {
    // Extraire les mots significatifs (plus de 3 caractères)
    return text
      .split(/\s+/)
      .map(word => word.replace(/[^\w]/g, ''))
      .filter(word => word.length > 3)
      .slice(0, 10); // Limiter à 10 mots-clés
  }

  private findBestContextualResponse(keywords: string[]): string | null {
    for (const keyword of keywords) {
      for (const [key, response] of Object.entries(this.contextualResponses)) {
        if (keyword.includes(key)) {
          return response;
        }
      }
    }
    return null;
  }

  // Méthode pour enrichir les réponses en développement
  public addMockResponse(response: string): void {
    this.mockResponses.push(response);
    this.logger.log(`Nouvelle réponse mock ajoutée : ${response.substring(0, 50)}...`);
  }

  // Méthode pour obtenir les statistiques du mock
  public getMockStats(): {
    totalResponses: number;
    responseTypes: Record<string, number>;
    averageLatency: number;
  } {
    return {
      totalResponses: this.mockResponses.length,
      responseTypes: {
        default: this.mockResponses.length,
        contextual: Object.keys(this.contextualResponses).length,
        knowledgeBase: Object.keys(this.knowledgeBaseResponses).length,
      },
      averageLatency: this.metrics.averageResponseTime,
    };
  }
}