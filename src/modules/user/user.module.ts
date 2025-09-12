import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserEntity } from './user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])], //Register the UserEntity in the TypeOrmModule
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
