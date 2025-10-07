import { SWOTType } from '@/utils/enum/mbti-category.enum';
import { MbtiDescriptionType } from '@/utils/enum/mbti-category.enum';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BaseQueryDto } from '@/core/dto/base-query.dto';
import { ApiProperty } from '@nestjs/swagger';

export class GetPropertyDto extends BaseQueryDto {}

export class CreatePropertyDto {
  @ApiProperty({ example: 'title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'content' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    example: MbtiDescriptionType.PERSONALITY,
    enum: MbtiDescriptionType,
  })
  @IsEnum(MbtiDescriptionType)
  descriptionType: MbtiDescriptionType;

  @ApiProperty({ example: SWOTType.STRENGTH, enum: SWOTType })
  @IsEnum(SWOTType)
  swotType: SWOTType;
}

export class UpdatePropertyDto {
  @ApiProperty({ example: 'title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ example: 'content' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({
    example: MbtiDescriptionType.PERSONALITY,
    enum: MbtiDescriptionType,
  })
  @IsEnum(MbtiDescriptionType)
  @IsOptional()
  descriptionType?: MbtiDescriptionType;

  @ApiProperty({ example: SWOTType.STRENGTH, enum: SWOTType })
  @IsEnum(SWOTType)
  @IsOptional()
  swotType?: SWOTType;
}
