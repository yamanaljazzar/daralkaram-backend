import { Module } from '@nestjs/common';

import { GuardiansService } from './guardians.service';
import { GuardiansController } from './guardians.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  controllers: [GuardiansController],
  exports: [GuardiansService],
  imports: [DatabaseModule],
  providers: [GuardiansService],
})
export class GuardiansModule {}
