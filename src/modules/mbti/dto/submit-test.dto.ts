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
  @ApiProperty({
    description: 'ID của câu hỏi',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsUUID()
  questionId: string;

  @ApiProperty({
    description: 'Điểm số từ -3-3 (-3: rất không đồng ý, 3: rất đồng ý)',
    example: 2,
    minimum: -3,
    maximum: 3,
  })
  @IsInt()
  @Min(-3)
  @Max(3)
  score: number;
}

export class SubmitTestDto {
  @ApiProperty({
    description: 'Mảng các câu trả lời',
    type: [AnswerDto],
    minItems: 1,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  @ArrayMinSize(1, { message: 'Phải có ít nhất 1 câu trả lời' })
  answers: AnswerDto[];
}
