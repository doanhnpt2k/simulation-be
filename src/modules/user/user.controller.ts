import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import type { AuthenticatedRequest } from './interfaces/authenticated-request.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '@/utils/guards';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('/v1/user')
@ApiTags('User')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('update-profile')
  @ApiOperation({ summary: 'Update profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 400,
    description: 'Invalid data',
  })
  updateProfile(
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.updateUser(req.user.userId, dto);
  }

  @Post('request-validate')
  @ApiOperation({ summary: 'Request validate token' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  requestValidateToken(@Request() req: AuthenticatedRequest) {
    return this.userService.requestValidateToken(req.user.userId);
  }

  @Post('change-password')
  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.OK)
  validateToken(
    @Request() req: AuthenticatedRequest,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(req.user.userId, dto);
  }
}
