import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Like, Repository } from 'typeorm';
import { QuestionEntity } from './entities/question.entity';
import { MbtiTestEntity } from './entities/mbti-test.entity';
import { MbtiAnswerEntity } from './entities/mbti-answer.entity';
import { MbtiResultEntity } from './entities/mbti-result.entity';
import { UserEntity } from '../user/entitys/user.entity';
import { TestStatus } from '@/utils/enum/mbti-category.enum';
import { MbtiCalculator } from '../../utils/mbti-calculator.util';
import { CompleteTestResponseDto } from './dto/complete-test.dto';
import { MbtiResultDto } from './dto/mbti-result.dto';
import { SubmitTestDto } from './dto/submit-test.dto';
import {
  CreateQuestionDto,
  GetQuestionsDto,
  UpdateQuestionDto,
} from './dto/questions.dto';
import { MbtiTypeEntity } from './entities/mbti-type.entity';
import { MbtiS3Service } from './mbti-s3.service';
import {
  PaginatedQuestionsDto,
  QuestionDto,
  PaginationMetaDto,
} from './dto/paginated-questions.dto';
import { ApiException } from '@/utils/exception';
import { ErrorCode } from '@/utils/enum/error.enum';
import { MbtiPropertyEntity } from './entities/mbti-property.entity';
import { BaseQueryDto, OrderDirection } from '@/core/dto/base-query.dto';
import { CreatePropertyDto, UpdatePropertyDto } from './dto/property.dto';
import { GetMbtiTypesDto } from './dto/type.dto';

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
    @InjectRepository(MbtiPropertyEntity)
    private readonly propertyRepository: Repository<MbtiPropertyEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(MbtiTypeEntity)
    private readonly mbtiTypeRepository: Repository<MbtiTypeEntity>,
    private readonly s3Service: MbtiS3Service,
  ) {}

  // MBTI Type CRUD helpers

  //Get all MBTI types
  async getMbtiTypes(dto: GetMbtiTypesDto) {
    try {
      const { page, limit, search, order, orderBy, startTime, endTime } = dto;
      const [types, total] = await this.mbtiTypeRepository.findAndCount({
        where: {
          name: Like(`%${search}%`),
          createdAt: Between(startTime ?? new Date(), endTime ?? new Date()),
        },
        order: { [orderBy ?? 'createdAt']: order ?? OrderDirection.DESC },
        skip: (page - 1) * limit,
        take: limit,
      });
      const totalPages = Math.ceil(total / limit);
      const data = types.map((type) => ({
        id: type.id,
        name: type.name,
        description: type.description,
        imageUrl: type.imageUrl,
        createdAt: type.createdAt,
        updatedAt: type.updatedAt,
      }));
      return { data, page, limit, total, totalPages };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get MBTI types: ${message}`);
      throw new BadRequestException(message);
    }
  }

  //Get one MBTI type

  async getOneMbtiType(id: string) {
    try {
      const existing = await this.mbtiTypeRepository.findOne({ where: { id } });
      if (!existing)
        throw new ApiException(
          'MBTI type not found',
          HttpStatus.BAD_REQUEST,
          ErrorCode.INVALID_INPUT,
        );
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
        throw new ApiException(
          'MBTI type name already exists',
          HttpStatus.BAD_REQUEST,
          ErrorCode.INVALID_INPUT,
        );
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
      if (!found)
        throw new ApiException(
          'MBTI type not found',
          HttpStatus.BAD_REQUEST,
          ErrorCode.INVALID_INPUT,
        );

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

  async deleteMbtiType(id: string) {
    try {
      const found = await this.getOneMbtiType(id);
      if (!found)
        throw new ApiException(
          'MBTI type not found',
          HttpStatus.BAD_REQUEST,
          ErrorCode.INVALID_INPUT,
        );
      await this.mbtiTypeRepository.delete(id);
      return { message: 'MBTI type deleted successfully' };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to delete MBTI type ${id}: ${message}`);
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
    if (!found)
      throw new ApiException(
        'MBTI type not found',
        HttpStatus.BAD_REQUEST,
        ErrorCode.INVALID_INPUT,
      );
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

      const meta: PaginationMetaDto = {
        page,
        limit,
        total,
        totalPages,
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
  async getQuestionById(id: string) {
    try {
      const question = await this.questionRepository.findOne({ where: { id } });
      if (!question)
        throw new ApiException(
          'Question not found',
          HttpStatus.BAD_REQUEST,
          ErrorCode.INVALID_INPUT,
        );
      return question;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get question by id: ${message}`);
      throw new BadRequestException(message);
    }
  }

  async createQuestion(createQuestionDto: CreateQuestionDto) {
    try {
      const questionData = this.questionRepository.create(createQuestionDto);
      return this.questionRepository.save(questionData);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to create question: ${message}`);
      throw new BadRequestException(message);
    }
  }

  async updateQuestion(id: string, updateQuestionDto: UpdateQuestionDto) {
    try {
      const existing = await this.questionRepository.findOne({ where: { id } });
      if (!existing)
        throw new ApiException(
          'Question not found',
          HttpStatus.BAD_REQUEST,
          ErrorCode.INVALID_INPUT,
        );
      const safePayload: Partial<QuestionEntity> = {};
      if (updateQuestionDto.content !== undefined)
        safePayload.content = updateQuestionDto.content;
      if (updateQuestionDto.category !== undefined)
        safePayload.category = updateQuestionDto.category;
      if (updateQuestionDto.order !== undefined)
        safePayload.order = updateQuestionDto.order;
      if (updateQuestionDto.isActive !== undefined)
        safePayload.isActive = updateQuestionDto.isActive;
      await this.questionRepository.update(id, safePayload);
      return this.questionRepository.findOne({ where: { id } });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to update question: ${message}`);
      throw new BadRequestException(message);
    }
  }
  async deleteQuestion(id: string) {
    try {
      const existing = await this.questionRepository.findOne({ where: { id } });
      if (!existing)
        throw new ApiException(
          'Question not found',
          HttpStatus.BAD_REQUEST,
          ErrorCode.INVALID_INPUT,
        );
      await this.questionRepository.delete(id);
      return { message: 'Question deleted successfully' };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to delete question: ${message}`);
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
          _A: result._aScore,
          _T: result._tScore,
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
          _A: result._aPercentage,
          _T: result._tPercentage,
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
          _A: result._aScore,
          _T: result._tScore,
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
          _A: result._aPercentage,
          _T: result._tPercentage,
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
          _A: savedResult._aScore,
          _T: savedResult._tScore,
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
          _A: savedResult._aPercentage,
          _T: savedResult._tPercentage,
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
  async getProperties(dto: BaseQueryDto) {
    try {
      const { page, limit, search, order, orderBy, startTime, endTime } = dto;
      const [properties, total] = await this.propertyRepository.findAndCount({
        where: {
          title: Like(`%${search}%`),
          createdAt: Between(startTime ?? new Date(), endTime ?? new Date()),
        },
        order: { [orderBy ?? 'createdAt']: order ?? OrderDirection.DESC },
        skip: (page - 1) * limit,
        take: limit,
      });
      const totalPages = Math.ceil(total / limit);
      const data = properties.map((property) => ({
        id: property.id,
        title: property.title,
        content: property.content,
        descriptionType: property.descriptionType,
        swotType: property.swotType,
        createdAt: property.createdAt,
        updatedAt: property.updatedAt,
      }));
      return { data, total, totalPages, page, limit };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get properties: ${message}`);
      throw new BadRequestException(message);
    }
  }
  async getPropertyById(id: string) {
    try {
      const property = await this.propertyRepository.findOne({ where: { id } });
      if (!property)
        throw new ApiException(
          'Property not found',
          HttpStatus.BAD_REQUEST,
          ErrorCode.INVALID_INPUT,
        );
      return {
        id: property.id,
        title: property.title,
        content: property.content,
        descriptionType: property.descriptionType,
        swotType: property.swotType,
        createdAt: property.createdAt,
        updatedAt: property.updatedAt,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get property by id: ${message}`);
      throw new BadRequestException(message);
    }
  }
  async createProperty(createPropertyDto: CreatePropertyDto) {
    try {
      const payload = this.propertyRepository.create(createPropertyDto);
      return this.propertyRepository.save(payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to update property: ${message}`);
      throw new BadRequestException(message);
    }
  }
  async updateProperty(id: string, updatePropertyDto: UpdatePropertyDto) {
    try {
      const existing = await this.propertyRepository.findOne({ where: { id } });
      if (!existing)
        throw new ApiException(
          'Property not found',
          HttpStatus.BAD_REQUEST,
          ErrorCode.INVALID_INPUT,
        );
      const safePayload: Partial<MbtiPropertyEntity> = {};
      if (updatePropertyDto.title) safePayload.title = updatePropertyDto.title;
      if (updatePropertyDto.content)
        safePayload.content = updatePropertyDto.content;
      if (updatePropertyDto.descriptionType)
        safePayload.descriptionType = updatePropertyDto.descriptionType;
      if (updatePropertyDto.swotType)
        safePayload.swotType = updatePropertyDto.swotType;
      if (updatePropertyDto.mbtiTypeId) {
        const type = await this.mbtiTypeRepository.findOne({
          where: { id: updatePropertyDto.mbtiTypeId },
        });
        if (!type)
          throw new ApiException(
            'MBTI type not found',
            HttpStatus.BAD_REQUEST,
            ErrorCode.INVALID_INPUT,
          );
        safePayload.mbtiTypes = [type];
      }
      await this.propertyRepository.update(id, safePayload);
      return this.propertyRepository.findOne({ where: { id } });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to update property: ${message}`);
      throw new BadRequestException(message);
    }
  }

  async deleteProperty(id: string) {
    try {
      const existing = await this.propertyRepository.findOne({ where: { id } });
      if (!existing)
        throw new ApiException(
          'Property not found',
          HttpStatus.BAD_REQUEST,
          ErrorCode.INVALID_INPUT,
        );
      await this.propertyRepository.delete(id);
      return { message: 'Property deleted successfully' };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to delete property: ${message}`);
      throw new BadRequestException(message);
    }
  }
}
