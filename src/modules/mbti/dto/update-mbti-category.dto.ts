import { PartialType } from '@nestjs/swagger';
import { CreateMbtiCategoryDto } from './create-mbti-category.dto';
import { IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMbtiCategoryDto extends PartialType(CreateMbtiCategoryDto) {
  @ApiPropertyOptional({ description: 'Mô tả' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'URL ảnh' })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
