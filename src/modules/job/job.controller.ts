import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JobService } from './job.service';
import {
  CreateJobDto,
  GetJobDto,
  PartialUpdateSuitabilityJobDto,
} from './job.dto';
import { ApiBaseQuery } from '@/utils/decorator/swagger.decorator';
import { AuthAdmin, UUIDParam } from '@/utils/decorator/http.decorator';

@Controller('job')
@ApiTags('Job')
@ApiBearerAuth()
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @ApiBaseQuery()
  @Get()
  getJobs(@Query() dto: GetJobDto) {
    return this.jobService.getJobs(dto);
  }

  @Get(':id')
  getJobById(@UUIDParam('id') id: string) {
    return this.jobService.getJobById(id);
  }

  @AuthAdmin()
  @Post()
  createJob(@Body() dto: CreateJobDto) {
    return this.jobService.createJob(dto);
  }

  @AuthAdmin()
  @Patch(':id')
  updateJob(
    @UUIDParam('id') id: string,
    @Body() dto: PartialUpdateSuitabilityJobDto,
  ) {
    return this.jobService.updateJob(id, dto);
  }

  @AuthAdmin()
  @Delete(':id')
  deleteJob(@UUIDParam('id') id: string) {
    return this.jobService.deleteJob(id);
  }
}
