import { getVersionString } from '@app/common/config/version.config';
import * as fs from 'fs';
import * as path from 'path';
import { DataSource, Repository } from 'typeorm';
import { AppVersion } from './entities/app-version.entity';

export class VersionManager {
  private versionRepository: Repository<AppVersion>;

  constructor(private dataSource: DataSource) {
    this.versionRepository = this.dataSource.getRepository(AppVersion);
  }

  /**
   * Initialize version tracking (table created by migrations)
   */
  async initialize(): Promise<void> {
    // Table is created by TypeORM synchronize or migrations
    // Just check if repository is accessible
    await this.versionRepository.count();
    console.log('✅ Version tracking initialized');
  }

  /**
   * Get current application version from version.config.ts
   */
  getCurrentVersion(): string {
    return getVersionString();
  }

  /**
   * Get latest applied version from database
   */
  async getLatestAppliedVersion(): Promise<AppVersion | null> {
    return await this.versionRepository.findOne({
      order: { appliedAt: 'DESC' },
    });
  }

  /**
   * Get all applied versions
   */
  async getAllVersions(): Promise<AppVersion[]> {
    return await this.versionRepository.find({
      order: { appliedAt: 'DESC' },
    });
  }

  /**
   * Check if version is already applied
   */
  async isVersionApplied(version: string): Promise<boolean> {
    const count = await this.versionRepository.count({
      where: { version },
    });
    return count > 0;
  }

  /**
   * Compare version strings (semver compatible)
   */
  compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;

      if (part1 > part2) return 1;
      if (part1 < part2) return -1;
    }

    return 0;
  }

  /**
   * Check if current version is newer than applied version
   */
  async needsUpdate(): Promise<{
    needsUpdate: boolean;
    currentVersion: string;
    appliedVersion: string | null;
    message: string;
  }> {
    const currentVersion = this.getCurrentVersion();
    const latestApplied = await this.getLatestAppliedVersion();

    if (!latestApplied) {
      return {
        needsUpdate: true,
        currentVersion,
        appliedVersion: null,
        message: 'No version applied yet. First deployment.',
      };
    }

    const comparison = this.compareVersions(currentVersion, latestApplied.version);

    if (comparison > 0) {
      return {
        needsUpdate: true,
        currentVersion,
        appliedVersion: latestApplied.version,
        message: `Update available: ${latestApplied.version} → ${currentVersion}`,
      };
    } else if (comparison < 0) {
      return {
        needsUpdate: false,
        currentVersion,
        appliedVersion: latestApplied.version,
        message: `⚠️  Warning: Applied version ${latestApplied.version} is newer than current ${currentVersion}`,
      };
    } else {
      return {
        needsUpdate: false,
        currentVersion,
        appliedVersion: latestApplied.version,
        message: `✅ Version ${currentVersion} is already applied`,
      };
    }
  }

  /**
   * Record version deployment
   */
  async recordVersion(
    version: string,
    migrationsRun: string[],
    description?: string,
  ): Promise<void> {
    // Check if version exists
    const existing = await this.versionRepository.findOne({
      where: { version },
    });

    if (existing) {
      // Update existing
      existing.migrationsRun = migrationsRun;
      existing.description = description;
      existing.appliedAt = new Date();
      await this.versionRepository.save(existing);
    } else {
      // Create new
      const newVersion = this.versionRepository.create({
        version,
        migrationsRun,
        description,
        appliedAt: new Date(),
      });
      await this.versionRepository.save(newVersion);
    }

    console.log(`✅ Version ${version} recorded successfully`);
  }

  /**
   * Get migration status
   */
  async getMigrationStatus(): Promise<{
    pending: string[];
    applied: string[];
  }> {
    // Use TypeORM's built-in migration methods
    const _pendingMigrations = await this.dataSource.showMigrations();
    const executedMigrations = await this.dataSource.query(
      'SELECT * FROM "migrations" ORDER BY "timestamp" ASC',
    );

    const appliedNames = executedMigrations.map((m: any) => m.name);

    // Get all migration files
    const migrationsPath = path.join(__dirname, 'migrations');
    const files = fs.existsSync(migrationsPath) ? fs.readdirSync(migrationsPath) : [];
    const allMigrations = files
      .filter((f) => f.endsWith('.ts') || f.endsWith('.js'))
      .map((f) => f.replace(/\.(ts|js)$/, ''));

    const pending = allMigrations.filter((m) => !appliedNames.includes(m));

    return {
      pending,
      applied: appliedNames,
    };
  }

  /**
   * Display version info
   */
  async displayVersionInfo(): Promise<void> {
    console.log('\n📦 Version Information');
    console.log('═'.repeat(60));

    const currentVersion = this.getCurrentVersion();
    console.log(`Current Version: ${currentVersion}`);

    const latestApplied = await this.getLatestAppliedVersion();
    if (latestApplied) {
      console.log(`Applied Version: ${latestApplied.version}`);
      console.log(`Applied At: ${latestApplied.appliedAt.toLocaleString()}`);
      console.log(`Migrations: ${latestApplied.migrationsRun.length} applied`);
    } else {
      console.log('Applied Version: None');
    }

    const updateCheck = await this.needsUpdate();
    console.log(`\nStatus: ${updateCheck.message}`);

    const migrationStatus = await this.getMigrationStatus();
    console.log(`\n📊 Migration Status:`);
    console.log(`  Applied: ${migrationStatus.applied.length}`);
    console.log(`  Pending: ${migrationStatus.pending.length}`);

    if (migrationStatus.pending.length > 0) {
      console.log('\n⏳ Pending Migrations:');
      migrationStatus.pending.forEach((m) => console.log(`  - ${m}`));
    }

    console.log('═'.repeat(60) + '\n');
  }

  /**
   * Version history
   */
  async displayVersionHistory(): Promise<void> {
    const versions = await this.getAllVersions();

    console.log('\n📚 Version History');
    console.log('═'.repeat(80));

    if (versions.length === 0) {
      console.log('No versions applied yet.');
      console.log('═'.repeat(80) + '\n');
      return;
    }

    versions.forEach((v, index) => {
      const badge = index === 0 ? '🟢 CURRENT' : '  ';
      console.log(`\n${badge} Version ${v.version}`);
      console.log(`   Applied: ${v.appliedAt.toLocaleString()}`);
      console.log(`   Migrations: ${v.migrationsRun.length}`);
      if (v.description) {
        console.log(`   Description: ${v.description}`);
      }
    });

    console.log('\n' + '═'.repeat(80) + '\n');
  }
}
