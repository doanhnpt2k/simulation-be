import { SWOTType } from '@/utils/enum/mbti-category.enum';
import { MbtiDescriptionType } from '@/utils/enum/mbti-category.enum';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BaseQueryDto } from '@/core/dto/base-query.dto';

export class GetPropertyDto extends BaseQueryDto {}

export class CreatePropertyDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(MbtiDescriptionType)
  descriptionType: MbtiDescriptionType;

  @IsEnum(SWOTType)
  swotType: SWOTType;

  @IsString()
  @IsNotEmpty()
  mbtiTypeId: string;
}

export class UpdatePropertyDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsEnum(MbtiDescriptionType)
  @IsOptional()
  descriptionType?: MbtiDescriptionType;

  @IsEnum(SWOTType)
  @IsOptional()
  swotType?: SWOTType;

  @IsString()
  @IsOptional()
  mbtiTypeId?: string;
}
