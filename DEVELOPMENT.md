# Hướng dẫn Phát triển Tiếp

## 📋 Các Service Còn Thiếu

### 1. Video Service

**Chức năng cần implement:**
- Upload video (multipart/form-data)
- Stream video
- Get video feed với pagination
- Update video metadata
- Delete video
- Get video by ID

**File cần tạo:**
```
apps/video-service/
├── src/
│   ├── main.ts
│   ├── video.module.ts
│   ├── video.controller.ts
│   ├── video.service.ts
│   └── multer.config.ts
├── Dockerfile
└── tsconfig.app.json
```

**Example Video Service:**

```typescript
// apps/video-service/src/video.service.ts
@Injectable()
export class VideoService {
  async createVideo(userId: string, file: Express.Multer.File, dto: CreateVideoDto) {
    // 1. Save file to disk/S3
    // 2. Create video record in DB
    // 3. Update Redis cache
    // 4. Publish event to RabbitMQ
  }

  async getVideoFeed(userId: string, page: number, limit: number) {
    // 1. Check Redis cache
    // 2. If not cached, query DB
    // 3. Cache result
    // 4. Return feed
  }
}
```

### 2. Interaction Service

**Chức năng cần implement:**
- Like video
- Unlike video
- Add comment
- Get comments với pagination
- Record video view
- Real-time broadcast qua WebSocket

**File cần tạo:**
```
apps/interaction-service/
├── src/
│   ├── main.ts
│   ├── interaction.module.ts
│   ├── interaction.controller.ts
│   └── interaction.service.ts
├── Dockerfile
└── tsconfig.app.json
```

### 3. Notification Service

**Chức năng cần implement:**
- Send notification qua RabbitMQ
- Get user notifications
- Mark notification as read

**File cần tạo:**
```
apps/notification-service/
├── src/
│   ├── main.ts
│   ├── notification.module.ts
│   ├── notification.controller.ts
│   └── notification.service.ts
├── Dockerfile
└── tsconfig.app.json
```

### 4. WebSocket Gateway

**File cần tạo:**
```
apps/api-gateway/src/modules/websocket/
├── websocket.module.ts
├── websocket.gateway.ts
└── websocket.service.ts
```

**Example WebSocket Gateway:**

```typescript
// apps/api-gateway/src/modules/websocket/websocket.gateway.ts
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  // Broadcast new like
  broadcastLike(videoId: string, totalLikes: number) {
    this.server.emit(\`video:\${videoId}:like\`, { totalLikes });
  }

  // Broadcast new comment
  broadcastComment(videoId: string, comment: any) {
    this.server.emit(\`video:\${videoId}:comment\`, comment);
  }
}
```

## 🎨 Frontend NextJS

### Setup Project

```bash
cd ..
npx create-next-app@latest tiktok-frontend --typescript --tailwind --app
cd tiktok-frontend
npm install axios socket.io-client react-player zustand @tanstack/react-query
npm install -D @types/node
```

### Cấu trúc Frontend

```
tiktok-frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (main)/
│   │   ├── page.tsx          # Video feed
│   │   ├── upload/
│   │   └── profile/
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── VideoCard.tsx
│   ├── VideoPlayer.tsx
│   ├── CommentSection.tsx
│   ├── LikeButton.tsx
│   └── UploadModal.tsx
├── lib/
│   ├── api.ts                # Axios instance
│   ├── socket.ts             # Socket.io client
│   └── store.ts              # Zustand store
├── hooks/
│   ├── useAuth.ts
│   ├── useVideos.ts
│   └── useWebSocket.ts
└── types/
    └── index.ts
```

### Example Components

**1. Video Feed Component:**

```typescript
// app/(main)/page.tsx
'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import VideoCard from '@/components/VideoCard';
import { getVideoFeed } from '@/lib/api';

export default function Home() {
  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['videos'],
    queryFn: ({ pageParam = 1 }) => getVideoFeed(pageParam),
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
  });

  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory">
      {data?.pages.map((page) =>
        page.videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))
      )}
    </div>
  );
}
```

**2. Video Card Component:**

