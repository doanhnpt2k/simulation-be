import {
  BadRequestException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionEntity } from './question.entity';
import { Between, In, Like, Repository } from 'typeorm';
import {
  CreateQuestionDto,
  GetQuestionsDto,
  UpdateQuestionDto,
} from './question.dto';
import { OrderDirection } from '@/core/dto/base-query.dto';
import { ApiException } from '@/utils/exception';
import { ErrorCode } from '@/utils/enum/error.enum';
import { AnswerDto } from '../mbti/dto/submit-test.dto';

@Injectable()
export class QuestionService {
  private readonly logger = new Logger(QuestionService.name);
  constructor(
    @InjectRepository(QuestionEntity)
    private readonly questionRepository: Repository<QuestionEntity>,
  ) {}
  async getQuestions(dto: GetQuestionsDto) {
    try {
      const { page, limit, search, order, orderBy, startTime, endTime, type } =
        dto;

      const whereConditions: Record<string, any> = {};

      if (search) {
        whereConditions.content = Like(`%${search}%`);
      }
      if (type) {
        whereConditions.type = type;
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
      const [questions, total] = await this.questionRepository.findAndCount({
        where: whereConditions,
        order: orderConditions,
        skip: (page - 1) * limit,
        take: limit,
      });

      const totalPages = Math.ceil(total / limit);
      const data = questions.map((question) => ({
        id: question.id,
        content: question.content,
        type: question.type,
        mbtiCategory: question.mbtiCategory,
        suitabilityType: question.suitabilityType,
        isActive: question.isActive,
        order: question.order,
        createdAt: question.createdAt,
        updatedAt: question.updatedAt,
      }));
      return { data, total, totalPages, page, limit };
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
      const safePayload = Object.fromEntries(
        Object.entries(updateQuestionDto).filter(
          ([, value]) => value !== undefined,
        ),
      ) as Partial<QuestionEntity>;
      await this.questionRepository.update(id, safePayload);
      return { message: 'Question updated successfully' };
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
  async getQuestionViaAnswers(answers: AnswerDto[]) {
    try {
      const questionIds = answers.map((answer) => answer.questionId);
      const questions = await this.questionRepository.find({
        where: { id: In(questionIds) },
      });
      return questions;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get question via answers: ${message}`);
      throw new BadRequestException(message);
    }
  }
}
