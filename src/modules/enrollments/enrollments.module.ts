import { Module, forwardRef } from '@nestjs/common';

import { DatabaseModule } from '@/database';
import { ClassesModule } from '@/modules/classes/classes.module';
import { StudentsModule } from '@/modules/students/students.module';

import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';

@Module({
  controllers: [EnrollmentsController],
  exports: [EnrollmentsService],
  imports: [DatabaseModule, forwardRef(() => StudentsModule), ClassesModule],
  providers: [EnrollmentsService],
})
export class EnrollmentsModule {}
