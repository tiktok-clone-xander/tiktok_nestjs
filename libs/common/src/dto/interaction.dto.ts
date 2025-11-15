import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: 'Great video!' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  @IsNotEmpty()
  videoId: string;
}

export class LikeVideoDto {
  @ApiProperty({ example: 'user-uuid' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'video-uuid' })
  @IsString()
  @IsNotEmpty()
  videoId: string;
}

export class UnlikeVideoDto {
  @ApiProperty({ example: 'user-uuid' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'video-uuid' })
  @IsString()
  @IsNotEmpty()
  videoId: string;
}

export class AddCommentDto {
  @ApiProperty({ example: 'user-uuid' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'video-uuid' })
  @IsString()
  @IsNotEmpty()
  videoId: string;

  @ApiProperty({ example: 'Great video!' })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class GetCommentsDto {
  @ApiProperty({ example: 'video-uuid' })
  @IsString()
  @IsNotEmpty()
  videoId: string;

  @ApiProperty({ example: 1, default: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiProperty({ example: 20, default: 20 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;
}

export class RecordViewDto {
  @ApiProperty({ example: 'video-uuid' })
  @IsString()
  @IsNotEmpty()
  videoId: string;

  @ApiProperty({ example: 'user-uuid', required: false })
  @IsString()
  @IsOptional()
  userId?: string;
}

export class ViewVideoDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  @IsNotEmpty()
  videoId: string;
}
