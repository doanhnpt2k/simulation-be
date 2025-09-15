import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { QuestionEntity } from './entities/question.entity';
import { MbtiTestEntity } from './entities/mbti-test.entity';
import { MbtiAnswerEntity } from './entities/mbti-answer.entity';
import { MbtiResultEntity } from './entities/mbti-result.entity';
import { UserEntity } from '../user/user.entity';
import { TestStatus } from '@/utils/enum/mbti-category.enum';
import { MbtiCalculator } from '../../utils/mbti-calculator.util';
import { CompleteTestResponseDto } from './dto/complete-test.dto';
import { MbtiResultDto } from './dto/mbti-result.dto';
import { SubmitTestDto } from './dto/submit-test.dto';
import { GetQuestionsDto } from './dto/get-questions.dto';
import { MbtiTypeEntity } from './entities/mbti-type.entity';
import { MbtiS3Service } from './mbti-s3.service';
import {
  PaginatedQuestionsDto,
  QuestionDto,
  PaginationMetaDto,
} from './dto/paginated-questions.dto';

@Injectable()
export class MbtiService {
  private readonly logger = new Logger(MbtiService.name);

  constructor(
    @InjectRepository(QuestionEntity)
    private readonly questionRepository: Repository<QuestionEntity>,
    @InjectRepository(MbtiTestEntity)
    private readonly testRepository: Repository<MbtiTestEntity>,
    @InjectRepository(MbtiAnswerEntity)
    private readonly answerRepository: Repository<MbtiAnswerEntity>,
    @InjectRepository(MbtiResultEntity)
    private readonly resultRepository: Repository<MbtiResultEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(MbtiTypeEntity)
    private readonly mbtiTypeRepository: Repository<MbtiTypeEntity>,
    private readonly s3Service: MbtiS3Service,
  ) {}

