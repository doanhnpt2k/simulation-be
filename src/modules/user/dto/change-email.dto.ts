import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeEmailDto {
  @ApiProperty({
    description: 'Email mới',
    example: 'newemail@example.com',
  })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty()
  newEmail: string;

  @ApiProperty({
    description: 'Mật khẩu hiện tại để xác thực',
    example: 'currentPassword123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
