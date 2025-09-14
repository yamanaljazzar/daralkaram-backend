import { Get, Controller } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  getHealth() {
    return {
      environment: process.env.NODE_ENV || 'development',
      name: process.env.APP_NAME,
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.APP_VERSION,
    };
  }
}