  // MBTI Type CRUD helpers
  async getOneMbtiType(id: string) {
    try {
      const existing = await this.mbtiTypeRepository.findOne({ where: { id } });
      if (!existing) throw new NotFoundException('MBTI type not found');
      return existing;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get MBTI type ${id}: ${message}`);
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(message);
    }
  }
  async createMbtiType(payload: {
    name: string;
    description?: string;
    imageUrl?: string;
  }) {
    try {
      const existing = await this.mbtiTypeRepository.findOne({
        where: { name: payload.name },
      });
      if (existing)
        throw new BadRequestException('MBTI type name already exists');
      const entity = this.mbtiTypeRepository.create(payload);
      return await this.mbtiTypeRepository.save(entity);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to create MBTI type: ${message}`);
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(message);
    }
  }

  async updateMbtiType(
    id: string,
    payload: Partial<{
      name: string;
      description?: string | null;
      imageUrl?: string | null;
    }>,
    file?: { buffer: Buffer; originalname: string; mimetype: string },
  ) {
    try {
      const found = await this.getOneMbtiType(id);
      if (!found) throw new NotFoundException('MBTI type not found');

      // If file provided, upload to S3 and set imageUrl
      if (file) {
        const key = `mbti/types/${id}/${Date.now()}-${file.originalname}`;
        const url = await this.s3Service.upload(
          file.buffer,
          key,
          file.mimetype,
        );
        payload = { ...payload, imageUrl: url };
      }
      const safePayload: Partial<MbtiTypeEntity> = {};
      if (payload.name !== undefined) safePayload.name = payload.name;
      if (payload.description !== undefined)
        safePayload.description = payload.description;
      if (payload.imageUrl !== undefined)
        safePayload.imageUrl = payload.imageUrl;
      await this.mbtiTypeRepository.update(id, safePayload);
      return await this.mbtiTypeRepository.findOne({ where: { id } });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to update MBTI type ${id}: ${message}`);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new BadRequestException(message);
    }
  }

  //Update MBTI type
  // PUT = replace semantics: name is required. Fields not provided will be set to null if optional
  async putMbtiType(
    id: string,
    payload: {
      name: string;
      description?: string | null;
      imageUrl?: string | null;
    },
  ) {
    const found = await this.mbtiTypeRepository.findOne({ where: { id } });
    if (!found) throw new NotFoundException('MBTI type not found');
    const next = {
      name: payload.name,
      description: payload.description ?? null,
      imageUrl: payload.imageUrl ?? null,
    };
    await this.mbtiTypeRepository.update(id, next);
    return this.mbtiTypeRepository.findOne({ where: { id } });
  }

  async getQuestions(
    getQuestionsDto?: GetQuestionsDto,
  ): Promise<PaginatedQuestionsDto> {
    try {
      const page = getQuestionsDto?.page || 1;
      const limit = getQuestionsDto?.limit || 20;
      const skip = (page - 1) * limit;

      // Lấy tổng số câu hỏi
      const total = await this.questionRepository.count({
        where: { isActive: true },
      });

      // Lấy câu hỏi với pagination
      const questions = await this.questionRepository.find({
        where: { isActive: true },
        order: { order: 'ASC' },
        skip,
        take: limit,
      });

      // Tính toán pagination meta
      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      const meta: PaginationMetaDto = {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      };

      const data: QuestionDto[] = questions.map((question) => ({
        id: question.id,
        content: question.content,
        category: question.category,
        order: question.order,
      }));

      return {
        data,
        meta,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get questions: ${message}`);
      throw new BadRequestException(message);
    }
  }

  async getUserResults(userId: string): Promise<MbtiResultDto[]> {
    try {
      const results = await this.resultRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
      });

      return results.map((result) => ({
        id: result.id,
        mbtiType: result.mbtiType,
        scores: {
          E: result.eScore,
          I: result.iScore,
          S: result.sScore,
          N: result.nScore,
          T: result.tScore,
          F: result.fScore,
          J: result.jScore,
          P: result.pScore,
        },
        percentages: {
          E: result.ePercentage,
          I: result.iPercentage,
          S: result.sPercentage,
          N: result.nPercentage,
          T: result.tPercentage,
          F: result.fPercentage,
          J: result.jPercentage,
          P: result.pPercentage,
        },
        createdAt: result.createdAt,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get user results: ${message}`);
      throw new BadRequestException(message);
    }
  }

  async getResultById(
    resultId: string,
    userId: string,
  ): Promise<MbtiResultDto> {
    try {
      const result = await this.resultRepository.findOne({
        where: { id: resultId, userId },
      });

      if (!result) {
        throw new NotFoundException('MBTI result not found');
      }

      return {
        id: result.id,
        mbtiType: result.mbtiType,
        scores: {
          E: result.eScore,
          I: result.iScore,
          S: result.sScore,
          N: result.nScore,
          T: result.tScore,
          F: result.fScore,
          J: result.jScore,
          P: result.pScore,
        },
        percentages: {
          E: result.ePercentage,
          I: result.iPercentage,
          S: result.sPercentage,
          N: result.nPercentage,
          T: result.tPercentage,
          F: result.fPercentage,
          J: result.jPercentage,
          P: result.pPercentage,
        },
        createdAt: result.createdAt,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get result by id: ${message}`);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(message);
    }
  }

  async submitTest(
    userId: string,
    submitTestDto: SubmitTestDto,
  ): Promise<CompleteTestResponseDto> {
    try {
      // Lấy tất cả câu hỏi để kiểm tra
      const allQuestionsResult = await this.getQuestions();
      const allQuestions = allQuestionsResult.data;

      // Kiểm tra đã trả lời đủ câu hỏi chưa
      if (submitTestDto.answers.length < allQuestions.length) {
        throw new BadRequestException(
          `You need to answer all ${allQuestions.length} questions. Currently, you have answered ${submitTestDto.answers.length} questions`,
        );
      }

      // Kiểm tra có câu hỏi trùng lặp không
      const questionIds = submitTestDto.answers.map(
        (answer) => answer.questionId,
      );
      const uniqueQuestionIds = new Set(questionIds);
      if (uniqueQuestionIds.size !== questionIds.length) {
        throw new BadRequestException(
          'You cannot answer the same question twice',
        );
      }

      // Kiểm tra tất cả câu hỏi có tồn tại không
      const existingQuestions = await this.questionRepository.find({
        where: { id: In(questionIds) },
      });
      if (existingQuestions.length !== allQuestions.length) {
        throw new BadRequestException('Some questions do not exist');
      }

      // Tạo test mới
      const test = this.testRepository.create({
        userId,
        status: TestStatus.IN_PROGRESS,
        startedAt: new Date(),
      });

      const savedTest = await this.testRepository.save(test);

      // Lưu tất cả câu trả lời
      const answers = submitTestDto.answers.map((answerDto) =>
        this.answerRepository.create({
          testId: savedTest.id,
          questionId: answerDto.questionId,
          score: answerDto.score,
        }),
      );

      await this.answerRepository.save(answers);

      // Load answers với question relation để có category
      const answersWithQuestions = await this.answerRepository.find({
        where: { testId: savedTest.id },
        relations: ['question'],
      });

      // Tính toán kết quả MBTI
      const calculationResult =
        MbtiCalculator.calculateMbtiResult(answersWithQuestions);

      // Lưu kết quả
      const result = this.resultRepository.create({
        userId,
        testId: savedTest.id,
        mbtiType: calculationResult.mbtiType,
        eScore: calculationResult.scores.E,
        iScore: calculationResult.scores.I,
        sScore: calculationResult.scores.S,
        nScore: calculationResult.scores.N,
        tScore: calculationResult.scores.T,
        fScore: calculationResult.scores.F,
        jScore: calculationResult.scores.J,
        pScore: calculationResult.scores.P,
        ePercentage: calculationResult.percentages.E,
        iPercentage: calculationResult.percentages.I,
        sPercentage: calculationResult.percentages.S,
        nPercentage: calculationResult.percentages.N,
        tPercentage: calculationResult.percentages.T,
        fPercentage: calculationResult.percentages.F,
        jPercentage: calculationResult.percentages.J,
        pPercentage: calculationResult.percentages.P,
      });

      const savedResult = await this.resultRepository.save(result);

      // Map mbtiType string -> MbtiTypeEntity and update references
      const typeEntity = await this.mbtiTypeRepository.findOne({
        where: { name: calculationResult.mbtiType },
      });
      if (typeEntity) {
        await this.resultRepository.update(savedResult.id, {
          mbtiTypeId: typeEntity.id,
        });
        await this.userRepository.update(userId, {
          mbtiTypeId: typeEntity.id,
          lastMbtiTestAt: new Date(),
        });
      }
      await this.testRepository.update(savedTest.id, {
        status: TestStatus.COMPLETED,
        completedAt: new Date(),
      });

      const resultDto: MbtiResultDto = {
        id: savedResult.id,
        mbtiType: savedResult.mbtiType,
        scores: {
          E: savedResult.eScore,
          I: savedResult.iScore,
          S: savedResult.sScore,
          N: savedResult.nScore,
          T: savedResult.tScore,
          F: savedResult.fScore,
          J: savedResult.jScore,
          P: savedResult.pScore,
        },
        percentages: {
          E: savedResult.ePercentage,
          I: savedResult.iPercentage,
          S: savedResult.sPercentage,
          N: savedResult.nPercentage,
          T: savedResult.tPercentage,
          F: savedResult.fPercentage,
          J: savedResult.jPercentage,
          P: savedResult.pPercentage,
        },
        createdAt: savedResult.createdAt,
      };

      return {
        message: 'MBTI test completed successfully',
        result: resultDto,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to submit test: ${message}`);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(message);
    }
  }
}
