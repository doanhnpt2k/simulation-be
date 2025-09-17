import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Repository } from 'typeorm';

import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { MailService, PayloadMailJob } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserEntity } from './entitys/user.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  private readonly crypto: {
    hash: (data: string, saltOrRounds: string | number) => Promise<string>;
    compare: (data: string, encrypted: string) => Promise<boolean>;
  } = bcrypt as unknown as {
    hash: (data: string, saltOrRounds: string | number) => Promise<string>;
    compare: (data: string, encrypted: string) => Promise<boolean>;
  };
  async findOneById(id: string) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      this.logger.error(
        `Failed to find user ${id}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new BadRequestException('Failed to find user');
    }
  }

  async createUser(createUserDto: CreateUserDto) {
    try {
      const userData = this.userRepository.create(createUserDto);
      return this.userRepository.save(userData);
    } catch (error) {
      this.logger.error(
        `Failed to create user ${createUserDto.email}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new BadRequestException('Failed to create user');
    }
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const updateData: Partial<UserEntity> = {};

      if (
        updateUserDto.name !== undefined &&
        updateUserDto.name !== user.name
      ) {
        updateData.name = updateUserDto.name;
      }

      if (Object.keys(updateData).length === 0) {
        throw new BadRequestException('No changes to update');
      }

      await this.userRepository.update(id, updateData);
      return 'User updated successfully';
    } catch (err) {
      this.logger.error(
        `Failed to update user ${id}: ${err instanceof Error ? err.message : String(err)}`,
      );
      throw new BadRequestException('Failed to update user');
    }
  }

  async requestValidateToken(id: string) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      const validateToken = await this.jwtService.signAsync(
        {
          sub: user.id,
          type: 'validate',
        },
        { expiresIn: '15m' },
      );
      const payload: PayloadMailJob = {
        to: user.email,
        subject: 'Welcome to Nice App! Confirm your Email',
        template: './confirmation',
        context: {
          name: user.name || 'User',
          token: validateToken,
        },
      };
      await this.mailService.sendUserConfirmation(payload);
      return {
        message:
          'You will receive an email with a link to validate your account',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to request validate token ${id}: ${message}`);
      throw new BadRequestException(message);
    }
  }

  async validateToken(user: UserEntity, validateToken: string) {
    try {
      const decoded =
        await this.jwtService.verifyAsync<JwtPayload>(validateToken);
      if (decoded.type !== 'validate' || decoded.sub !== user.id) {
        throw new BadRequestException('Invalid token');
      }
      return {
        message: 'Token validated successfully',
        validate: true,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to validate token: ${message}`);
      throw new BadRequestException(message);
    }
  }
  async changePassword(id: string, dto: ChangePasswordDto) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      const { validate, message } = await this.validateToken(
        user,
        dto.validateToken,
      );
      if (!validate) {
        throw new BadRequestException(message);
      }
      const currentPasswordHash = user.password;
      const ok: boolean = await this.crypto.compare(
        dto.currentPassword,
        currentPasswordHash,
      );
      if (!ok) {
        throw new BadRequestException('Old password is incorrect');
      }
      const passwordHash: string = await this.crypto.hash(dto.newPassword, 10);
      await this.userRepository.update(id, { password: passwordHash });
      return 'Password changed successfully';
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to change password ${id}: ${message}`);
      throw new BadRequestException(message);
    }
  }
}
