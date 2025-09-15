import { ApiProperty } from '@nestjs/swagger';
import { MbtiType } from '@/utils/enum/mbti-category.enum';

export class MbtiResultDto {
  @ApiProperty({
    description: 'ID của kết quả',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'MBTI type',
    enum: MbtiType,
    example: MbtiType.ENTJ,
  })
  mbtiType: MbtiType;

  @ApiProperty({
    description: 'Raw scores',
    type: 'object',
    properties: {
      E: { type: 'number' },
      I: { type: 'number' },
      S: { type: 'number' },
      N: { type: 'number' },
      T: { type: 'number' },
      F: { type: 'number' },
      J: { type: 'number' },
      P: { type: 'number' },
    },
  })
  scores: {
    E: number;
    I: number;
    S: number;
    N: number;
    T: number;
    F: number;
    J: number;
    P: number;
  };

  @ApiProperty({
    description: 'Percentages',
    type: 'object',
    properties: {
      E: { type: 'number' },
      I: { type: 'number' },
      S: { type: 'number' },
      N: { type: 'number' },
      T: { type: 'number' },
      F: { type: 'number' },
      J: { type: 'number' },
      P: { type: 'number' },
    },
  })
  percentages: {
    E: number;
    I: number;
    S: number;
    N: number;
    T: number;
    F: number;
    J: number;
    P: number;
  };

  @ApiProperty({
    description: 'Created at',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}
