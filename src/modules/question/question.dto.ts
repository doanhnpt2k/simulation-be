import { BaseQueryDto } from '@/core/dto/base-query.dto';
import { MbtiCategory, QuestionType } from '@/utils/enum/mbti-category.enum';
import { SuitabilityType } from '@/utils/enum/suitability.enum';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { IsQuestionTypeValid } from '@/utils/validators/question-type.validator';

export class GetQuestionsDto extends BaseQueryDto {
  @ApiProperty({ enum: QuestionType })
  @IsEnum(QuestionType)
  @IsOptional()
  type: QuestionType;
}

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsBoolean()
  isActive: boolean;

  @IsInt()
  order: number;

  @IsEnum(QuestionType)
  @IsNotEmpty()
  type: QuestionType;

  @IsEnum(MbtiCategory)
  @IsNotEmpty()
  @IsQuestionTypeValid()
  mbtiType: MbtiCategory;

  @IsEnum(SuitabilityType)
  @IsNotEmpty()
  @IsQuestionTypeValid()
  suitabilityType: SuitabilityType;
}

export class UpdateQuestionDto extends PartialType(CreateQuestionDto) {}
