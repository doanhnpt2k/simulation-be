import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JobEntity } from './job.entity';
import { Between, In, Like, Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import {
  CreateJobDto,
  GetJobDto,
  PartialUpdateSuitabilityJobDto,
} from './job.dto';
import { OrderDirection } from '@/core/dto/base-query.dto';
@Injectable()
export class JobService {
  private readonly logger = new Logger(JobService.name);
  constructor(
    @InjectRepository(JobEntity)
    private readonly jobRepository: Repository<JobEntity>,
  ) {}
  async getJobs(dto: GetJobDto) {
    try {
      const { page, limit, search, order, orderBy, startTime, endTime } = dto;
      const whereConditions: Record<string, any> = {};
      if (search) {
        whereConditions.name = Like(`%${search}%`);
      }
      if (startTime && endTime) {
        whereConditions.createdAt = Between(startTime, endTime);
      }
      const orderConditions: Record<string, any> = {};
      if (orderBy) {
        orderConditions[orderBy] = order ?? OrderDirection.ASC;
      } else {
        orderConditions.createdAt = order ?? OrderDirection.DESC;
      }
      const [jobs, total] = await this.jobRepository.findAndCount({
        where: whereConditions,
        order: orderConditions,
        skip: (page - 1) * limit,
        take: limit,
      });
      const totalPages = Math.ceil(total / limit);
      const data = jobs.map((job) => ({
        id: job.id,
        name: job.name,
        description: job.description,
        type: job.type,
        address: job.address,
        route: job.route,
        minSalary: job.minSalary,
        maxSalary: job.maxSalary,
        workingTime: job.workingTime,
        dayOff: job.dayOff,
        level: job.level,
        benefit: job.benefit,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      }));
      return { data, total, totalPages, page, limit };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get jobs: ${message}`);
      throw new BadRequestException(message);
    }
  }
  async getJobsById(ids: string[]) {
    try {
      const job = await this.jobRepository.find({ where: { id: In(ids) } });
      if (job.length !== ids.length) {
        throw new BadRequestException('Some jobs not found');
      }
      return job;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get job by id: ${message}`);
      throw new BadRequestException(message);
    }
  }
  async getJobById(id: string) {
    try {
      const job = await this.jobRepository.findOne({ where: { id } });
      return job;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get job by id: ${message}`);
      throw new BadRequestException(message);
    }
  }
  async createJob(dto: CreateJobDto) {
    try {
      const job = this.jobRepository.create(dto);
      return this.jobRepository.save(job);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to create job: ${message}`);
      throw new BadRequestException(message);
    }
  }
  async updateJob(id: string, dto: PartialUpdateSuitabilityJobDto) {
    try {
      const job = await this.jobRepository.findOne({ where: { id } });
      if (!job) {
        throw new BadRequestException('Job not found');
      }
      const safePayload = Object.fromEntries(
        Object.entries(dto).filter(([, value]) => value !== undefined),
      ) as Partial<JobEntity>;
      await this.jobRepository.update(id, safePayload);
      return this.jobRepository.save(job);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to update job: ${message}`);
      throw new BadRequestException(message);
    }
  }
  async deleteJob(id: string) {
    try {
      const job = await this.jobRepository.findOne({ where: { id } });
      if (!job) {
        throw new BadRequestException('Job not found');
      }
      await this.jobRepository.delete(id);
      return { message: 'Job deleted successfully' };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to delete job: ${message}`);
      throw new BadRequestException(message);
    }
  }
}
