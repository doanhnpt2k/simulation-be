import { InjectRepository } from '@nestjs/typeorm';
import { TestEntity } from './test.entity';
import { Repository } from 'typeorm';
import { CreateTestDto, UpdateTestDto } from './test.dto';
import { BadRequestException, Logger } from '@nestjs/common';

export class TestService {
  private readonly logger = new Logger(TestService.name);
  constructor(
    @InjectRepository(TestEntity)
    private readonly testRepository: Repository<TestEntity>,
  ) {}
  async createTest(dto: CreateTestDto) {
    try {
      const test = this.testRepository.create(dto);
      return this.testRepository.save(test);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to create test: ${message}`);
      throw new BadRequestException(message);
    }
  }
  async updateTest(id: string, dto: UpdateTestDto) {
    try {
      const test = await this.testRepository.findOne({ where: { id } });
      if (!test) {
        throw new BadRequestException('Test not found');
      }
      const safePayload = Object.fromEntries(
        Object.entries(dto).filter(([, value]) => value !== undefined),
      ) as Partial<TestEntity>;
      await this.testRepository.update(id, safePayload);
      return { message: 'Test updated successfully' };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to update test: ${message}`);
      throw new BadRequestException(message);
    }
  }
}
