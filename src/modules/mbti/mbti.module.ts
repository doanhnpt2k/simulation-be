import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MbtiController } from './controller/mbti.controller';
import { MbtiService } from './mbti.service';
import { QuestionEntity } from './entities/question.entity';
import { MbtiTestEntity } from './entities/mbti-test.entity';
import { MbtiAnswerEntity } from './entities/mbti-answer.entity';
import { MbtiResultEntity } from './entities/mbti-result.entity';
import { UserEntity } from '../user/entitys/user.entity';
import { MbtiCategoryEntity } from './entities/mbti-category.entity';
import { MbtiTypeController } from './controller/mbti-type.controller';
import { MbtiS3Service } from './mbti-s3.service';
import { MbtiTypeEntity } from './entities/mbti-type.entity';
import { MbtiPropertyEntity } from './entities/mbti-property.entity';
import { MbtiPropertyController } from './controller/mbti-property.controller';

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
      MbtiPropertyEntity,
    ]),
  ],
  controllers: [MbtiController, MbtiTypeController, MbtiPropertyController],
  providers: [MbtiService, MbtiS3Service],
  exports: [MbtiService],
})
export class MbtiModule {}
