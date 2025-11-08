import { Controller, Get, Head } from '@nestjs/common';

@Controller()
export class HealthController {
  // Responds to GET /api/health-check
  @Get('health-check')
  @Head('health-check')
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}