import { DataSource, Repository } from 'typeorm';
import { CommentLike } from '../entities/comment-like.entity';
import { Comment, CommentStatus } from '../entities/comment.entity';
import { Follow, FollowStatus } from '../entities/follow.entity';
import { Like } from '../entities/like.entity';

export interface SeededUser {
  id: string;
  username: string;
}

export interface SeededVideo {
  id: string;
  userId: string;
  title: string;
}

export class InteractionSeeder {
  private likeRepository: Repository<Like>;
  private commentRepository: Repository<Comment>;
  private followRepository: Repository<Follow>;
  private commentLikeRepository: Repository<CommentLike>;

  constructor(private dataSource: DataSource) {
    this.likeRepository = this.dataSource.getRepository(Like);
    this.commentRepository = this.dataSource.getRepository(Comment);
    this.followRepository = this.dataSource.getRepository(Follow);
    this.commentLikeRepository = this.dataSource.getRepository(CommentLike);
  }

  async seed(users: SeededUser[], videos: SeededVideo[]): Promise<void> {
    console.log('🌱 [Interaction] Starting database seeding...');

    if (!users || users.length === 0) {
      console.error('❌ [Interaction] No users provided for seeding');
      throw new Error('Users are required to seed interactions');
    }

    if (!videos || videos.length === 0) {
      console.error('❌ [Interaction] No videos provided for seeding');
      throw new Error('Videos are required to seed interactions');
    }

    try {
      // Check if data already exists
      const likeCount = await this.likeRepository.count();
      if (likeCount > 0) {
        console.log('⚠️  [Interaction] Database already has data. Skipping seed.');
        return;
      }

      // Seed follows
      const followsCount = await this.seedFollows(users);
      console.log(`✅ [Interaction] Created ${followsCount} follows`);

      // Seed likes
      const likesCount = await this.seedLikes(users, videos);
      console.log(`✅ [Interaction] Created ${likesCount} likes`);

      // Seed comments
      const commentsCount = await this.seedComments(users, videos);
      console.log(`✅ [Interaction] Created ${commentsCount} comments`);

      // Seed comment likes
      const commentLikesCount = await this.seedCommentLikes(users);
      console.log(`✅ [Interaction] Created ${commentLikesCount} comment likes`);

      console.log('🎉 [Interaction] Database seeding completed successfully!');
    } catch (error) {
      console.error('❌ [Interaction] Error seeding database:', error);
      throw error;
    }
  }

  private async seedFollows(users: SeededUser[]): Promise<number> {
    const followsData: Partial<Follow>[] = [];

    // Create follow relationships between users
    for (let i = 0; i < users.length; i++) {
      const follower = users[i];

      // Each user follows 2-4 random other users
      const numFollowing = Math.floor(Math.random() * 3) + 2;
      const followedIndices = new Set<number>();

      while (followedIndices.size < numFollowing) {
        const randomIndex = Math.floor(Math.random() * users.length);
        if (randomIndex !== i) {
          followedIndices.add(randomIndex);
        }
      }

      for (const idx of followedIndices) {
        const following = users[idx];
        followsData.push({
          followerId: follower.id,
          followingId: following.id,
          status: FollowStatus.FOLLOWING,
        });
      }
    }

    for (const followData of followsData) {
      try {
        const follow = this.followRepository.create(followData);
        await this.followRepository.save(follow);
      } catch {
        // Ignore duplicate follow errors
      }
    }

    return followsData.length;
  }

  private async seedLikes(users: SeededUser[], videos: SeededVideo[]): Promise<number> {
    const likesData: Partial<Like>[] = [];

    // Each video gets likes from random users
    for (const video of videos) {
      const numLikes = Math.floor(Math.random() * (users.length - 1)) + 1;
      const likedByIndices = new Set<number>();

      while (likedByIndices.size < numLikes) {
        const randomIndex = Math.floor(Math.random() * users.length);
        // Don't let user like their own video
        if (users[randomIndex].id !== video.userId) {
          likedByIndices.add(randomIndex);
        }
      }

      for (const idx of likedByIndices) {
        likesData.push({
          userId: users[idx].id,
          videoId: video.id,
        });
      }
    }

    for (const likeData of likesData) {
      try {
        const like = this.likeRepository.create(likeData);
        await this.likeRepository.save(like);
      } catch {
        // Ignore duplicate like errors
      }
    }

    return likesData.length;
  }

