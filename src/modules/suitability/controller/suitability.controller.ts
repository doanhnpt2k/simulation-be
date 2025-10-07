import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { SuitabilityService } from '../suitability.service';
import { SubmitTestSuiDto } from '../dto/submitTest.dto';
import { SuitabilityResultDto } from '../dto/result.dto';
import type { AuthenticatedRequest } from '@/modules/user/interfaces/authenticated-request.interface';
import { JwtAuthGuard } from '@/utils/guards';
//import { AuthAdmin } from '@/utils/decorator/http.decorator';

@ApiTags('Suitability')
@Controller({ version: '1', path: 'suitability' })
@ApiBearerAuth()
export class SuitabilityController {
  constructor(private readonly suitabilityService: SuitabilityService) {}

  @UseGuards(JwtAuthGuard)
  @Post('test')
  @ApiOperation({ summary: 'Submit suitability test' })
  @ApiResponse({ status: 200, description: 'Test submitted successfully' })
  async submitTest(
    @Request() req: AuthenticatedRequest,
    @Body() dto: SubmitTestSuiDto,
  ) {
    return await this.suitabilityService.submitTest(req.user.userId, dto);
  }

  @Get('my-result')
  @ApiOperation({ summary: 'Get user suitability results' })
  @ApiResponse({
    status: 200,
    type: [SuitabilityResultDto],
    description: 'User suitability results',
  })
  @UseGuards(JwtAuthGuard)
  async getMyResults(@Request() req: AuthenticatedRequest) {
    return await this.suitabilityService.getUserResults(req.user.userId);
  }
}
