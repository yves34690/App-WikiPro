import { Module } from '@nestjs/common';
import { TelemetryService } from './telemetry.service';
import { MetricsController } from './metrics.controller';
import { CoreConfigModule } from '@core/config/config.module';

@Module({
  imports: [CoreConfigModule],
  providers: [TelemetryService],
  controllers: [MetricsController],
  exports: [TelemetryService],
})
export class TelemetryModule {}