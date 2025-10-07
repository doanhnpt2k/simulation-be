import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { QuestionService } from './question.service';
import {
  CreateQuestionDto,
  GetQuestionsDto,
  UpdateQuestionDto,
} from './question.dto';
import { ApiBaseQuery } from '@/utils/decorator/swagger.decorator';
import { AuthAdmin } from '@/utils/decorator/http.decorator';

@Controller({ version: '1', path: 'question' })
@ApiTags('Question')
@ApiBearerAuth()
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @ApiBaseQuery()
  @Get()
  getQuestions(@Query() dto: GetQuestionsDto) {
    return this.questionService.getQuestions(dto);
  }

  @Get(':id')
  getQuestionById(@Param('id') id: string) {
    return this.questionService.getQuestionById(id);
  }

  @AuthAdmin()
  @Post()
  createQuestion(@Body() dto: CreateQuestionDto) {
    return this.questionService.createQuestion(dto);
  }

  @AuthAdmin()
  @Patch(':id')
  updateQuestion(@Param('id') id: string, @Body() dto: UpdateQuestionDto) {
    return this.questionService.updateQuestion(id, dto);
  }

  @AuthAdmin()
  @Delete(':id')
  deleteQuestion(@Param('id') id: string) {
    return this.questionService.deleteQuestion(id);
  }
}
