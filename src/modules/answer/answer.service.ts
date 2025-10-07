import { InjectRepository } from '@nestjs/typeorm';
import { AnswerEntity } from './answer.entity';
import { Repository } from 'typeorm';
import { CreateAnswerDto } from './answer.dto';
import { BadRequestException, Logger } from '@nestjs/common';

export class AnswerService {
  private readonly logger = new Logger(AnswerService.name);
  constructor(
    @InjectRepository(AnswerEntity)
    private readonly answerRepository: Repository<AnswerEntity>,
  ) {}

  async createAnswer(dto: CreateAnswerDto) {
    try {
      const answer = this.answerRepository.create(dto);
      return this.answerRepository.save(answer);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to create answer: ${message}`);
      throw new BadRequestException(message);
    }
  }

  async createAnswersBulk(dtos: CreateAnswerDto[]) {
    try {
      if (!dtos.length) return { identifiers: [] };
      // Use insert for bulk write (fewer queries, no entity lifecycle overhead)
      return await this.answerRepository.insert(dtos);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to bulk create answers: ${message}`);
      throw new BadRequestException(message);
    }
  }
}
