import { ApiProperty } from '@nestjs/swagger';

export class QuestionDto {
  @ApiProperty({
    description: 'ID of question',
  })
  id: string;

  @ApiProperty({
    description: 'Content of question',
  })
  content: string;

  @ApiProperty({
    description: 'Category of question',
  })
  category: string;

  @ApiProperty({
    description: 'Order of question',
  })
  order: number;
}

export class PaginationMetaDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class PaginatedQuestionsDto {
  @ApiProperty({
    description: 'List of questions',
    type: [QuestionDto],
  })
  data: QuestionDto[];

  @ApiProperty({
    description: 'Pagination meta',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto;
}
