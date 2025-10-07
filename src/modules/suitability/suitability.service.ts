import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Between, Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { SuitabilityResultEntity } from './entities/result.entity';
import { SuitabilityTypeEntity } from './entities/type.enity';
import { OrderDirection } from '@/core/dto/base-query.dto';
import {
  CreateSuitabilityTypeDto,
  GetSuitabilityTypesDto,
  UpdateSuitabilityTypeDto,
} from './dto/type.dto';
import { ApiException } from '@/utils/exception';
import { ErrorCode } from '@/utils/enum/error.enum';
import { UserService } from '../user/user.service';
import { TestService } from '../test/test.service';
import { QuestionService } from '../question/question.service';
import { JobService } from '../job/job.service';
import { AnswerService } from '../answer/answer.service';
import { SubmitTestSuiDto } from './dto/submitTest.dto';
import { TestStatus } from '@/utils/enum/mbti-category.enum';
import { SuitabilityCalculator } from '@/utils/suitability.util';
import { SuitabilityType } from '@/utils/enum/suitability.enum';
import { AnswerEntity } from '../answer/answer.entity';
import { SuitabilityResultDto } from './dto/result.dto';

@Injectable()
export class SuitabilityService {
  private readonly logger = new Logger(SuitabilityService.name);
  constructor(
    @InjectRepository(SuitabilityResultEntity)
    private readonly suitabilityResultRepository: Repository<SuitabilityResultEntity>,
    @InjectRepository(SuitabilityTypeEntity)
    private readonly suitabilityTypeRepository: Repository<SuitabilityTypeEntity>,
    private readonly userService: UserService,
    private readonly jobService: JobService,
    private readonly questionService: QuestionService,
    private readonly testService: TestService,
    private readonly answerService: AnswerService,
  ) {}

  //# CRUD Suitability TYPE #

