import { Test, TestingModule } from '@nestjs/testing';
import { VideoService } from '../src/video.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Video } from '@app/database/entities/video.entity';
import { User } from '@app/database/entities/user.entity';
import { RedisService } from '@app/redis';
import { RabbitMQService } from '@app/rabbitmq';
import { RpcException } from '@nestjs/microservices';

describe('VideoService', () => {
  let service: VideoService;
  let videoRepository: any;
  let userRepository: any;
  let redisService: RedisService;
  let rabbitMQService: RabbitMQService;

  const mockUser = {
    id: 'user-id',
    email: 'test@example.com',
    username: 'testuser',
    fullName: 'Test User',
  };

  const mockVideo = {
    id: 'video-id',
    userId: 'user-id',
    title: 'Test Video',
    description: 'Test Description',
    videoUrl: 'https://example.com/video.mp4',
    thumbnailUrl: 'https://example.com/thumb.jpg',
    duration: 60,
    views: 100,
    likesCount: 10,
    commentsCount: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: mockUser,
  };

  const mockVideoRepository = {
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    getViews: jest.fn(),
    getLikes: jest.fn(),
    getCommentsCount: jest.fn(),
    incrementViews: jest.fn(),
    cacheFeed: jest.fn(),
    getCachedFeed: jest.fn(),
    invalidateFeedCache: jest.fn(),
  };

  const mockRabbitMQService = {
    publish: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideoService,
        {
          provide: getRepositoryToken(Video),
          useValue: mockVideoRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
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

    service = module.get<VideoService>(VideoService);
    videoRepository = module.get(getRepositoryToken(Video));
    userRepository = module.get(getRepositoryToken(User));
    redisService = module.get<RedisService>(RedisService);
    rabbitMQService = module.get<RabbitMQService>(RabbitMQService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createVideo', () => {
    const createVideoDto = {
      userId: 'user-id',
      title: 'Test Video',
      description: 'Test Description',
      videoUrl: 'https://example.com/video.mp4',
      thumbnailUrl: 'https://example.com/thumb.jpg',
      duration: 60,
    };

    it('should successfully create a video', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockVideoRepository.create.mockReturnValue(mockVideo);
      mockVideoRepository.save.mockResolvedValue(mockVideo);
      mockRedisService.set.mockResolvedValue(true);
      mockRedisService.invalidateFeedCache.mockResolvedValue(true);
      mockRabbitMQService.publish.mockResolvedValue(true);

      const result = await service.createVideo(createVideoDto);

      expect(result).toHaveProperty('video');
      expect(result.video.title).toBe(createVideoDto.title);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: createVideoDto.userId },
      });
      expect(mockVideoRepository.create).toHaveBeenCalled();
      expect(mockVideoRepository.save).toHaveBeenCalled();
      expect(mockRabbitMQService.publish).toHaveBeenCalledWith(
        'video.created',
        expect.any(Object),
      );
    });

    it('should throw error if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.createVideo(createVideoDto)).rejects.toThrow(
        RpcException,
      );
    });
  });

  describe('getVideo', () => {
    it('should return video from cache if available', async () => {
      const cachedVideo = JSON.stringify(mockVideo);
      mockRedisService.get.mockResolvedValue(cachedVideo);

      const result = await service.getVideo('video-id');

      expect(result).toHaveProperty('video');
      expect(mockRedisService.get).toHaveBeenCalledWith('video:video-id');
      expect(mockVideoRepository.findOne).not.toHaveBeenCalled();
    });

    it('should fetch from database if not in cache', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockVideoRepository.findOne.mockResolvedValue(mockVideo);
      mockRedisService.getViews.mockResolvedValue(100);
      mockRedisService.getLikes.mockResolvedValue(10);
      mockRedisService.getCommentsCount.mockResolvedValue(5);
      mockRedisService.set.mockResolvedValue(true);

      const result = await service.getVideo('video-id');

      expect(result).toHaveProperty('video');
      expect(mockVideoRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'video-id' },
        relations: ['user'],
      });
      expect(mockRedisService.set).toHaveBeenCalled();
    });

    it('should throw error if video not found', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockVideoRepository.findOne.mockResolvedValue(null);

      await expect(service.getVideo('non-existent-id')).rejects.toThrow(
        RpcException,
      );
    });
  });

  describe('getFeed', () => {
    it('should return cached feed if available', async () => {
      const cachedFeed = [mockVideo];
      mockRedisService.getCachedFeed.mockResolvedValue(cachedFeed);

      const result = await service.getFeed(undefined, 1, 10);

      expect(result).toHaveProperty('videos');
      expect(result.videos).toEqual(cachedFeed);
      expect(mockVideoRepository.findAndCount).not.toHaveBeenCalled();
    });

    it('should fetch from database and cache if not cached', async () => {
      mockRedisService.getCachedFeed.mockResolvedValue(null);
      mockVideoRepository.findAndCount.mockResolvedValue([[mockVideo], 1]);
      mockRedisService.getViews.mockResolvedValue(100);
      mockRedisService.getLikes.mockResolvedValue(10);
      mockRedisService.getCommentsCount.mockResolvedValue(5);
      mockRedisService.cacheFeed.mockResolvedValue(true);

      const result = await service.getFeed(undefined, 1, 10);

      expect(result).toHaveProperty('videos');
      expect(result.videos.length).toBe(1);
      expect(mockVideoRepository.findAndCount).toHaveBeenCalled();
      expect(mockRedisService.cacheFeed).toHaveBeenCalled();
    });
  });

  describe('deleteVideo', () => {
    it('should successfully delete video', async () => {
      mockVideoRepository.findOne.mockResolvedValue(mockVideo);
      mockVideoRepository.remove.mockResolvedValue(mockVideo);
      mockRedisService.del.mockResolvedValue(true);
      mockRedisService.invalidateFeedCache.mockResolvedValue(true);
      mockRabbitMQService.publish.mockResolvedValue(true);

      const result = await service.deleteVideo('video-id', 'user-id');

      expect(result).toEqual({ success: true });
      expect(mockVideoRepository.remove).toHaveBeenCalled();
      expect(mockRabbitMQService.publish).toHaveBeenCalledWith(
        'video.deleted',
        expect.any(Object),
      );
    });

    it('should throw error if user is not the owner', async () => {
      mockVideoRepository.findOne.mockResolvedValue(mockVideo);

      await expect(
        service.deleteVideo('video-id', 'different-user-id'),
      ).rejects.toThrow(RpcException);
    });

    it('should throw error if video not found', async () => {
      mockVideoRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteVideo('non-existent-id', 'user-id')).rejects.toThrow(
        RpcException,
      );
    });
  });

  describe('updateVideoStats', () => {
    it('should successfully update video stats', async () => {
      const video = { ...mockVideo };
      mockVideoRepository.findOne.mockResolvedValue(video);
      mockVideoRepository.save.mockResolvedValue(video);
      mockRedisService.del.mockResolvedValue(true);

      const result = await service.updateVideoStats({
        videoId: 'video-id',
        views: 200,
        likesCount: 20,
      });

      expect(result).toEqual({ success: true });
      expect(mockVideoRepository.save).toHaveBeenCalled();
    });
  });

  describe('searchVideos', () => {
    it('should search videos by query', async () => {
      mockVideoRepository.findAndCount.mockResolvedValue([[mockVideo], 1]);
      mockRedisService.getViews.mockResolvedValue(100);
      mockRedisService.getLikes.mockResolvedValue(10);
      mockRedisService.getCommentsCount.mockResolvedValue(5);

      const result = await service.searchVideos('test', 1, 10);

      expect(result).toHaveProperty('videos');
      expect(result.videos.length).toBe(1);
      expect(mockVideoRepository.findAndCount).toHaveBeenCalled();
    });
  });
});
