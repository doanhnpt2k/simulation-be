import { ApiProperty } from '@nestjs/swagger';
import { MbtiResultDto } from './mbti-result.dto';

export class CompleteTestResponseDto {
  @ApiProperty({
    description: 'Thông báo hoàn thành test',
    example: 'Bài test đã được hoàn thành thành công',
  })
  message: string;

  @ApiProperty({
    description: 'Kết quả MBTI',
    type: MbtiResultDto,
  })
  result: MbtiResultDto;
}
