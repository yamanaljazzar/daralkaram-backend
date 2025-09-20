import { BooleanQuery } from '@/common/decorators';

export class FindClassTemplatesQueryDto {
  @BooleanQuery({
    defaultValue: false,
    message: 'Include archived must be a boolean value',
  })
  includeArchived?: boolean;
}
