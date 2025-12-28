#!/usr/bin/env node

/**
 * Script to decrypt Sentry DSN using AWS KMS
 * Usage: node scripts/decrypt-sentry-dsn.js <encrypted-DSN>
 */

const AWS = require('aws-sdk');

async function decryptDsn() {
  const encrypted = process.argv[2];
  const region = process.env.AWS_REGION || 'ap-southeast-1';

  if (!encrypted) {
    console.error('❌ Error: Encrypted DSN is required');
    console.log('\nUsage: node scripts/decrypt-sentry-dsn.js <encrypted-DSN>');
    console.log('\nExample:');
    console.log('  node scripts/decrypt-sentry-dsn.js "AQICAHiXXXXXX..."');
    process.exit(1);
  }

  try {
    console.log('🔓 Decrypting Sentry DSN with AWS KMS...');
    console.log(`📍 Region: ${region}\n`);

    const kms = new AWS.KMS({ region });

    const result = await kms
      .decrypt({
        CiphertextBlob: Buffer.from(encrypted, 'base64'),
      })
      .promise();

    const decrypted = result.Plaintext.toString('utf-8');

    console.log('✅ Decryption successful!\n');
    console.log('📋 Decrypted DSN:');
    console.log('─'.repeat(80));
    console.log(decrypted);
    console.log('─'.repeat(80));
  } catch (error) {
    console.error('❌ Decryption failed:', error.message);

    if (error.code === 'InvalidCiphertextException') {
      console.log('\n💡 The encrypted value is invalid or corrupted');
    } else if (error.code === 'AccessDeniedException') {
      console.log('\n💡 Troubleshooting:');
      console.log('   - Check your AWS credentials are configured');
      console.log('   - Verify you have kms:Decrypt permission');
    }

    process.exit(1);
  }
}

decryptDsn().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
