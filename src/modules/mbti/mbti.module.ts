import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MbtiController } from './mbti.controller';
import { MbtiService } from './mbti.service';
import { QuestionEntity } from './entities/question.entity';
import { MbtiTestEntity } from './entities/mbti-test.entity';
import { MbtiAnswerEntity } from './entities/mbti-answer.entity';
import { MbtiResultEntity } from './entities/mbti-result.entity';
import { UserEntity } from '../user/user.entity';
import { MbtiCategoryEntity } from './entities/mbti-category.entity';
import { MbtiTypeController } from './mbti-type.controller';
import { MbtiS3Service } from './mbti-s3.service';
import { MbtiTypeEntity } from './entities/mbti-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QuestionEntity,
      MbtiTestEntity,
      MbtiAnswerEntity,
      MbtiResultEntity,
      UserEntity,
      MbtiCategoryEntity,
      MbtiTypeEntity,
    ]),
  ],
  controllers: [MbtiController, MbtiTypeController],
  providers: [MbtiService, MbtiS3Service],
  exports: [MbtiService],
})
export class MbtiModule {}
