import { BaseQueryDto } from '@/core/dto/base-query.dto';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class GetMbtiTypesDto extends BaseQueryDto {}

export class CreateMbtiTypeDto {
  @ApiProperty({ description: 'Type name', example: 'E_I' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Image URL', required: false })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}

export class UpdateMbtiTypeDto extends PartialType(CreateMbtiTypeDto) {
  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Image URL' })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
