export interface IVideo {
  id: string;
  userId: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  views: number;
  likes: number;
  comments: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IVideoFeed {
  videos: IVideo[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
