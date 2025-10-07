import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MbtiController } from './controller/mbti.controller';
import { MbtiService } from './mbti.service';
import { MbtiResultEntity } from './entities/mbti-result.entity';
import { MbtiCategoryEntity } from './entities/mbti-category.entity';
import { MbtiTypeController } from './controller/mbti-type.controller';
import { MbtiS3Service } from './mbti-s3.service';
import { MbtiTypeEntity } from './entities/mbti-type.entity';
import { MbtiPropertyEntity } from './entities/mbti-property.entity';
import { MbtiPropertyController } from './controller/mbti-property.controller';
import { QuestionModule } from '../question/question.module';
import { TestModule } from '../test/test.module';
import { AnswerModule } from '../answer/answer.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    QuestionModule,
    TestModule,
    AnswerModule,
    UserModule,
    TypeOrmModule.forFeature([
      MbtiResultEntity,
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
