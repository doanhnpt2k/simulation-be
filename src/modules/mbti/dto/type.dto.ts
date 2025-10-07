import { BaseQueryDto } from '@/core/dto/base-query.dto';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  IsArray,
  IsUUID,
} from 'class-validator';

export class GetMbtiTypesDto extends BaseQueryDto {}

export class CreateMbtiTypeDto {
  @ApiProperty({ description: 'Type name', example: 'E_I' })
  @IsString()
  @MaxLength(6)
  name: string;

  @ApiProperty({ description: 'Full name', example: 'Extraversion' })
  @IsString()
  @MaxLength(120)
  fullName: string;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Image URL', required: false })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({
    description: 'Danh sách ID của MBTI properties',
    type: [String],
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '987fcdeb-51a2-43d1-b789-123456789abc',
    ],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  mbtiPropertyIds?: string[];
}

export class UpdateMbtiTypeDto extends PartialType(CreateMbtiTypeDto) {
  @ApiPropertyOptional({ description: 'Type name' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({ description: 'Full name' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  fullName?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Image URL' })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'MBTI properties',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  mbtiPropertyIds?: string[];
}
