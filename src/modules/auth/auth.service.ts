import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Inject,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/entitys/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UserService } from '../user/user.service';
import { UserStatus } from '../user/user.type';
import type { JwtPayload } from './interfaces/jwt-payload.interface';
import { MbtiTypeEntity } from '../mbti/entities/mbti-type.entity';
import { MbtiResultEntity } from '../mbti/entities/mbti-result.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(MbtiTypeEntity)
    private readonly mbtiTypeRepository: Repository<MbtiTypeEntity>,
    @InjectRepository(MbtiResultEntity)
    private readonly mbtiResultRepository: Repository<MbtiResultEntity>,
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(UserService) private readonly userService: UserService,
  ) {}

  private readonly crypto: {
    hash: (data: string, saltOrRounds: string | number) => Promise<string>;
    compare: (data: string, encrypted: string) => Promise<boolean>;
  } = bcrypt as unknown as {
    hash: (data: string, saltOrRounds: string | number) => Promise<string>;
    compare: (data: string, encrypted: string) => Promise<boolean>;
  };

  async register(payload: RegisterDto) {
    try {
      const existing = await this.userRepo.findOne({
        where: { email: payload.email },
      });
      if (existing) throw new BadRequestException('Email already exists');

      const passwordHash: string = await this.crypto.hash(payload.password, 10);
      await this.userService.createUser({
        name: '',
        email: payload.email,
        password: passwordHash,
      });
      return { message: 'Register successfully' };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to register: ${message}`);
      throw new BadRequestException(message);
    }
  }

  async login(payload: LoginDto) {
    try {
      const user = await this.userRepo.findOne({
        where: { email: payload.email },
      });
      if (!user) throw new UnauthorizedException('Invalid credentials: email');
      const ok: boolean = await this.crypto.compare(
        payload.password,
        user.password,
      );
      if (!ok) throw new UnauthorizedException('Invalid credentials: password');

      // Cập nhật lastLoginAt
      await this.userRepo.update(user.id, {
        lastLoginAt: new Date(),
      });

      const accessToken = await this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
          type: 'access',
        },
        { expiresIn: '7d' },
      );

      const refreshToken = await this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
          type: 'refresh',
        },
        { expiresIn: '7d' },
      );

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to login: ${message}`);
      throw new BadRequestException(message);
    }
  }

  async getMe(userId: string) {
    try {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) throw new BadRequestException('User not found');
      const mbtiType = user.mbtiTypeId
        ? await this.mbtiTypeRepository.findOne({
            where: { id: user.mbtiTypeId },
          })
        : null;
      const lastResult = await this.mbtiResultRepository.findOne({
        where: { userId: user.id },
        order: { createdAt: 'DESC' },
      });
      console.log(lastResult);

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastMbtiTestAt: user.lastMbtiTestAt,
        mbtiType: mbtiType,
        lastResult: lastResult
          ? {
              scores: {
                E: lastResult.eScore,
                I: lastResult.iScore,
                S: lastResult.sScore,
                N: lastResult.nScore,
                T: lastResult.tScore,
                F: lastResult.fScore,
                J: lastResult.jScore,
                P: lastResult.pScore,
              },
              percentages: {
                E: lastResult.ePercentage,
                I: lastResult.iPercentage,
                S: lastResult.sPercentage,
                N: lastResult.nPercentage,
                T: lastResult.tPercentage,
                F: lastResult.fPercentage,
                J: lastResult.jPercentage,
                P: lastResult.pPercentage,
              },
              createdAt: lastResult.createdAt,
            }
          : null,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get user info: ${message}`);
      throw new BadRequestException(message);
    }
  }

  async refreshToken(payload: RefreshTokenDto) {
    try {
      // Verify refresh token
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const decoded = (await this.jwtService.verifyAsync(
        payload.refreshToken,
      )) as JwtPayload;

      if (decoded.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Tìm user
      const user = await this.userRepo.findOne({
        where: { id: decoded.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (user.status === UserStatus.INACTIVE) {
        throw new UnauthorizedException('Account is inactive');
      }

      // Tạo access token mới
      const newAccessToken = await this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
          type: 'access',
        },
        {
          expiresIn: '7d',
        },
      );

      return { accessToken: newAccessToken };
    } catch (error) {
      this.logger.error(
        `Failed to refresh token: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
