import { BooleanQuery } from '@/common/decorators';

export class FindAcademicYearsQueryDto {
  @BooleanQuery({
    defaultValue: false,
    message: 'Active must be a boolean value',
  })
  active?: boolean;
}
