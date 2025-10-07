import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import postgresConfig, { PostgresConfig } from './config/postgres.config';
import jwtConfig from './config/jwt.config';
import emailConfig from './config/email.config';
import awsConfig from './config/aws.config';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { MbtiModule } from './modules/mbti/mbti.module';
import { ResponseInterceptor } from './utils/interceptors/response.interceptor';
import { HttpExceptionFilter } from './utils/filters/http-exception.filter';
import { BullModule } from '@nestjs/bullmq';
import redisConfig, { RedisConfig } from './config/redis.config';
import { SuitabilityModule } from './modules/suitability/suitability.module';
import { QuestionModule } from './modules/question/question.module';

const apiModule = [
  AuthModule,
  UserModule,
  MbtiModule,
  SuitabilityModule,
  QuestionModule,
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
          synchronize: true,
          migrations: [__dirname + '/migrations/*.ts'],
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
