import { TestStatus } from '@/utils/enum/mbti-category.enum';
import { PartialType } from '@nestjs/swagger';
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateTestDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  status: TestStatus;

  @IsNotEmpty()
  @IsDate()
  startedAt: Date;

  @IsOptional()
  @IsDate()
  completedAt: Date | null;
}

export class UpdateTestDto extends PartialType(CreateTestDto) {}
