import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import postgresConfig, { PostgresConfig } from './config/postgres.config';
import jwtConfig from './config/jwt.config';
import { UserEntity } from './modules/user/user.entity';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ResponseInterceptor } from './utils/interceptors/response.interceptor';
import { HttpExceptionFilter } from './utils/filters/http-exception.filter';

const apiModule = [UserModule, AuthModule];
const entities = [UserEntity];
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [postgresConfig, jwtConfig],
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
