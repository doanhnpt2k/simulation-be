import { ApiProperty } from '@nestjs/swagger';

export class QuestionDto {
  @ApiProperty({
    description: 'ID của câu hỏi',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Nội dung câu hỏi',
    example: 'Bạn thích dành thời gian với nhiều người hơn là một mình',
  })
  content: string;

  @ApiProperty({
    description: 'Category của câu hỏi',
    example: 'E_I',
  })
  category: string;

  @ApiProperty({
    description: 'Thứ tự câu hỏi',
    example: 1,
  })
  order: number;
}

export class PaginationMetaDto {
  @ApiProperty({
    description: 'Trang hiện tại',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Số lượng item mỗi trang',
    example: 20,
  })
  limit: number;

  @ApiProperty({
    description: 'Tổng số item',
    example: 20,
  })
  total: number;

  @ApiProperty({
    description: 'Tổng số trang',
    example: 1,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Có trang tiếp theo không',
    example: false,
  })
  hasNext: boolean;

  @ApiProperty({
    description: 'Có trang trước không',
    example: false,
  })
  hasPrev: boolean;
}

export class PaginatedQuestionsDto {
  @ApiProperty({
    description: 'Danh sách câu hỏi',
    type: [QuestionDto],
  })
  data: QuestionDto[];

  @ApiProperty({
    description: 'Thông tin phân trang',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto;
}
