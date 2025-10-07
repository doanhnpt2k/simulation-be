import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
config();

// Import all entities explicitly
import { UserEntity } from '../modules/user/entitys/user.entity';
import { MbtiResultEntity } from '../modules/mbti/entities/mbti-result.entity';
import { MbtiCategoryEntity } from '../modules/mbti/entities/mbti-category.entity';
import { MbtiTypeEntity } from '../modules/mbti/entities/mbti-type.entity';
import { MbtiPropertyEntity } from '../modules/mbti/entities/mbti-property.entity';
import { SuitabilityResultEntity } from '../modules/suitability/entities/result.entity';
import { SuitabilityTypeEntity } from '../modules/suitability/entities/type.enity';
import { SuitabilitySkillEntity } from '../modules/suitability/entities/skill.entity';
import { JobEntity } from '../modules/job/job.entity';
import { QuestionEntity } from '../modules/question/question.entity';
import { TestEntity } from '../modules/test/test.entity';
import { AnswerEntity } from '../modules/answer/answer.entity';

const configService = new ConfigService();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get<string>('POSTGRES_HOST') || 'localhost',
  port: parseInt(configService.get<string>('POSTGRES_PORT') || '5432', 10),
  username: configService.get<string>('POSTGRES_USERNAME') || 'postgres',
  password: configService.get<string>('POSTGRES_PASSWORD') || 'password',
  database: configService.get<string>('POSTGRES_DATABASE'),
  synchronize: false,
  entities: [
    UserEntity,
    MbtiResultEntity,
    MbtiCategoryEntity,
    MbtiTypeEntity,
    MbtiPropertyEntity,
    SuitabilityResultEntity,
    SuitabilityTypeEntity,
    SuitabilitySkillEntity,
    JobEntity,
    QuestionEntity,
    TestEntity,
    AnswerEntity,
  ],
  migrations: ['src/migration/*.ts'],
  migrationsRun: false,
  logging: true,
});

export default AppDataSource;
