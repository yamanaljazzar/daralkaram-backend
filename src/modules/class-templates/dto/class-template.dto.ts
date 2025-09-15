import { IsString, IsNotEmpty } from 'class-validator';

export class CreateClassTemplateDto {
  @IsNotEmpty({ message: 'Class template name is required' })
  @IsString({ message: 'Class template name must be a string' })
  name: string;
}

export class UpdateClassTemplateDto {
  @IsNotEmpty({ message: 'Class template name is required' })
  @IsString({ message: 'Class template name must be a string' })
  name: string;
}

export class ClassTemplateResponseDto {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
}
