import { Get, UseGuards, Controller } from '@nestjs/common';

import { UserRole } from '@prisma/client';

import { RolesGuard } from '@/core/guards';
import { JwtAuthGuard } from '@/modules/auth/guards';
import { UserResponseDto } from '@/modules/users/dto';
import { Roles, CurrentUser } from '@/core/decorators';

@Controller('demo')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DemoController {
  // Example 1: Only ADMIN can access
  @Get('admin-only')
  @Roles(UserRole.ADMIN)
  adminOnly(@CurrentUser() user: UserResponseDto) {
    return {
      message: 'This endpoint is only accessible by ADMIN users',
      user: {
        id: user.id,
        role: user.role,
      },
    };
  }

  // Example 2: TEACHER and SUPERVISOR can access, but not GUARDIAN
  @Get('staff-only')
  @Roles(UserRole.TEACHER, UserRole.SUPERVISOR)
  staffOnly(@CurrentUser() user: UserResponseDto) {
    return {
      message: 'This endpoint is accessible by TEACHER and SUPERVISOR users',
      user: {
        id: user?.id,
        role: user?.role,
      },
    };
  }

  // Example 3: All authenticated users can access
  @Get('authenticated')
  authenticatedUser(@CurrentUser() user: UserResponseDto) {
    return {
      message: 'This endpoint is accessible by all authenticated users',
      user: {
        id: user.id,
        role: user.role,
      },
    };
  }

  // Example 4: Only GUARDIAN can access
  @Get('guardian-only')
  @Roles(UserRole.GUARDIAN)
  guardianOnly(@CurrentUser() user: UserResponseDto) {
    return {
      message: 'This endpoint is only accessible by GUARDIAN users',
      user: {
        id: user.id,
        role: user.role,
      },
    };
  }

  // Example 5: ADMIN and SUPERVISOR can access
  @Get('management-only')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  managementOnly(@CurrentUser() user: UserResponseDto) {
    return {
      message: 'This endpoint is accessible by ADMIN and SUPERVISOR users',
      user: {
        id: user.id,
        role: user.role,
      },
    };
  }
}
