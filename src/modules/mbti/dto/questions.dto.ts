import { IsOptional, IsInt, IsString, IsBoolean } from 'class-validator';
import { MbtiCategory } from '@/utils/enum/mbti-category.enum';
import { BaseQueryDto } from '@/core/dto/base-query.dto';

export class GetQuestionsDto extends BaseQueryDto {}

export class CreateQuestionDto {
  @IsString()
  content: string;

  @IsString()
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
  @IsString()
  category: MbtiCategory;

  @IsOptional()
  @IsInt()
  order: number;

  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}
