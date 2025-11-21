import { IsString, IsBoolean } from 'class-validator';

import { CreateGuardianDto } from '@/modules/guardians/dto';

export class GuardianInputDto extends CreateGuardianDto {
  @IsString()
  relationToChild: string;

  @IsBoolean()
  createLoginAccount: boolean;
}
