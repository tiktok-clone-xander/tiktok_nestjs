export const SERVICES = {
  AUTH_SERVICE: 'AUTH_SERVICE',
  VIDEO_SERVICE: 'VIDEO_SERVICE',
  INTERACTION_SERVICE: 'INTERACTION_SERVICE',
  NOTIFICATION_SERVICE: 'NOTIFICATION_SERVICE',
};

export const RABBITMQ_QUEUES = {
  AUTH: 'auth_queue',
  VIDEO: 'video_queue',
  INTERACTION: 'interaction_queue',
  NOTIFICATION: 'notification_queue',
};

export const REDIS_KEYS = {
  VIDEO_VIEWS: (videoId: string) => `video:${videoId}:views`,
  VIDEO_LIKES: (videoId: string) => `video:${videoId}:likes`,
  VIDEO_COMMENTS: (videoId: string) => `video:${videoId}:comments`,
  VIDEO_FEED: (userId: string, page: number) => `feed:${userId}:${page}`,
  USER_SESSION: (userId: string) => `session:${userId}`,
};

export const GRPC_PACKAGES = {
  AUTH: 'auth',
  VIDEO: 'video',
  INTERACTION: 'interaction',
  NOTIFICATION: 'notification',
};
