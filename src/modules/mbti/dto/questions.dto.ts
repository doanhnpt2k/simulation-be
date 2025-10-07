import {
  IsOptional,
  IsInt,
  IsString,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { MbtiCategory } from '@/utils/enum/mbti-category.enum';
import { BaseQueryDto } from '@/core/dto/base-query.dto';

export class GetQuestionsDto extends BaseQueryDto {}

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(MbtiCategory)
  @IsNotEmpty()
  category: MbtiCategory;

  @IsInt()
  order: number;

  @IsBoolean()
  isActive: boolean;
}

export class UpdateQuestionDto {
  @IsOptional()
  @IsString()
  content: string;

  @IsOptional()
  @IsEnum(MbtiCategory)
  category: MbtiCategory;

  @IsOptional()
  @IsInt()
  order: number;

  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}
