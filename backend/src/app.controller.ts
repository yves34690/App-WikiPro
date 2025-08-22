import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
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
    return this.appService.getHealth();
  }

  @Get('ping')
  @ApiOperation({ summary: 'Ping endpoint' })
  @ApiResponse({ status: 200, description: 'Pong response' })
  ping(): { message: string } {
    return this.appService.ping();
  }
}