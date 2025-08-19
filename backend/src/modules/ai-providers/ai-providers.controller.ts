import { Controller, Post, Get, Body, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AiProvidersService } from './ai-providers.service';
import { 
  TextGenerationRequest,
  ChatCompletionRequest 
} from '@shared/interfaces/ai-provider.interface';
import { JwtPayload } from '@core/auth/auth.service';

@ApiTags('AI Providers')
@Controller('ai')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class AiProvidersController {
  constructor(private aiProvidersService: AiProvidersService) {}

  @Post('generate-text')
  @ApiOperation({ summary: 'Générer du texte via IA' })
  @ApiResponse({ status: 200, description: 'Texte généré avec succès' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 404, description: 'Provider non disponible' })
  async generateText(
    @Request() req,
    @Body() body: TextGenerationRequest & { provider?: string },
  ) {
    const user: JwtPayload = req.user;
    
    const { provider, ...request } = body;
    
    return this.aiProvidersService.generateText(
      user.tenantId,
      request,
      provider
    );
  }

  @Post('chat-completion')
  @ApiOperation({ summary: 'Completion de chat via IA' })
  @ApiResponse({ status: 200, description: 'Chat complété avec succès' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  @ApiResponse({ status: 404, description: 'Provider non disponible' })
  async chatCompletion(
    @Request() req,
    @Body() body: ChatCompletionRequest & { provider?: string },
  ) {
    const user: JwtPayload = req.user;
    
    const { provider, ...request } = body;
    
    return this.aiProvidersService.chatCompletion(
      user.tenantId,
      request,
      provider
    );
  }

  @Get('providers')
  @ApiOperation({ summary: 'Lister les providers IA disponibles' })
  @ApiResponse({ status: 200, description: 'Liste des providers' })
  getProviders(@Query('type') type?: string) {
    return {
      providers: this.aiProvidersService.getAvailableProviders(type),
    };
  }

  @Post('test-provider')
  @ApiOperation({ summary: 'Tester un provider IA spécifique' })
  @ApiResponse({ status: 200, description: 'Résultat du test' })
  async testProvider(
    @Request() req,
    @Body() body: { type: string; name: string },
  ) {
    const user: JwtPayload = req.user;
    
    return this.aiProvidersService.testProvider(
      user.tenantId,
      body.type,
      body.name
    );
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check des services IA' })
  @ApiResponse({ status: 200, description: 'Service opérationnel' })
  getAiHealth() {
    const providers = this.aiProvidersService.getAvailableProviders();
    
    return {
      status: 'healthy',
      service: 'ai-providers',
      providersCount: providers.length,
      enabledProviders: providers.filter(p => p.enabled).length,
    };
  }
}