  private async seedComments(users: SeededUser[], videos: SeededVideo[]): Promise<number> {
    const sampleComments = [
      'This is amazing! 🔥',
      'Love this content! ❤️',
      'So inspiring!',
      'Keep up the great work!',
      'This made my day! 😊',
      'Wow, incredible!',
      'Can you make more content like this?',
      'Following for more!',
      'This is exactly what I needed to see',
      'Great job! 👏',
      'Absolutely love it!',
      'This is so creative',
      'Mind blown! 🤯',
      "You're so talented!",
      "Best video I've seen today",
      'This deserves more views!',
      'Sharing this with everyone!',
      'How do you do this?',
      'Tutorial please! 🙏',
      'Goals! 💯',
    ];

    const commentsData: Partial<Comment>[] = [];

    // Each video gets 2-5 comments
    for (const video of videos) {
      const numComments = Math.floor(Math.random() * 4) + 2;

      for (let i = 0; i < numComments; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomComment = sampleComments[Math.floor(Math.random() * sampleComments.length)];

        commentsData.push({
          userId: randomUser.id,
          videoId: video.id,
          content: randomComment,
          status: CommentStatus.ACTIVE,
          likesCount: Math.floor(Math.random() * 20),
          repliesCount: 0,
          isPinned: false,
        });
      }
    }

    for (const commentData of commentsData) {
      const comment = this.commentRepository.create(commentData);
      await this.commentRepository.save(comment);
    }

    // Add some replies to existing comments
    const existingComments = await this.commentRepository.find();
    const replies: Partial<Comment>[] = [];

    const replyTexts = [
      'I totally agree!',
      'Thanks for sharing!',
      '👍',
      'Same here!',
      'Right?!',
      'Exactly what I was thinking',
      '😂😂',
      'So true!',
    ];

    // Add replies to 30% of comments
    for (const comment of existingComments) {
      if (Math.random() < 0.3) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomReply = replyTexts[Math.floor(Math.random() * replyTexts.length)];

        replies.push({
          userId: randomUser.id,
          videoId: comment.videoId,
          parentId: comment.id,
          content: randomReply,
          status: CommentStatus.ACTIVE,
          likesCount: Math.floor(Math.random() * 5),
          repliesCount: 0,
          isPinned: false,
        });

        // Update parent comment's reply count
        comment.repliesCount += 1;
        await this.commentRepository.save(comment);
      }
    }

    for (const replyData of replies) {
      const reply = this.commentRepository.create(replyData);
      await this.commentRepository.save(reply);
    }

    return commentsData.length + replies.length;
  }

  private async seedCommentLikes(users: SeededUser[]): Promise<number> {
    const comments = await this.commentRepository.find();
    let likesCount = 0;

    // Each comment gets 0-3 likes from random users
    for (const comment of comments) {
      const numLikes = Math.floor(Math.random() * 4);

      const likedByIndices = new Set<number>();
      while (likedByIndices.size < numLikes && likedByIndices.size < users.length) {
        const randomIndex = Math.floor(Math.random() * users.length);
        likedByIndices.add(randomIndex);
      }

      for (const idx of likedByIndices) {
        try {
          const commentLike = this.commentLikeRepository.create({
            userId: users[idx].id,
            commentId: comment.id,
          });
          await this.commentLikeRepository.save(commentLike);
          likesCount++;
        } catch {
          // Ignore duplicate like errors
        }
      }
    }

    return likesCount;
  }

  async clear() {
    console.log('🗑️  [Interaction] Clearing database...');

    try {
      await this.commentLikeRepository.delete({});
      await this.commentRepository.delete({});
      await this.likeRepository.delete({});
      await this.followRepository.delete({});
      console.log('✅ [Interaction] Database cleared successfully!');
    } catch (error) {
      console.error('❌ [Interaction] Error clearing database:', error);
      throw error;
    }
  }
}
