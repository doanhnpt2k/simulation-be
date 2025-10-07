import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Inject,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UserService } from '../user/user.service';
import { UserStatus } from '../user/user.type';
import type { JwtPayload } from './interfaces/jwt-payload.interface';
import { MbtiService } from '../mbti/mbti.service';
import { SuitabilityService } from '../suitability/suitability.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @Inject(UserService) private readonly userService: UserService,
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(MbtiService) private readonly mbtiService: MbtiService,
    @Inject(SuitabilityService)
    private readonly suitabilityService: SuitabilityService,
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
      const existing = await this.userService.findOneByEmail(payload.email);
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
      const user = await this.userService.findOneByEmail(payload.email);
      if (!user) throw new UnauthorizedException('Invalid credentials: email');
      const ok: boolean = await this.crypto.compare(
        payload.password,
        user.password,
      );
      if (!ok) throw new UnauthorizedException('Invalid credentials: password');

      // Cập nhật lastLoginAt
      await this.userService.updateUser(user.id, {
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
      const user = await this.userService.findOneById(userId);
      if (!user) throw new BadRequestException('User not found');
      const mbtiType = user.mbtiTypeId
        ? await this.mbtiService.getOneMbtiType(user.mbtiTypeId)
        : null;
      const suitabilityType = user.suitabilityTypeId
        ? await this.suitabilityService.getOneSuitabilityType(
            user.suitabilityTypeId,
          )
        : null;
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
        suitabilityType: suitabilityType,
        lastSuitabilityTestAt: user.lastSuitabilityTestAt,
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
      const user = await this.userService.findOneById(decoded.sub);

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
