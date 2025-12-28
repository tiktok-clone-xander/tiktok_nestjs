import { RefreshToken, User } from '@app/auth-db';
import { RedisService } from '@app/redis';
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisService: RedisService,
  ) {}

  async register(data: { email: string; username: string; password: string; fullName?: string }) {
    const { email, username, password, fullName } = data;

    // Check if user exists
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { username }],
    });

    if (existingUser) {
      throw new ConflictException('Email or username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = this.userRepository.create({
      email,
      username,
      password: hashedPassword,
      fullName,
    });

    const savedUser = await this.userRepository.save(user);

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(savedUser);

    // Store session in Redis
    await this.redisService.setSession(savedUser.id, {
      userId: savedUser.id,
      email: savedUser.email,
      username: savedUser.username,
    });

    this.logger.log(`User registered successfully: ${savedUser.email}`);

    return {
      user: this.sanitizeUser(savedUser),
      accessToken,
      refreshToken,
    };
  }

  async login(data: { username: string; password: string }) {
    const { username, password } = data;

    // Find user by email or username
    const user = await this.userRepository.findOne({
      where: [{ email: username }, { username }],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);

    // Store session in Redis
    await this.redisService.setSession(user.id, {
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    this.logger.log(`User logged in successfully: ${user.email}`);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async validateToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
      });

      return {
        valid: true,
        userId: payload.sub,
        email: payload.email,
        username: payload.username,
      };
    } catch (error) {
      this.logger.error('Token validation failed', error);
      return {
        valid: false,
        userId: '',
        email: '',
        username: '',
      };
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const tokens = await this.generateTokens(user);

      return {
        user: this.sanitizeUser(user),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      this.logger.error('Refresh token failed', error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    await this.redisService.deleteSession(userId);
    this.logger.log(`User logged out: ${userId}`);
    return { success: true };
  }

  async getUserById(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION', '3d'),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '7d'),
    });

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: User) {
    const { password: _password, ...result } = user;
    return {
      ...result,
      avatar: user.avatar || null, // Ensure avatar is always present
      createdAt: user.createdAt.toISOString(),
    };
  }

  async updateProfile(userId: string, data: { fullName?: string; bio?: string; avatar?: string }) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (data.fullName !== undefined) {
      user.fullName = data.fullName;
    }
    if (data.bio !== undefined) {
      user.bio = data.bio;
    }
    if (data.avatar !== undefined) {
      user.avatar = data.avatar;
    }

    const updatedUser = await this.userRepository.save(user);
    return this.sanitizeUser(updatedUser);
  }

  async searchUsers(query: string, page = 1, limit = 20) {
    if (!query || query.trim().length < 2) {
      return {
        users: [],
        page,
        limit,
        total: 0,
      };
    }

    const skip = (page - 1) * limit;
    const searchPattern = `%${query.toLowerCase()}%`;

    const [users, total] = await this.userRepository
      .createQueryBuilder('user')
      .where('LOWER(user.username) LIKE :pattern', { pattern: searchPattern })
      .orWhere('LOWER(user.fullName) LIKE :pattern', { pattern: searchPattern })
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      users: users.map((user) => this.sanitizeUser(user)),
      page,
      limit,
      total,
    };
  }

  async getUsersByIds(userIds: string[]) {
    if (!userIds || userIds.length === 0) {
      return { users: [] };
    }

    const users = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id IN (:...userIds)', { userIds })
      .getMany();

    return {
      users: users.map((user) => this.sanitizeUser(user)),
    };
  }
}
