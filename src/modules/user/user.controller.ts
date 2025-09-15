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
import { JwtAuthGuard } from '../../utils/guards/jwt.guard';
import type { AuthenticatedRequest } from './interfaces/authenticated-request.interface';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('/v1/user')
@ApiTags('User')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('update-profile')
  @ApiOperation({ summary: 'Cập nhật profile (email và/hoặc mật khẩu)' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 400,
    description:
      'Dữ liệu không hợp lệ, mật khẩu không đúng, email đã tồn tại hoặc không có dữ liệu để cập nhật',
  })
  updateProfile(
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.updateUser(req.user.userId, dto);
  }
}
