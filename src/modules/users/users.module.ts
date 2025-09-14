import { Module } from '@nestjs/common';

import { DatabaseModule } from '@/database';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  controllers: [UsersController],
  exports: [UsersService],
  imports: [DatabaseModule],
  providers: [UsersService],
})
export class UsersModule {}
