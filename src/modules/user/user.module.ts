import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from '../mail/mail.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfig } from '@/config/jwt.config';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from './entitys/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]), //Register the UserEntity in the TypeOrmModule
    MailModule,
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => {
        const jwtConfig = config.get<JwtConfig>('jwt');
        if (!jwtConfig) {
          throw new Error('Jwt config not found');
        }
        return {
          secret: jwtConfig.secret,
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
