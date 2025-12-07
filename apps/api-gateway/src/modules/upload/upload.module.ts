import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

// Upload directories
const uploadDirs = {
  videos: join(process.cwd(), 'uploads', 'videos'),
  thumbnails: join(process.cwd(), 'uploads', 'thumbnails'),
  images: join(process.cwd(), 'uploads', 'images'),
};

// Helper function to ensure directory exists with error handling
const ensureDir = (dir: string) => {
  try {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  } catch (error) {
    console.warn(`Warning: Could not create directory ${dir}:`, error.message);
  }
};

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_SECRET'),
      }),
      inject: [ConfigService],
    }),
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          let uploadPath = uploadDirs.images;

          if (file.mimetype.startsWith('video/')) {
            uploadPath = uploadDirs.videos;
          } else if (file.fieldname === 'thumbnail') {
            uploadPath = uploadDirs.thumbnails;
          }

          // Ensure directory exists before saving file
          ensureDir(uploadPath);
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 2 * 1024 * 1024 * 1024, // 2GB max file size
      },
      fileFilter: (req, file, cb) => {
        // Allow videos and images
        if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Only video and image files are allowed'), false);
        }
      },
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
