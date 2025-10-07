import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'John' })
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsDate()
  lastLoginAt?: Date | null;
}

export class UpdateUserMbtiDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsUUID()
  mbtiTypeId: string;

  @ApiProperty()
  @IsOptional()
  @IsDate()
  lastMbtiTestAt: Date | null;
}
export class UpdateUserSuitabilityDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsUUID()
  suitabilityTypeId: string;

  @ApiProperty()
  @IsOptional()
  @IsDate()
  lastSuitabilityTestAt: Date | null;
}
