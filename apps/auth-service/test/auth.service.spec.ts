import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../src/auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '@app/database/entities/user.entity';
import { RedisService } from '@app/redis';
import { RabbitMQService } from '@app/rabbitmq';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let redisService: RedisService;
  let userRepository: any;

  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    username: 'testuser',
    fullName: 'Test User',
    password: 'hashedpassword',
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockRedisService = {
    setSession: jest.fn(),
    getSession: jest.fn(),
    deleteSession: jest.fn(),
  };

  const mockRabbitMQService = {
    publishMessage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: RabbitMQService,
          useValue: mockRabbitMQService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    redisService = module.get<RedisService>(RedisService);
    userRepository = module.get(getRepositoryToken(User));

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      fullName: 'Test User',
    };

    it('should successfully register a new user', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('mock-token');

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockUserRepository.findOne).toHaveBeenCalledTimes(2); // email and username check
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw error if email already exists', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(RpcException);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
    });

    it('should throw error if username already exists', async () => {
      mockUserRepository.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(RpcException);
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const userWithHashedPassword = { ...mockUser, password: hashedPassword };
      
      mockUserRepository.findOne.mockResolvedValue(userWithHashedPassword);
      mockJwtService.signAsync.mockResolvedValue('mock-token');
      mockRedisService.setSession.mockResolvedValue(true);

      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
    });

    it('should throw error with invalid credentials', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(RpcException);
    });

    it('should throw error with wrong password', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      await expect(service.login(loginDto)).rejects.toThrow(RpcException);
    });
  });

  describe('validateToken', () => {
    it('should validate a valid token', async () => {
      const token = 'valid-token';
      const payload = { sub: mockUser.id, email: mockUser.email };

      mockJwtService.verifyAsync.mockResolvedValue(payload);
      mockRedisService.getSession.mockResolvedValue('session-data');
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.validateToken({ token });

      expect(result).toHaveProperty('valid', true);
      expect(result).toHaveProperty('userId', mockUser.id);
    });

    it('should return invalid for expired token', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Token expired'));

      const result = await service.validateToken({ token: 'expired-token' });

      expect(result).toHaveProperty('valid', false);
    });
  });

  describe('refreshToken', () => {
    it('should generate new tokens with valid refresh token', async () => {
      const refreshToken = 'valid-refresh-token';
      const payload = { sub: mockUser.id, email: mockUser.email, type: 'refresh' };

      mockJwtService.verifyAsync.mockResolvedValue(payload);
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('new-token');
      mockRedisService.setSession.mockResolvedValue(true);

      const result = await service.refreshToken({ refreshToken });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw error with invalid refresh token', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(
        service.refreshToken({ refreshToken: 'invalid-token' }),
      ).rejects.toThrow(RpcException);
    });
  });

  describe('logout', () => {
    it('should successfully logout user', async () => {
      mockRedisService.deleteSession.mockResolvedValue(true);

      const result = await service.logout({ userId: mockUser.id });

      expect(result).toEqual({ success: true });
      expect(mockRedisService.deleteSession).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getUserById({ userId: mockUser.id });

      expect(result).toHaveProperty('user');
      expect(result.user.id).toBe(mockUser.id);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });

    it('should throw error if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getUserById({ userId: 'non-existent-id' }),
      ).rejects.toThrow(RpcException);
    });
  });
});
