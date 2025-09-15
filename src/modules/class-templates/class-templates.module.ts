import { Module } from '@nestjs/common';

import { ClassTemplatesService } from './class-templates.service';
import { ClassTemplatesController } from './class-templates.controller';

@Module({
  controllers: [ClassTemplatesController],
  exports: [ClassTemplatesService],
  providers: [ClassTemplatesService],
})
export class ClassTemplatesModule {}
