import {
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsString,
  IsUUID,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AnswerDto {
  @ApiProperty()
  @IsString()
  @IsUUID()
  questionId: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  @Max(6)
  score: number;
}

export class SubmitTestSuiDto {
  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  @ArrayMinSize(1, { message: 'Phải có ít nhất 1 câu trả lời' })
  answers: AnswerDto[];
}
