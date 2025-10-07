import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SuitabilityResultEntity } from './entities/result.entity';
import { SuitabilityTypeEntity } from './entities/type.enity';
import { SuitabilityService } from './suitability.service';
import { SuitabilityTypeController } from './controller/type.controller';
import { SuitabilitySkillEntity } from './entities/skill.entity';
import { UserModule } from '../user/user.module';
import { JobModule } from '../job/job.module';
import { QuestionModule } from '../question/question.module';
import { TestModule } from '../test/test.module';
import { AnswerModule } from '../answer/answer.module';
import { SuitabilityController } from './controller/suitability.controller';

@Module({
  imports: [
    UserModule,
    JobModule,
    QuestionModule,
    TestModule,
    AnswerModule,
    TypeOrmModule.forFeature([
      SuitabilityResultEntity,
      SuitabilityTypeEntity,
      SuitabilitySkillEntity,
    ]),
  ],
  controllers: [SuitabilityTypeController, SuitabilityController],
  providers: [SuitabilityService],
  exports: [SuitabilityService],
})
export class SuitabilityModule {}
