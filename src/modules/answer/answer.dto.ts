import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateAnswerDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  testId: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  questionId: string;

  @IsNotEmpty()
  @IsNumber()
  score: number;
}