```typescript
// components/VideoCard.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { useWebSocket } from '@/hooks/useWebSocket';
import LikeButton from './LikeButton';
import CommentSection from './CommentSection';

export default function VideoCard({ video }) {
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { likes, comments } = useWebSocket(video.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsPlaying(entry.isIntersecting);
      },
      { threshold: 0.5 }
    );

    if (playerRef.current) {
      observer.observe(playerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={playerRef} className="relative h-screen snap-start">
      <ReactPlayer
        url={video.videoUrl}
        playing={isPlaying}
        loop
        width="100%"
        height="100%"
      />
      
      <div className="absolute bottom-20 right-4 flex flex-col gap-4">
        <LikeButton videoId={video.id} initialLikes={likes} />
        <CommentSection videoId={video.id} comments={comments} />
      </div>
    </div>
  );
}
```

**3. WebSocket Hook:**

```typescript
// hooks/useWebSocket.ts
import { useEffect, useState } from 'react';
import { socket } from '@/lib/socket';

export function useWebSocket(videoId: string) {
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    socket.on(\`video:\${videoId}:like\`, (data) => {
      setLikes(data.totalLikes);
    });

    socket.on(\`video:\${videoId}:comment\`, (comment) => {
      setComments((prev) => [comment, ...prev]);
    });

    return () => {
      socket.off(\`video:\${videoId}:like\`);
      socket.off(\`video:\${videoId}:comment\`);
    };
  }, [videoId]);

  return { likes, comments };
}
```

## 🧪 Testing Strategy

### 1. Unit Tests

**Example Auth Service Test:**

```typescript
// apps/auth-service/src/auth.service.spec.ts
describe('AuthService', () => {
  let service: AuthService;
  let repository: Repository<User>;
  let jwtService: JwtService;
  let redisService: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: RedisService,
          useValue: {
            setSession: jest.fn(),
            getSession: jest.fn(),
            deleteSession: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
    redisService = module.get<RedisService>(RedisService);
  });

  describe('register', () => {
    it('should create a new user', async () => {
      const dto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123!',
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockReturnValue(dto as any);
      jest.spyOn(repository, 'save').mockResolvedValue({ id: '1', ...dto } as any);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('token');

      const result = await service.register(dto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw ConflictException if user exists', async () => {
      const dto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123!',
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue({} as any);

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });
  });
});
```

### 2. E2E Tests

```typescript
// apps/api-gateway/test/auth.e2e-spec.ts
describe('Auth E2E Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiGatewayModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api/auth/register (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123!',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data).toHaveProperty('user');
      });
  });
});
```

## 🔧 Troubleshooting

### Common Issues

**1. gRPC Connection Errors:**
```bash
# Check if service is running
docker-compose ps

# View service logs
docker-compose logs auth-service

# Restart service
docker-compose restart auth-service
```

**2. Database Connection:**
```bash
# Check PostgreSQL
docker-compose exec postgres psql -U postgres -d tiktok_clone

# View tables
\dt

# Check data
SELECT * FROM users;
```

**3. Redis Connection:**
```bash
# Connect to Redis
docker-compose exec redis redis-cli

# Check keys
KEYS *

# Get value
GET "video:123:views"
```

**4. RabbitMQ Issues:**
```bash
# Access management UI
http://localhost:15672

# Check queues
docker-compose exec rabbitmq rabbitmqctl list_queues
```

## 📚 Next Steps

1. **Complete Video Service**
   - Implement upload với multer
   - Add video processing (optional)
   - Implement streaming

2. **Complete Interaction Service**
   - Implement like/unlike logic
   - Implement comment system
   - Add view tracking

3. **Add WebSocket Gateway**
   - Real-time likes
   - Real-time comments
   - Online users

4. **Frontend Development**
   - Video feed UI
   - Upload interface
   - User profile

5. **Advanced Features**
   - Video recommendations
   - User following system
   - Private messages
   - Notifications

6. **Performance Optimization**
   - Database indexing
   - Query optimization
   - CDN for videos
   - Load balancing

7. **Security Enhancements**
   - Rate limiting
   - DDoS protection
   - Content moderation
   - CAPTCHA

## 🆘 Support

Nếu gặp vấn đề:
1. Check logs: `docker-compose logs -f [service-name]`
2. Check health endpoints
3. Review environment variables
4. Check network connectivity between services

## 📖 Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeORM Documentation](https://typeorm.io/)
- [gRPC Documentation](https://grpc.io/docs/)
- [RabbitMQ Tutorials](https://www.rabbitmq.com/getstarted.html)
- [Redis Documentation](https://redis.io/documentation)
