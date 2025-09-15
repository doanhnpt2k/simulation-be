import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { MbtiService } from './mbti.service';
import { JwtAuthGuard } from '../../utils/guards/jwt.guard';
import { CompleteTestResponseDto } from './dto/complete-test.dto';
import { MbtiResultDto } from './dto/mbti-result.dto';
import { SubmitTestDto } from './dto/submit-test.dto';
import { GetQuestionsDto } from './dto/get-questions.dto';
import { PaginatedQuestionsDto } from './dto/paginated-questions.dto';
import type { AuthenticatedRequest } from '../user/interfaces/authenticated-request.interface';
import { AuthAdmin } from '@/utils/decorator/http.decorator';

@Controller('/v1/mbti')
@ApiTags('MBTI')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MbtiController {
  constructor(private readonly mbtiService: MbtiService) {}

  //Get all questions MBTI
  @Get('questions')
  @ApiOperation({ summary: 'Get alls MBTI questions' })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: PaginatedQuestionsDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getQuestions(@Query() getQuestionsDto: GetQuestionsDto) {
    return this.mbtiService.getQuestions(getQuestionsDto);
  }

  //Submit MBTI test
  @Post('test')
  @ApiOperation({
    summary: 'Submit MBTI test',
  })
  @ApiResponse({
    status: 201,
    description: 'Submit MBTI test successfully',
    type: CompleteTestResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 400,
    description: 'Invalid data or not answered all questions',
  })
  async submitTest(
    @Request() req: AuthenticatedRequest,
    @Body() submitTestDto: SubmitTestDto,
  ) {
    return this.mbtiService.submitTest(req.user.userId, submitTestDto);
  }

  //Get all MBTI results of user (Admin Only)
  @Get('results')
  @AuthAdmin()
  @ApiOperation({ summary: 'Get all MBTI results of user (Admin Only)' })
  @ApiResponse({
    status: 200,
    description: 'All MBTI results',
    type: [MbtiResultDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserResults(@Request() req: AuthenticatedRequest) {
    return this.mbtiService.getUserResults(req.user.userId);
  }
  // Get my results
  @Get('my-result')
  @ApiOperation({ summary: 'Get my MBTI results' })
  @ApiResponse({
    status: 200,
    description: 'My MBTI results',
    type: [MbtiResultDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyResults(@Request() req: AuthenticatedRequest) {
    const result = await this.mbtiService.getUserResults(req.user.userId);
    return result[0];
  }

  //Get MBTI result detail
  @Get('results/:resultId')
  @ApiOperation({ summary: 'Get MBTI result detail' })
  @ApiParam({
    name: 'resultId',
    description: 'ID of MBTI result',
    example: '123e4567-e89b-12d3-a456-4266224aaa20',
  })
  @ApiResponse({
    status: 200,
    description: 'MBTI result detail',
    type: MbtiResultDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'MBTI result not found' })
  async getResultById(
    @Param('resultId') resultId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.mbtiService.getResultById(resultId, req.user.userId);
  }
}
