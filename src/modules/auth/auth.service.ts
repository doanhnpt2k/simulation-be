import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Inject,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UserService } from '../user/user.service';
import { UserStatus } from '../user/user.type';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
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
        { expiresIn: '15m' },
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

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
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
      const decoded = await this.jwtService.verifyAsync(payload.refreshToken);

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
        { expiresIn: '15m' },
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
