import { Module, forwardRef } from '@nestjs/common';

import { DatabaseModule } from '@/database';
import { GuardiansModule } from '@/modules/guardians/guardians.module';
import { EnrollmentsModule } from '@/modules/enrollments/enrollments.module';

import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';

@Module({
  controllers: [StudentsController],
  exports: [StudentsService],
  imports: [DatabaseModule, GuardiansModule, forwardRef(() => EnrollmentsModule)],
  providers: [StudentsService],
})
export class StudentsModule {}
