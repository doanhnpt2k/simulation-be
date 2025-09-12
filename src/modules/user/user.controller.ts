import { Controller, Inject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';

@Controller('/v1/user')
@ApiTags('User')
export class UserController {
  @Inject(UserService)
  private readonly userService: UserService;
}
