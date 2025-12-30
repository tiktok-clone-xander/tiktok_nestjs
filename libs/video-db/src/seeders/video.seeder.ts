import { DataSource, Repository } from 'typeorm';
import { VideoView, ViewSource } from '../entities/video-view.entity';
import { Video, VideoQuality, VideoStatus } from '../entities/video.entity';

export interface SeededVideo {
  id: string;
  userId: string;
  title: string;
}

export interface SeededUser {
  id: string;
  username: string;
}

export class VideoSeeder {
  private videoRepository: Repository<Video>;
  private videoViewRepository: Repository<VideoView>;

  constructor(private dataSource: DataSource) {
    this.videoRepository = this.dataSource.getRepository(Video);
    this.videoViewRepository = this.dataSource.getRepository(VideoView);
  }

  async seed(users: SeededUser[]): Promise<SeededVideo[]> {
    console.log('🌱 [Video] Starting database seeding...');

    if (!users || users.length === 0) {
      console.error('❌ [Video] No users provided for seeding');
      throw new Error('Users are required to seed videos');
    }

    try {
      // Check if data already exists
      const videoCount = await this.videoRepository.count();
      if (videoCount > 0) {
        console.log('⚠️  [Video] Database already has data. Returning existing videos.');
        const existingVideos = await this.videoRepository.find();
        return existingVideos.map((v) => ({
          id: v.id,
          userId: v.userId,
          title: v.title,
        }));
      }

      // Seed videos
      const videos = await this.seedVideos(users);
      console.log(`✅ [Video] Created ${videos.length} videos`);

      // Seed video views
      const viewsCount = await this.seedVideoViews(videos, users);
      console.log(`✅ [Video] Created ${viewsCount} video views`);

      console.log('🎉 [Video] Database seeding completed successfully!');
      return videos;
    } catch (error) {
      console.error('❌ [Video] Error seeding database:', error);
      throw error;
    }
  }

