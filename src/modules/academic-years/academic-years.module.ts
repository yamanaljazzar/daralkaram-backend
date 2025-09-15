import { Module } from '@nestjs/common';

import { AcademicYearsService } from './academic-years.service';
import { AcademicYearsController } from './academic-years.controller';

@Module({
  controllers: [AcademicYearsController],
  exports: [AcademicYearsService],
  providers: [AcademicYearsService],
})
export class AcademicYearsModule {}
