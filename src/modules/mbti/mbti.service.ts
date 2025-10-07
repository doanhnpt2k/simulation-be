import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Like, Repository } from 'typeorm';

import { AnswerEntity } from '../answer/answer.entity';
import { MbtiResultEntity } from './entities/mbti-result.entity';
import { TestStatus } from '@/utils/enum/mbti-category.enum';
import { MbtiCalculator } from '../../utils/mbti-calculator.util';
import { MbtiResultDto } from './dto/mbti-result.dto';
import { SubmitTestDto } from './dto/submit-test.dto';
import { MbtiTypeEntity } from './entities/mbti-type.entity';
import { MbtiS3Service } from './mbti-s3.service';
import { ApiException } from '@/utils/exception';
import { ErrorCode } from '@/utils/enum/error.enum';
import { MbtiPropertyEntity } from './entities/mbti-property.entity';
import { BaseQueryDto, OrderDirection } from '@/core/dto/base-query.dto';
import { CreatePropertyDto, UpdatePropertyDto } from './dto/property.dto';
import {
  CreateMbtiTypeDto,
  GetMbtiTypesDto,
  UpdateMbtiTypeDto,
} from './dto/type.dto';
import { QuestionService } from '../question/question.service';
import { AnswerService } from '../answer/answer.service';
import { TestService } from '../test/test.service';
import { UserService } from '../user/user.service';

@Injectable()
export class MbtiService {
  private readonly logger = new Logger(MbtiService.name);

  constructor(
    @InjectRepository(MbtiResultEntity)
    private readonly resultRepository: Repository<MbtiResultEntity>,
    @InjectRepository(MbtiPropertyEntity)
    private readonly propertyRepository: Repository<MbtiPropertyEntity>,
    @InjectRepository(MbtiTypeEntity)
    private readonly mbtiTypeRepository: Repository<MbtiTypeEntity>,
    private readonly s3Service: MbtiS3Service,
    private readonly questionService: QuestionService,
    private readonly answerService: AnswerService,
    private readonly testService: TestService,
    private readonly userService: UserService,
  ) {}

  // MBTI Type CRUD helpers

