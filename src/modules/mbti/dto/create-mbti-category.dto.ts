import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, IsUrl } from 'class-validator';

export class CreateMbtiCategoryDto {
  @ApiProperty({ description: 'Tên category (unique)', example: 'E_I' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Mô tả', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'URL ảnh (nếu đã có)', required: false })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
