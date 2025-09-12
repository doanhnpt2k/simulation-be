import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}
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
      const updatedUser = this.userRepository.merge(user, updateUserDto);
      return this.userRepository.save(updatedUser);
    } catch (err) {
      this.logger.error(
        `Failed to update user ${id}: ${err instanceof Error ? err.message : String(err)}`,
      );
      throw new BadRequestException('Failed to update user');
    }
  }
}