  private async seedVideos(users: SeededUser[]): Promise<SeededVideo[]> {
    const videosData = [
      {
        title: 'My First TikTok!',
        description: 'Welcome to my channel! #firstpost #newcreator',
        videoUrl: 'https://storage.example.com/videos/sample1.mp4',
        thumbnailUrl: 'https://storage.example.com/thumbnails/sample1.jpg',
        duration: 15,
        fileSize: 5242880, // 5MB
        quality: VideoQuality.HD,
        status: VideoStatus.PUBLISHED,
        tags: ['firstpost', 'newcreator', 'welcome'],
        isPublic: true,
        allowComments: true,
        views: 1250,
        likesCount: 89,
        commentsCount: 12,
        sharesCount: 5,
        metadata: { width: 1080, height: 1920, fps: 30, codec: 'h264' },
      },
      {
        title: 'Amazing Travel Destination',
        description: 'Check out this beautiful place! #travel #adventure #nature',
        videoUrl: 'https://storage.example.com/videos/sample2.mp4',
        thumbnailUrl: 'https://storage.example.com/thumbnails/sample2.jpg',
        duration: 30,
        fileSize: 10485760, // 10MB
        quality: VideoQuality.FHD,
        status: VideoStatus.PUBLISHED,
        tags: ['travel', 'adventure', 'nature', 'beautiful'],
        isPublic: true,
        allowComments: true,
        views: 5420,
        likesCount: 342,
        commentsCount: 45,
        sharesCount: 28,
        metadata: { width: 1080, height: 1920, fps: 60, codec: 'h264' },
      },
      {
        title: 'Quick Workout Routine',
        description: '5-minute morning workout | #fitness #health #workout',
        videoUrl: 'https://storage.example.com/videos/sample3.mp4',
        thumbnailUrl: 'https://storage.example.com/thumbnails/sample3.jpg',
        duration: 45,
        fileSize: 15728640, // 15MB
        quality: VideoQuality.HD,
        status: VideoStatus.PUBLISHED,
        tags: ['fitness', 'health', 'workout', 'morning'],
        isPublic: true,
        allowComments: true,
        views: 8900,
        likesCount: 567,
        commentsCount: 78,
        sharesCount: 45,
        metadata: { width: 1080, height: 1920, fps: 30, codec: 'h264' },
      },
      {
        title: 'Easy Pasta Recipe',
        description: 'Cook this delicious pasta in 15 minutes! #cooking #recipe #food',
        videoUrl: 'https://storage.example.com/videos/sample4.mp4',
        thumbnailUrl: 'https://storage.example.com/thumbnails/sample4.jpg',
        duration: 60,
        fileSize: 20971520, // 20MB
        quality: VideoQuality.FHD,
        status: VideoStatus.PUBLISHED,
        tags: ['cooking', 'recipe', 'food', 'pasta', 'easy'],
        isPublic: true,
        allowComments: true,
        views: 12500,
        likesCount: 890,
        commentsCount: 123,
        sharesCount: 67,
        metadata: { width: 1080, height: 1920, fps: 30, codec: 'h264' },
      },
      {
        title: 'Behind The Music',
        description: 'Studio session vibes 🎶 #music #producer #studio',
        videoUrl: 'https://storage.example.com/videos/sample5.mp4',
        thumbnailUrl: 'https://storage.example.com/thumbnails/sample5.jpg',
        duration: 20,
        fileSize: 8388608, // 8MB
        quality: VideoQuality.HD,
        status: VideoStatus.PUBLISHED,
        tags: ['music', 'producer', 'studio', 'behindthescenes'],
        isPublic: true,
        allowComments: true,
        views: 3400,
        likesCount: 234,
        commentsCount: 34,
        sharesCount: 15,
        metadata: { width: 1080, height: 1920, fps: 30, codec: 'h264' },
      },
      {
        title: 'Fashion Week Highlights',
        description: 'Best moments from this season! #fashion #style #runway',
        videoUrl: 'https://storage.example.com/videos/sample6.mp4',
        thumbnailUrl: 'https://storage.example.com/thumbnails/sample6.jpg',
        duration: 45,
        fileSize: 15728640, // 15MB
        quality: VideoQuality.FHD,
        status: VideoStatus.PUBLISHED,
        tags: ['fashion', 'style', 'runway', 'fashionweek'],
        isPublic: true,
        allowComments: true,
        views: 7800,
        likesCount: 456,
        commentsCount: 67,
        sharesCount: 34,
        metadata: { width: 1080, height: 1920, fps: 60, codec: 'h264' },
      },
      {
        title: 'Gaming Highlights - Epic Wins!',
        description: 'Check out these insane plays! #gaming #esports #clips',
        videoUrl: 'https://storage.example.com/videos/sample7.mp4',
        thumbnailUrl: 'https://storage.example.com/thumbnails/sample7.jpg',
        duration: 35,
        fileSize: 12582912, // 12MB
        quality: VideoQuality.FHD,
        status: VideoStatus.PUBLISHED,
        tags: ['gaming', 'esports', 'clips', 'epicwins'],
        isPublic: true,
        allowComments: true,
        views: 15600,
        likesCount: 1234,
        commentsCount: 189,
        sharesCount: 89,
        metadata: { width: 1080, height: 1920, fps: 60, codec: 'h264' },
      },
      {
        title: 'DIY Home Decor Ideas',
        description: 'Transform your space on a budget! #diy #homedecor #crafts',
        videoUrl: 'https://storage.example.com/videos/sample8.mp4',
        thumbnailUrl: 'https://storage.example.com/thumbnails/sample8.jpg',
        duration: 55,
        fileSize: 18874368, // 18MB
        quality: VideoQuality.HD,
        status: VideoStatus.PUBLISHED,
        tags: ['diy', 'homedecor', 'crafts', 'budget'],
        isPublic: true,
        allowComments: true,
        views: 6200,
        likesCount: 378,
        commentsCount: 56,
        sharesCount: 42,
        metadata: { width: 1080, height: 1920, fps: 30, codec: 'h264' },
      },
      {
        title: 'Cute Pets Compilation',
        description: 'The cutest pets on the internet! 🐾 #pets #cute #animals',
        videoUrl: 'https://storage.example.com/videos/sample9.mp4',
        thumbnailUrl: 'https://storage.example.com/thumbnails/sample9.jpg',
        duration: 40,
        fileSize: 14680064, // 14MB
        quality: VideoQuality.HD,
        status: VideoStatus.PUBLISHED,
        tags: ['pets', 'cute', 'animals', 'compilation'],
        isPublic: true,
        allowComments: true,
        views: 25000,
        likesCount: 2100,
        commentsCount: 320,
        sharesCount: 156,
        metadata: { width: 1080, height: 1920, fps: 30, codec: 'h264' },
      },
      {
        title: 'Learn JavaScript in 60 Seconds',
        description: 'Quick coding tips! #coding #javascript #programming #tech',
        videoUrl: 'https://storage.example.com/videos/sample10.mp4',
        thumbnailUrl: 'https://storage.example.com/thumbnails/sample10.jpg',
        duration: 60,
        fileSize: 20971520, // 20MB
        quality: VideoQuality.FHD,
        status: VideoStatus.PUBLISHED,
        tags: ['coding', 'javascript', 'programming', 'tech', 'tutorial'],
        isPublic: true,
        allowComments: true,
        views: 9800,
        likesCount: 678,
        commentsCount: 89,
        sharesCount: 78,
        metadata: { width: 1080, height: 1920, fps: 30, codec: 'h264' },
      },
    ];

    const videos: SeededVideo[] = [];
    for (let i = 0; i < videosData.length; i++) {
      const videoData = videosData[i];
      const user = users[i % users.length]; // Distribute videos among users

      const video = this.videoRepository.create({
        ...videoData,
        userId: user.id,
      });

      const savedVideo = await this.videoRepository.save(video);
      videos.push({
        id: savedVideo.id,
        userId: savedVideo.userId,
        title: savedVideo.title,
      });
    }

    return videos;
  }

  private async seedVideoViews(videos: SeededVideo[], users: SeededUser[]): Promise<number> {
    const viewsData: Partial<VideoView>[] = [];
    const sources = Object.values(ViewSource);

    // Create some video views for each video
    for (const video of videos) {
      const numViews = Math.floor(Math.random() * 5) + 3; // 3-7 views per video

      for (let i = 0; i < numViews; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomSource = sources[Math.floor(Math.random() * sources.length)];
        const watchDuration = Math.floor(Math.random() * 60) + 10;
        const completionRate = Math.min(100, (watchDuration / 60) * 100);

        viewsData.push({
          videoId: video.id,
          userId: randomUser.id,
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Mobile; TikTok Clone App)',
          source: randomSource,
          watchDuration,
          completionRate: Math.round(completionRate * 100) / 100,
          isUnique: i === 0,
        });
      }
    }

    for (const viewData of viewsData) {
      const view = this.videoViewRepository.create(viewData);
      await this.videoViewRepository.save(view);
    }

    return viewsData.length;
  }

  async clear() {
    console.log('🗑️  [Video] Clearing database...');

    try {
      await this.videoViewRepository.delete({});
      await this.videoRepository.delete({});
      console.log('✅ [Video] Database cleared successfully!');
    } catch (error) {
      console.error('❌ [Video] Error clearing database:', error);
      throw error;
    }
  }
}
