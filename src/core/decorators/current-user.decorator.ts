import { ExecutionContext, createParamDecorator } from '@nestjs/common';

import { type UserResponseDto } from '@/modules/users/dto';

interface RequestWithUser {
  user?: UserResponseDto;
}

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<RequestWithUser>();
  const { user } = request;

  if (data && user) {
    return user[data as keyof UserResponseDto];
  }

  return user;
});
