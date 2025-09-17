import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import postgresConfig, { PostgresConfig } from './config/postgres.config';
import jwtConfig from './config/jwt.config';
import emailConfig from './config/email.config';
import awsConfig from './config/aws.config';
import { UserEntity } from './modules/user/entitys/user.entity';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { MbtiModule } from './modules/mbti/mbti.module';
import { QuestionEntity } from './modules/mbti/entities/question.entity';
import { MbtiTestEntity } from './modules/mbti/entities/mbti-test.entity';
import { MbtiAnswerEntity } from './modules/mbti/entities/mbti-answer.entity';
import { MbtiResultEntity } from './modules/mbti/entities/mbti-result.entity';
import { ResponseInterceptor } from './utils/interceptors/response.interceptor';
import { HttpExceptionFilter } from './utils/filters/http-exception.filter';
import { BullModule } from '@nestjs/bullmq';
import redisConfig, { RedisConfig } from './config/redis.config';
const apiModule = [AuthModule, UserModule, MbtiModule];
const entities = [
  UserEntity,
  QuestionEntity,
  MbtiTestEntity,
  MbtiAnswerEntity,
  MbtiResultEntity,
];
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [postgresConfig, jwtConfig, emailConfig, awsConfig, redisConfig],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const redisConfig = configService.get<RedisConfig>('redis')!;
        //   const redisUrl = `${redisConfig.url}${redisConfig.username}:${redisConfig.password}@${redisConfig.host}:${redisConfig.port}`;
        return {
          connection: {
            host: redisConfig.host,
            port: redisConfig.port,
            password: redisConfig.password,
            username: redisConfig.username,
          },
        };
      },
      inject: [ConfigService],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const postgresConfig = configService.get<PostgresConfig>('postgresql')!;
        return {
          type: 'postgres',
          host: postgresConfig.host,
          port: postgresConfig.port,
          username: postgresConfig.username,
          password: postgresConfig.password,
          database: postgresConfig.database,
          autoLoadEntities: true,
          entities,
          synchronize: true,
          logging: ['error', 'warn'],
        };
      },
      inject: [ConfigService],
    }),
    ...apiModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