  //Get all MBTI types
  async getMbtiTypes(dto: GetMbtiTypesDto) {
    try {
      const { page, limit, search, order, orderBy, startTime, endTime } = dto;

      const whereConditions: Record<string, any> = {};

      if (search) {
        whereConditions.name = Like(`%${search}%`);
      }

      if (startTime && endTime) {
        whereConditions.createdAt = Between(startTime, endTime);
      }

      // Build order conditions
      const orderConditions: Record<string, any> = {};
      if (orderBy) {
        orderConditions[orderBy] = order ?? OrderDirection.ASC;
      } else {
        orderConditions.createdAt = order ?? OrderDirection.DESC;
      }

      const [types, total] = await this.mbtiTypeRepository.findAndCount({
        where: whereConditions,
        order: orderConditions,
        skip: (page - 1) * limit,
        take: limit,
        relations: ['properties'],
      });
      console.log(types);

      const totalPages = Math.ceil(total / limit);
      const data = types.map((type) => ({
        id: type.id,
        name: type.name,
        fullName: type.fullName,
        description: type.description,
        imageUrl: type.imageUrl,
        createdAt: type.createdAt,
        updatedAt: type.updatedAt,
        properties: type.properties,
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
      const existing = await this.mbtiTypeRepository.findOne({
        where: { id },
        relations: ['properties'],
      });
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
  async createMbtiType(
    payload: CreateMbtiTypeDto,
    file?: { buffer: Buffer; originalname: string; mimetype: string },
  ) {
    try {
      if (file) {
        const key = `mbti/types/${payload.name}/${Date.now()}-${file.originalname}`;
        const url = await this.s3Service.upload(
          file.buffer,
          key,
          file.mimetype,
        );
        payload = { ...payload, imageUrl: url };
      }
      const existing = await this.mbtiTypeRepository.findOne({
        where: { name: payload.name },
      });
      if (existing)
        throw new ApiException(
          'MBTI type name already exists',
          HttpStatus.BAD_REQUEST,
          ErrorCode.INVALID_INPUT,
        );

      // Validate mbtiPropertyIds if provided
      let properties: MbtiPropertyEntity[] = [];
      if (payload.mbtiPropertyIds && payload.mbtiPropertyIds.length > 0) {
        properties = await this.propertyRepository.findBy({
          id: In(payload.mbtiPropertyIds),
        });
        if (properties.length !== payload.mbtiPropertyIds.length) {
          throw new ApiException(
            'Some MBTI properties not found',
            HttpStatus.BAD_REQUEST,
            ErrorCode.INVALID_INPUT,
          );
        }
      }

      const entity = this.mbtiTypeRepository.create({
        name: payload.name,
        fullName: payload.fullName,
        description: payload.description,
        imageUrl: payload.imageUrl,
        properties: properties,
      });
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
    payload: UpdateMbtiTypeDto,
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

      // Handle mbtiPropertyIds if provided
      if (payload.mbtiPropertyIds !== undefined) {
        let properties: MbtiPropertyEntity[] = [];
        if (payload.mbtiPropertyIds.length > 0) {
          properties = await this.propertyRepository.findBy({
            id: In(payload.mbtiPropertyIds),
          });
          if (properties.length !== payload.mbtiPropertyIds.length) {
            throw new ApiException(
              'Some MBTI properties not found',
              HttpStatus.BAD_REQUEST,
              ErrorCode.INVALID_INPUT,
            );
          }
        }
        found.properties = properties;
      }

      const safePayload: Partial<MbtiTypeEntity> = {};
      if (payload.name !== undefined) safePayload.name = payload.name;
      if (payload.fullName !== undefined)
        safePayload.fullName = payload.fullName;
      if (payload.description !== undefined)
        safePayload.description = payload.description;
      if (payload.imageUrl !== undefined)
        safePayload.imageUrl = payload.imageUrl;

      await this.mbtiTypeRepository.save(safePayload);
      return await this.mbtiTypeRepository.findOne({
        where: { id },
        relations: ['properties'],
      });
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

  async getUserResults(userId: string): Promise<MbtiResultDto[]> {
    try {
      const results = await this.resultRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
      });
      return results.map((result) => {
        const scores = {
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
        };
        const percentages = MbtiCalculator.calculatePercentages(scores);
        return {
          id: result.id,
          mbtiType: result.mbtiType,
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
        percentages: MbtiCalculator.calculatePercentages({
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
        }),
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
  ): Promise<{ message: string }> {
    try {
      const { answers: answersDto } = submitTestDto;
      // 1) Fetch chỉ meta cần thiết cho calculation
      const questions =
        await this.questionService.getQuestionViaAnswers(answersDto);
      const questionIds = answersDto.map((answer) => answer.questionId);
      const uniqueQuestionIds = new Set(questionIds);
      if (uniqueQuestionIds.size !== questionIds.length) {
        throw new BadRequestException(
          'You cannot answer the same question twice',
        );
      }

      // 2) Tạo test (IN_PROGRESS)
      const test = await this.testService.createTest({
        userId,
        status: TestStatus.IN_PROGRESS,
        startedAt: new Date(),
        completedAt: null,
      });
      // 3) Bulk insert answers (1 query)
      await this.answerService.createAnswersBulk(
        submitTestDto.answers.map((a) => ({
          testId: test.id,
          questionId: a.questionId,
          score: a.score,
        })),
      );
      // Chuẩn bị dữ liệu tính toán từ map câu hỏi (không phụ thuộc relation)
      const questionMap = new Map(
        questions.map((q) => [q.id, { category: q.mbtiCategory }]),
      );
      const answersForCalculation = submitTestDto.answers.map((a) => ({
        score: a.score,
        question: { mbtiCategory: questionMap.get(a.questionId)?.category },
      }));

      // Tính toán kết quả MBTI
      const calculationResult = MbtiCalculator.calculateMbtiResult(
        answersForCalculation as unknown as AnswerEntity[],
      );

      // 4) Lưu kết quả
      const result = this.resultRepository.create({
        userId,
        testId: test.id,
        mbtiType: calculationResult.mbtiType,
        eScore: calculationResult.scores.E,
        iScore: calculationResult.scores.I,
        sScore: calculationResult.scores.S,
        nScore: calculationResult.scores.N,
        tScore: calculationResult.scores.T,
        fScore: calculationResult.scores.F,
        jScore: calculationResult.scores.J,
        pScore: calculationResult.scores.P,
      });

      const savedResult = await this.resultRepository.save(result);

      // 5) Map mbtiType string -> MbtiTypeEntity và update user
      const typeEntity = await this.mbtiTypeRepository.findOne({
        where: { name: calculationResult.mbtiType },
      });
      if (typeEntity) {
        await this.resultRepository.update(savedResult.id, {
          mbtiTypeId: typeEntity.id,
        });
        await this.userService.updateUserMbti(userId, {
          mbtiTypeId: typeEntity.id,
          lastMbtiTestAt: new Date(),
        });
      }
      // 6) Hoàn tất test
      await this.testService.updateTest(test.id, {
        status: TestStatus.COMPLETED,
        completedAt: new Date(),
      });

      return {
        message: 'MBTI test completed successfully',
        // result: resultDto,
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

      const whereConditions = {
        ...(search && { title: Like(`%${search}%`) }),
        ...(startTime && endTime && { createdAt: Between(startTime, endTime) }),
      };
      const orderConditions = {
        ...(orderBy
          ? { [orderBy]: order ?? OrderDirection.ASC }
          : { createdAt: order ?? OrderDirection.DESC }),
      };

      const [properties, total] = await this.propertyRepository.findAndCount({
        where: whereConditions,
        order: orderConditions,
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
