import { Module } from '@nestjs/common';

import { ClassesService } from './classes.service';
import { UsersModule } from '../users/users.module';
import { ClassesController } from './classes.controller';
import { AcademicYearsModule } from '../academic-years/academic-years.module';
import { ClassTemplatesModule } from '../class-templates/class-templates.module';

@Module({
  controllers: [ClassesController],
  exports: [ClassesService],
  imports: [AcademicYearsModule, ClassTemplatesModule, UsersModule],
  providers: [ClassesService],
})
export class ClassesModule {}
