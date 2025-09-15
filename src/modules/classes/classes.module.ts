import { Module } from '@nestjs/common';

import { ClassesService } from './classes.service';
import { ClassesController } from './classes.controller';

@Module({
  controllers: [ClassesController],
  exports: [ClassesService],
  providers: [ClassesService],
})
export class ClassesModule {}
