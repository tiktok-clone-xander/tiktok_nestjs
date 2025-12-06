import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateVideoDto {
  @ApiProperty({ example: 'user-uuid' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'My awesome video' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'This is a description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'https://cdn.example.com/video.mp4' })
  @IsString()
  @IsNotEmpty()
  videoUrl: string;

  @ApiProperty({ example: 'https://cdn.example.com/thumb.jpg', required: false })
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiProperty({ example: 60, description: 'Duration in seconds' })
  @IsNumber()
  @IsOptional()
  duration?: number;

  @ApiProperty({ type: 'string', format: 'binary' })
  video?: Express.Multer.File;
}

export class GetVideoDto {
  @ApiProperty({ example: 'video-uuid' })
  @IsString()
  @IsNotEmpty()
  videoId: string;

  @ApiProperty({ example: 'user-uuid', required: false })
  @IsString()
  @IsOptional()
  userId?: string;
}

export class GetFeedDto {
  @ApiProperty({ example: 'user-uuid', required: false })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({ example: 1, default: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiProperty({ example: 10, default: 10 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit?: number;
}

export class UpdateVideoStatsDto {
  @ApiProperty({ example: 'video-uuid' })
  @IsString()
  @IsNotEmpty()
  videoId: string;

  @ApiProperty({ example: 100, required: false })
  @IsNumber()
  @IsOptional()
  views?: number;

  @ApiProperty({ example: 50, required: false })
  @IsNumber()
  @IsOptional()
  likesCount?: number;

  @ApiProperty({ example: 20, required: false })
  @IsNumber()
  @IsOptional()
  commentsCount?: number;
}

export class DeleteVideoDto {
  @ApiProperty({ example: 'video-uuid' })
  @IsString()
  @IsNotEmpty()
  videoId: string;

  @ApiProperty({ example: 'user-uuid' })
  @IsString()
  @IsNotEmpty()
  userId: string;
}

export class GetVideoFeedDto {
  @ApiProperty({ example: 1, default: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ example: 10, default: 10 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit?: number = 10;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  userId?: string;
}

export class GetUserVideosDto {
  @ApiProperty({ example: 'user-uuid' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 1, default: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiProperty({ example: 10, default: 10 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit?: number;
}

export class SearchVideosDto {
  @ApiProperty({ example: 'dance challenge' })
  @IsString()
  @IsNotEmpty()
  query: string;

  @ApiProperty({ example: 1, default: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiProperty({ example: 10, default: 10 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  @IsOptional()
  limit?: number;
}
