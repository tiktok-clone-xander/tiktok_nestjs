import { KafkaService } from '@app/kafka';
import { RedisService } from '@app/redis';
import { Video, VideoView } from '@app/video-db';
import { RpcException } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { VideoService } from '../src/video.service';

describe('VideoService', () => {
  let service: VideoService;

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
  };

  const mockVideoRepository = {
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[mockVideo], 1]),
    })),
  };

  const mockVideoViewRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
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

  const mockKafkaService = {
    emit: jest.fn(),
  };

  const mockInteractionClient = {
    getService: jest.fn().mockReturnValue({
      getMultipleLikeStatus: jest.fn().mockReturnValue({
        pipe: jest.fn().mockReturnThis(),
        toPromise: jest.fn().mockResolvedValue({ likeInfos: [] }),
      }),
    }),
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
          provide: getRepositoryToken(VideoView),
          useValue: mockVideoViewRepository,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: KafkaService,
          useValue: mockKafkaService,
        },
        {
          provide: 'INTERACTION_SERVICE',
          useValue: mockInteractionClient,
        },
      ],
    }).compile();

    service = module.get<VideoService>(VideoService);
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
      mockVideoRepository.create.mockReturnValue(mockVideo);
      mockVideoRepository.save.mockResolvedValue(mockVideo);

      const result = await service.createVideo(createVideoDto);

      expect(result).toHaveProperty('video');
      expect(result.video.title).toBe(createVideoDto.title);
      expect(mockVideoRepository.create).toHaveBeenCalled();
      expect(mockVideoRepository.save).toHaveBeenCalled();
    });

    it('should throw error if video creation fails', async () => {
      mockVideoRepository.create.mockReturnValue(mockVideo);
      mockVideoRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.createVideo(createVideoDto)).rejects.toThrow(RpcException);
    });
  });

  describe('getVideo', () => {
    it('should return video from database', async () => {
      mockVideoRepository.findOne.mockResolvedValue(mockVideo);

      const result = await service.getVideo('video-id');

      expect(result).toHaveProperty('id', 'video-id');
      expect(result).toHaveProperty('title', 'Test Video');
      expect(mockVideoRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'video-id' },
      });
    });

    it('should throw error if video not found', async () => {
      mockVideoRepository.findOne.mockResolvedValue(null);

      await expect(service.getVideo('non-existent-id')).rejects.toThrow(RpcException);
    });
  });

  describe('deleteVideo', () => {
    it('should successfully delete video', async () => {
      mockVideoRepository.findOne.mockResolvedValue(mockVideo);
      mockVideoRepository.remove.mockResolvedValue(mockVideo);
      mockRedisService.del.mockResolvedValue(true);

      const result = await service.deleteVideo('video-id', 'user-id');

      expect(result).toHaveProperty('success', true);
      expect(mockVideoRepository.remove).toHaveBeenCalled();
    });

    it('should throw error if video not found', async () => {
      mockVideoRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteVideo('non-existent-id', 'user-id')).rejects.toThrow(RpcException);
    });
  });
});
