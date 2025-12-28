import { SentryService } from '@app/common/sentry';
import { Injectable, Logger } from '@nestjs/common';

/**
 * Example service demonstrating Sentry usage
 * This is a reference implementation showing best practices
 */
@Injectable()
export class VideoProcessingService {
  private readonly logger = new Logger(VideoProcessingService.name);

  constructor(private readonly sentryService: SentryService) {}

  /**
   * Example 1: Manual exception capture with context
   */
  async uploadVideo(userId: string, file: Express.Multer.File) {
    // Start transaction for performance monitoring
    const transaction = this.sentryService.startTransaction('video.upload', 'task');

    try {
      // Add breadcrumb for tracking flow
      this.sentryService.addBreadcrumb({
        type: 'info',
        category: 'video',
        message: 'Starting video upload',
        level: 'info',
        data: {
          userId,
          fileName: file.originalname,
          fileSize: file.size,
        },
      });

      // Validate file
      await this.validateVideo(file);

      // Process video
      const processedVideo = await this.processVideo(file);

      // Upload to storage
      const videoUrl = await this.uploadToStorage(processedVideo);

      // Set transaction status
      transaction.setStatus('ok');
      transaction.setData('videoUrl', videoUrl);

      this.logger.log(`Video uploaded successfully: ${videoUrl}`);
      return { url: videoUrl };
    } catch (error) {
      // Capture with additional context
      this.sentryService.captureException(error, {
        service: 'VideoProcessingService',
        method: 'uploadVideo',
        userId,
        fileName: file.originalname,
        fileSize: file.size,
      });

      transaction.setStatus('internal_error');
      throw error;
    } finally {
      transaction.finish();
    }
  }

  /**
   * Example 2: Warning messages for non-critical issues
   */
  async processVideo(file: Express.Multer.File) {
    const MAX_SIZE = 100 * 1024 * 1024; // 100MB

    if (file.size > MAX_SIZE * 0.9) {
      // File is approaching size limit - log warning
      this.sentryService.captureMessage('Video file size approaching limit', 'warning', {
        fileSize: file.size,
        limit: MAX_SIZE,
        percentage: ((file.size / MAX_SIZE) * 100).toFixed(2),
      });
    }

    // Process video...
    return file;
  }

  /**
   * Example 3: Performance tracking for critical operations
   */
  async transcodeVideo(videoId: string) {
    const transaction = this.sentryService.startTransaction('video.transcode', 'task');

    // Create span for specific operation
    const span = transaction.startChild({
      op: 'ffmpeg',
      description: 'Video transcoding',
    });

    try {
      // Transcode video...
      await this.ffmpegTranscode(videoId);

      span.setStatus('ok');
      transaction.setStatus('ok');
    } catch (error) {
      span.setStatus('internal_error');
      transaction.setStatus('internal_error');

      this.sentryService.captureException(error, {
        operation: 'transcode',
        videoId,
      });

      throw error;
    } finally {
      span.finish();
      transaction.finish();
    }
  }

  /**
   * Example 4: Breadcrumbs for debugging
   */
  async analyzeVideo(videoId: string) {
    this.sentryService.addBreadcrumb({
      type: 'debug',
      category: 'video',
      message: 'Starting video analysis',
      level: 'debug',
      data: { videoId },
    });

    const metadata = await this.extractMetadata(videoId);

    this.sentryService.addBreadcrumb({
      type: 'debug',
      category: 'video',
      message: 'Metadata extracted',
      level: 'debug',
      data: { videoId, metadata },
    });

    const quality = await this.analyzeQuality(videoId);

    this.sentryService.addBreadcrumb({
      type: 'debug',
      category: 'video',
      message: 'Quality analysis complete',
      level: 'debug',
      data: { videoId, quality },
    });

    return { metadata, quality };
  }

  /**
   * Example 5: User context tracking
   */
  async getUserVideos(userId: string, userEmail: string) {
    // Set user context for all subsequent errors
    this.sentryService.setUser({
      id: userId,
      email: userEmail,
    });

    try {
      const videos = await this.fetchUserVideos(userId);
      return videos;
    } catch (error) {
      // Error will automatically include user context
      this.sentryService.captureException(error, {
        operation: 'getUserVideos',
      });
      throw error;
    }
  }

  /**
   * Example 6: Setting custom tags for filtering
   */
  async processWithTags(videoId: string, processingType: string) {
    // Add tags for easier filtering in Sentry
    this.sentryService.setTag('processing_type', processingType);
    this.sentryService.setTag('video_id', videoId);

    try {
      await this.process(videoId, processingType);
    } catch (error) {
      // Error will be tagged automatically
      throw error;
    }
  }

  /**
   * Example 7: Custom context for debugging
   */
  async complexOperation(data: any) {
    // Set custom context
    this.sentryService.setContext('operation_data', {
      inputSize: JSON.stringify(data).length,
      timestamp: new Date().toISOString(),
      memoryUsage: process.memoryUsage(),
    });

    try {
      await this.performComplexOperation(data);
    } catch (error) {
      // Context will be included in error report
      throw error;
    }
  }

  // Helper methods (dummy implementations)
  private async validateVideo(file: Express.Multer.File) {
    // Validation logic
  }

  private async uploadToStorage(file: Express.Multer.File) {
    return 'https://storage.example.com/video.mp4';
  }

  private async ffmpegTranscode(videoId: string) {
    // FFmpeg transcoding
  }

  private async extractMetadata(videoId: string) {
    return { duration: 120, resolution: '1920x1080' };
  }

  private async analyzeQuality(videoId: string) {
    return { score: 95, issues: [] };
  }

  private async fetchUserVideos(userId: string) {
    return [];
  }

  private async process(videoId: string, type: string) {
    // Processing logic
  }

  private async performComplexOperation(data: any) {
    // Complex operation
  }
}

/**
 * Example Controller with Sentry Integration
 */
import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('videos')
export class VideoController {
  constructor(
    private readonly videoService: VideoProcessingService,
    private readonly sentryService: SentryService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('video'))
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @User() user: any, // Assuming you have a User decorator
  ) {
    // Set user context
    this.sentryService.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    });

    try {
      return await this.videoService.uploadVideo(user.id, file);
    } catch (error) {
      // Error is automatically captured by SentryInterceptor and SentryExceptionFilter
      // But you can add additional context here if needed
      throw error;
    }
  }
}

/**
 * Example: Testing Sentry in Development
 *
 * Add these test endpoints to your controller (development only!)
 */
@Controller('sentry-test')
export class SentryTestController {
  constructor(private readonly sentryService: SentryService) {}

  @Get('error')
  testError() {
    throw new Error('Test Sentry error tracking');
  }

  @Get('message')
  testMessage() {
    this.sentryService.captureMessage('Test Sentry message', 'info', {
      test: true,
      timestamp: new Date(),
    });
    return { message: 'Message sent to Sentry' };
  }

  @Get('warning')
  testWarning() {
    this.sentryService.captureMessage('Test warning', 'warning', {
      level: 'high',
    });
    return { message: 'Warning sent to Sentry' };
  }

  @Get('breadcrumb')
  testBreadcrumb() {
    this.sentryService.addBreadcrumb({
      type: 'debug',
      category: 'test',
      message: 'Test breadcrumb',
      level: 'info',
    });
    return { message: 'Breadcrumb added' };
  }
}
