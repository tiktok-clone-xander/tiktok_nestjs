import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KMS } from 'aws-sdk';

/**
 * AWS KMS Service for encrypting/decrypting sensitive data
 * Used for securing Sentry DSN and other secrets
 */
@Injectable()
export class KmsService {
  private readonly logger = new Logger(KmsService.name);
  private kms: KMS | null = null;
  private readonly isKmsEnabled: boolean;

  constructor(private readonly configService: ConfigService) {
    const environment = this.configService.get<string>('NODE_ENV', 'development');

    // Only enable KMS in staging and production
    this.isKmsEnabled = environment === 'staging' || environment === 'production';

    if (this.isKmsEnabled) {
      try {
        const region = this.configService.get<string>('AWS_REGION', 'ap-southeast-1');

        this.kms = new KMS({
          region,
          accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
          secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
        });

        this.logger.log(`KMS initialized for region: ${region}`);
      } catch (error) {
        this.logger.error('Failed to initialize KMS', error);
        this.isKmsEnabled = false;
      }
    } else {
      this.logger.log('KMS disabled in local/development environment');
    }
  }

  /**
   * Decrypt a KMS-encrypted value
   * @param encryptedValue Base64-encoded encrypted value
   * @returns Decrypted plaintext string
   */
  async decrypt(encryptedValue: string): Promise<string> {
    if (!this.isKmsEnabled || !this.kms) {
      // In development, return the value as-is (assume it's not encrypted)
      this.logger.warn('KMS not enabled, returning value as plaintext');
      return encryptedValue;
    }

    try {
      const params = {
        CiphertextBlob: Buffer.from(encryptedValue, 'base64'),
      };

      const result = await this.kms.decrypt(params).promise();

      if (!result.Plaintext) {
        throw new Error('KMS decryption returned empty plaintext');
      }

      return result.Plaintext.toString('utf-8');
    } catch (error) {
      this.logger.error('KMS decryption failed', error);
      throw new Error('Failed to decrypt secret with KMS');
    }
  }

  /**
   * Encrypt a value using KMS
   * @param plaintext Value to encrypt
   * @param keyId KMS Key ID
   * @returns Base64-encoded encrypted value
   */
  async encrypt(plaintext: string, keyId: string): Promise<string> {
    if (!this.isKmsEnabled || !this.kms) {
      throw new Error('KMS not enabled in this environment');
    }

    try {
      const params = {
        KeyId: keyId,
        Plaintext: plaintext,
      };

      const result = await this.kms.encrypt(params).promise();

      if (!result.CiphertextBlob) {
        throw new Error('KMS encryption returned empty ciphertext');
      }

      return result.CiphertextBlob.toString('base64');
    } catch (error) {
      this.logger.error('KMS encryption failed', error);
      throw new Error('Failed to encrypt value with KMS');
    }
  }

  /**
   * Check if value is KMS-encrypted (starts with base64 prefix or is long enough)
   */
  isEncrypted(value: string): boolean {
    // KMS encrypted values are typically base64 encoded and longer than 100 chars
    return value && value.length > 100 && /^[A-Za-z0-9+/]+=*$/.test(value);
  }

  /**
   * Get decrypted value or return as-is if not encrypted
   */
  async getDecryptedValue(value: string): Promise<string> {
    if (!value) {
      return value;
    }

    // Check if value looks encrypted
    if (this.isKmsEnabled && this.isEncrypted(value)) {
      return await this.decrypt(value);
    }

    // Return as plaintext
    return value;
  }

  /**
   * Check if KMS is enabled
   */
  isEnabled(): boolean {
    return this.isKmsEnabled && this.kms !== null;
  }
}
