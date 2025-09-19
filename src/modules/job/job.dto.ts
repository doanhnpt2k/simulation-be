import { BaseQueryDto } from '@/core/dto/base-query.dto';
import { JobLevel, JobType } from '@/utils/enum/suitability.enum';
import { PartialType } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class GetJobDto extends BaseQueryDto {}

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(JobType)
  type: JobType;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsOptional()
  route: string;

  @IsNumber()
  @ValidateIf((o: CreateJobDto) => !o.maxSalary)
  @IsNotEmpty()
  minSalary: number;

  @IsNumber()
  @ValidateIf((o: CreateJobDto) => !o.minSalary)
  @IsNotEmpty()
  maxSalary: number;

  @IsEnum(JobLevel)
  @IsNotEmpty()
  level: JobLevel;

  @IsString()
  @IsNotEmpty()
  dayOff: string;

  @IsString()
  @IsNotEmpty()
  workingTime: string;

  @IsString()
  @IsOptional()
  benefit: string;
}

export class PartialUpdateSuitabilityJobDto extends PartialType(CreateJobDto) {}
