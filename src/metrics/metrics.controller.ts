import { Controller, Get, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { MetricsService } from './metrics.service';

@Controller()
export class MetricsController {
  constructor(private readonly metrics: MetricsService) {}

  @Get('/metrics')
  async getMetrics(@Res({ passthrough: true }) res: FastifyReply): Promise<string> {
    res.header('Content-Type', this.metrics.contentType());
    return this.metrics.metrics();
  }
}
