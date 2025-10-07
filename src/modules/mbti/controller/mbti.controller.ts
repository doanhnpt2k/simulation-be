import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { MbtiService } from '../mbti.service';
import { CompleteTestResponseDto } from '../dto/complete-test.dto';
import { MbtiResultDto } from '../dto/mbti-result.dto';
import { SubmitTestDto } from '../dto/submit-test.dto';
import type { AuthenticatedRequest } from '../../user/interfaces/authenticated-request.interface';
import { AuthAdmin } from '@/utils/decorator/http.decorator';
import { JwtAuthGuard } from '@/utils/guards';
import { ApiBaseQuery } from '@/utils/decorator/swagger.decorator';

@Controller({ version: '1', path: 'mbti' })
@ApiTags('MBTI Q&A')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MbtiController {
  constructor(private readonly mbtiService: MbtiService) {}

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

  @AuthAdmin()
  @ApiOperation({ summary: 'Get all MBTI results of user (Admin Only)' })
  @ApiResponse({
    status: 200,
    description: 'All MBTI results',
    type: [MbtiResultDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBaseQuery()
  @Get('results')
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
