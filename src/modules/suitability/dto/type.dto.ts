import { BaseQueryDto } from '@/core/dto/base-query.dto';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsArray, IsString, IsUUID, MaxLength } from 'class-validator';

export class GetSuitabilityTypesDto extends BaseQueryDto {}

export class CreateSuitabilityTypeDto {
  @ApiProperty({ description: 'Type name' })
  @IsString()
  @MaxLength(6)
  name: string;

  @ApiProperty({ description: 'Full name' })
  @IsString()
  @MaxLength(120)
  fullName: string;

  @ApiProperty({ description: 'Description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'job ids' })
  @IsArray()
  @IsUUID('4', { each: true })
  jobIds: string[];
}

export class UpdateSuitabilityTypeDto extends PartialType(
  CreateSuitabilityTypeDto,
) {}
