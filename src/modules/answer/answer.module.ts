import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnswerEntity } from './answer.entity';
import { AnswerService } from './answer.service';

@Module({
  imports: [TypeOrmModule.forFeature([AnswerEntity])],
  controllers: [],
  providers: [AnswerService],
  exports: [AnswerService],
})
export class AnswerModule {}
