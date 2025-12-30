import * as bcrypt from 'bcrypt';
import { DataSource, Repository } from 'typeorm';
import { User } from '../entities/user.entity';

export interface SeededUser {
  id: string;
  email: string;
  username: string;
}

export class AuthSeeder {
  private userRepository: Repository<User>;

  constructor(private dataSource: DataSource) {
    this.userRepository = this.dataSource.getRepository(User);
  }

  async seed(): Promise<SeededUser[]> {
    console.log('🌱 [Auth] Starting database seeding...');

    try {
      // Check if data already exists
      const userCount = await this.userRepository.count();
      if (userCount > 0) {
        console.log('⚠️  [Auth] Database already has data. Returning existing users.');
        const existingUsers = await this.userRepository.find();
        return existingUsers.map((u) => ({
          id: u.id,
          email: u.email,
          username: u.username,
        }));
      }

      // Seed users
      const users = await this.seedUsers();
      console.log(`✅ [Auth] Created ${users.length} users`);

      console.log('🎉 [Auth] Database seeding completed successfully!');
      return users;
    } catch (error) {
      console.error('❌ [Auth] Error seeding database:', error);
      throw error;
    }
  }

  private async seedUsers(): Promise<SeededUser[]> {
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    const usersData = [
      {
        email: 'john.doe@example.com',
        username: 'johndoe',
        password: hashedPassword,
        fullName: 'John Doe',
        bio: 'Content creator and tech enthusiast 🚀',
        avatar: 'https://i.pravatar.cc/150?u=johndoe',
        isActive: true,
        emailVerifiedAt: new Date(),
      },
      {
        email: 'jane.smith@example.com',
        username: 'janesmith',
        password: hashedPassword,
        fullName: 'Jane Smith',
        bio: 'Travel blogger | Photography lover 📸',
        avatar: 'https://i.pravatar.cc/150?u=janesmith',
        isActive: true,
        emailVerifiedAt: new Date(),
      },
      {
        email: 'mike.johnson@example.com',
        username: 'mikejohnson',
        password: hashedPassword,
        fullName: 'Mike Johnson',
        bio: 'Fitness coach | Motivation speaker 💪',
        avatar: 'https://i.pravatar.cc/150?u=mikejohnson',
        isActive: true,
        emailVerifiedAt: new Date(),
      },
      {
        email: 'sarah.williams@example.com',
        username: 'sarahwilliams',
        password: hashedPassword,
        fullName: 'Sarah Williams',
        bio: 'Food blogger | Recipe creator 🍳',
        avatar: 'https://i.pravatar.cc/150?u=sarahwilliams',
        isActive: true,
        emailVerifiedAt: new Date(),
      },
      {
        email: 'david.brown@example.com',
        username: 'davidbrown',
        password: hashedPassword,
        fullName: 'David Brown',
        bio: 'Music producer | DJ 🎵',
        avatar: 'https://i.pravatar.cc/150?u=davidbrown',
        isActive: true,
        emailVerifiedAt: new Date(),
      },
      {
        email: 'emily.davis@example.com',
        username: 'emilydavis',
        password: hashedPassword,
        fullName: 'Emily Davis',
        bio: 'Fashion & Lifestyle | NYC 👗',
        avatar: 'https://i.pravatar.cc/150?u=emilydavis',
        isActive: true,
        emailVerifiedAt: new Date(),
      },
      {
        email: 'alex.wilson@example.com',
        username: 'alexwilson',
        password: hashedPassword,
        fullName: 'Alex Wilson',
        bio: 'Gaming streamer | Esports enthusiast 🎮',
        avatar: 'https://i.pravatar.cc/150?u=alexwilson',
        isActive: true,
        emailVerifiedAt: new Date(),
      },
      {
        email: 'demo@tiktok.local',
        username: 'demo',
        password: hashedPassword,
        fullName: 'Demo User',
        bio: 'Official demo account for testing 🧪',
        avatar: 'https://i.pravatar.cc/150?u=demo',
        isActive: true,
        emailVerifiedAt: new Date(),
      },
    ];

    const users: SeededUser[] = [];
    for (const userData of usersData) {
      const user = this.userRepository.create(userData);
      const savedUser = await this.userRepository.save(user);
      users.push({
        id: savedUser.id,
        email: savedUser.email,
        username: savedUser.username,
      });
    }

    return users;
  }

  async clear() {
    console.log('🗑️  [Auth] Clearing database...');

    try {
      await this.userRepository.delete({});
      console.log('✅ [Auth] Database cleared successfully!');
    } catch (error) {
      console.error('❌ [Auth] Error clearing database:', error);
      throw error;
    }
  }
}