  async getSuitabilityTypes(dto: GetSuitabilityTypesDto) {
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
      const [types, total] = await this.suitabilityTypeRepository.findAndCount({
        where: whereConditions,
        order: orderConditions,
        skip: (page - 1) * limit,
        take: limit,
        relations: ['jobs', 'skills'],
      });

      const totalPages = Math.ceil(total / limit);

      const data = types.map((type) => ({
        id: type.id,
        name: type.name,
        fullName: type.fullName,
        description: type.description,
        imageUrl: type.imageUrl,
        jobs: type.jobs,
        skills: type.skills,
        createdAt: type.createdAt,
        updatedAt: type.updatedAt,
      }));

      return { data, total, totalPages, page, limit };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get suitability job: ${message}`);
      throw new BadRequestException(message);
    }
  }
  async getOneSuitabilityType(id: string) {
    try {
      const type = await this.suitabilityTypeRepository.findOne({
        where: { id },
        relations: ['jobs', 'skills'],
      });
      if (!type) throw new BadRequestException('Suitability type not found');
      return type;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get suitability type: ${message}`);
      throw new BadRequestException(message);
    }
  }
  async getSuitabilityTypeByName(name: string) {
    try {
      const type = await this.suitabilityTypeRepository.findOne({
        where: { name },
      });
      if (!type) throw new BadRequestException('Suitability type not found');
      return type;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get suitability type: ${message}`);
      throw new ApiException(
        message,
        HttpStatus.BAD_REQUEST,
        ErrorCode.INVALID_INPUT,
      );
    }
  }
  async createSuitabilityType(dto: CreateSuitabilityTypeDto) {
    try {
      const existing = await this.suitabilityTypeRepository.findOne({
        where: { name: dto.name },
      });
      if (existing)
        throw new ApiException(
          'Suitability type name already exists',
          HttpStatus.BAD_REQUEST,
          ErrorCode.INVALID_INPUT,
        );
      // Dedupe jobIds và load 1 lần
      const jobs =
        dto.jobIds && dto.jobIds.length
          ? await this.jobService.getJobsById(Array.from(new Set(dto.jobIds)))
          : [];
      if (dto.jobIds && jobs.length !== new Set(dto.jobIds).size) {
        throw new ApiException(
          'Some suitability jobs not found',
          HttpStatus.BAD_REQUEST,
          ErrorCode.INVALID_INPUT,
        );
      }
      const type = this.suitabilityTypeRepository.create({
        name: dto.name,
        fullName: dto.fullName,
        description: dto.description,
        //  imageUrl: dto.imageUrl,
        jobs: jobs,
      });

      await this.suitabilityTypeRepository.save(type);
      return type;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to create suitability type: ${message}`);
      throw new BadRequestException(message);
    }
  }
  async updateSuitabilityType(id: string, dto: UpdateSuitabilityTypeDto) {
    try {
      const type = await this.suitabilityTypeRepository.findOne({
        where: { id },
        relations: ['jobs'],
      });
      if (!type)
        throw new ApiException(
          'Suitability type not found',
          HttpStatus.BAD_REQUEST,
          ErrorCode.INVALID_INPUT,
        );

      const safePayload: Partial<SuitabilityTypeEntity> = {};
      if (dto.name !== undefined) safePayload.name = dto.name;
      if (dto.fullName !== undefined) safePayload.fullName = dto.fullName;
      if (dto.description !== undefined)
        safePayload.description = dto.description;
      if (dto.jobIds !== undefined) {
        const uniqueJobIds = Array.from(new Set(dto.jobIds));
        const jobs = uniqueJobIds.length
          ? await this.jobService.getJobsById(uniqueJobIds)
          : [];
        if (jobs.length !== uniqueJobIds.length) {
          throw new ApiException(
            'Some suitability jobs not found',
            HttpStatus.BAD_REQUEST,
            ErrorCode.INVALID_INPUT,
          );
        }
        type.jobs = jobs;
      }
      // Gộp payload vào entity hiện tại rồi save (để cập nhật cả join table)
      Object.assign(type, safePayload);
      await this.suitabilityTypeRepository.save(type);
      return await this.suitabilityTypeRepository.findOne({
        where: { id },
        relations: ['jobs'],
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to update suitability type: ${message}`);
      throw new BadRequestException(message);
    }
  }
  async deleteSuitabilityType(id: string) {
    try {
      const type = await this.suitabilityTypeRepository.findOne({
        where: { id },
      });
      if (!type) throw new BadRequestException('Suitability type not found');
      await this.suitabilityTypeRepository.delete(id);
      return { message: 'Suitability type deleted successfully' };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to delete suitability type: ${message}`);
      throw new BadRequestException(message);
    }
  }
  async submitTest(
    userId: string,
    submitTestDto: SubmitTestSuiDto,
  ): Promise<{ message: string }> {
    try {
      const { answers: answersDto } = submitTestDto;
      // 1) Validate không trùng câu hỏi
      const questionIds = answersDto.map((a) => a.questionId);
      const uniqueIds = new Set(questionIds);
      if (uniqueIds.size !== questionIds.length) {
        throw new BadRequestException(
          'You cannot answer the same question twice',
        );
      }

      // 2) Lấy metadata câu hỏi đủ để tính điểm
      const questions =
        await this.questionService.getQuestionViaAnswers(answersDto);
      // 3) Tạo test (IN_PROGRESS)
      const test = await this.testService.createTest({
        userId,
        status: TestStatus.IN_PROGRESS,
        startedAt: new Date(),
        completedAt: null,
      });

      // 4) Bulk insert answers (1 query)
      await this.answerService.createAnswersBulk(
        answersDto.map((a) => ({
          testId: test.id,
          questionId: a.questionId,
          score: a.score,
        })),
      );

      // 5) Tính toán kết quả suitability
      const questionMap = new Map(
        questions.map((q) => [q.id, { type: q.suitabilityType ?? q.type }]),
      );
      const answersForCalc = answersDto.map((a) => ({
        score: a.score,
        question: { suitabilityType: questionMap.get(a.questionId)?.type },
      })) as Array<{
        score: number;
        question: { suitabilityType: SuitabilityType };
      }>;
      const calc = SuitabilityCalculator.calculateSuitabilityResult(
        answersForCalc as unknown as AnswerEntity[],
      );
      //    6) Lưu kết quả (scores + percentages)
      const suitabilityType = SuitabilityCalculator.determineSuitabilityType(
        calc.scores,
      );
      const matchCode = await this.getSuitabilityTypeByName(suitabilityType);
      if (!matchCode)
        throw new ApiException(
          'Suitability type not found',
          HttpStatus.INTERNAL_SERVER_ERROR,
          ErrorCode.INTERNAL_SERVER_ERROR,
          'submitTest',
        );
      await this.userService.updateUserSuitability(userId, {
        suitabilityTypeId: matchCode.id,
        lastSuitabilityTestAt: new Date(),
      });
      await this.suitabilityResultRepository.save(
        this.suitabilityResultRepository.create({
          userId,
          testId: test.id,
          aScore: calc.scores.A,
          iScore: calc.scores.I,
          cScore: calc.scores.C,
          eScore: calc.scores.E,
          sScore: calc.scores.S,
          rScore: calc.scores.R,
        }),
      );

      // 7) Hoàn tất test
      await this.testService.updateTest(test.id, {
        status: TestStatus.COMPLETED,
        completedAt: new Date(),
      });

      return { message: 'Suitability test completed successfully' };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to submit test: ${message}`);
      throw new BadRequestException(message);
    }
  }
  async getUserResults(userId: string): Promise<SuitabilityResultDto[]> {
    try {
      const results = await this.suitabilityResultRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
      });
      return results.map((result) => {
        const scores = {
          A: result.aScore,
          I: result.iScore,
          C: result.cScore,
          E: result.eScore,
          S: result.sScore,
          R: result.rScore,
        };
        const percentages = SuitabilityCalculator.calculatePercentages(scores);
        const suitabilityType =
          SuitabilityCalculator.determineSuitabilityType(scores);
        return {
          id: result.id,
          suitabilityType,
          scores,
          percentages,
          createdAt: result.createdAt,
        };
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get user results: ${message}`);
      throw new BadRequestException(message);
    }
  }
}
