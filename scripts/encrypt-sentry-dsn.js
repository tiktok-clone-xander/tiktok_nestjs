#!/usr/bin/env node

/**
 * Script to encrypt Sentry DSN using AWS KMS
 * Usage: node scripts/encrypt-sentry-dsn.js <DSN> [key-id]
 */

const AWS = require('aws-sdk');

async function encryptDsn() {
  // Get parameters
  const dsn = process.argv[2];
  const keyId = process.argv[3] || process.env.AWS_KMS_KEY_ID;
  const region = process.env.AWS_REGION || 'ap-southeast-1';

  // Validate inputs
  if (!dsn) {
    console.error('❌ Error: DSN is required');
    console.log('\nUsage: node scripts/encrypt-sentry-dsn.js <DSN> [key-id]');
    console.log('\nExample:');
    console.log(
      '  node scripts/encrypt-sentry-dsn.js "https://key@sentry.io/project" "alias/sentry-key"',
    );
    process.exit(1);
  }

  if (!keyId) {
    console.error('❌ Error: KMS Key ID is required');
    console.log('\nProvide key-id as argument or set AWS_KMS_KEY_ID environment variable');
    console.log('\nExample:');
    console.log('  AWS_KMS_KEY_ID=alias/sentry-key node scripts/encrypt-sentry-dsn.js "<DSN>"');
    process.exit(1);
  }

  try {
    console.log('🔐 Encrypting Sentry DSN with AWS KMS...');
    console.log(`📍 Region: ${region}`);
    console.log(`🔑 Key ID: ${keyId}`);
    console.log('');

    // Initialize KMS
    const kms = new AWS.KMS({ region });

    // Encrypt the DSN
    const result = await kms
      .encrypt({
        KeyId: keyId,
        Plaintext: dsn,
      })
      .promise();

    // Convert to base64
    const encrypted = result.CiphertextBlob.toString('base64');

    console.log('✅ Encryption successful!\n');
    console.log('📋 Encrypted DSN (add to your .env file):');
    console.log('─'.repeat(80));
    console.log(encrypted);
    console.log('─'.repeat(80));
    console.log('\n💾 Add to your environment variables:');
    console.log(`SENTRY_DSN=${encrypted}`);
    console.log(
      '\n⚠️  Security Note: Store this encrypted value in AWS Secrets Manager or Parameter Store',
    );
    console.log('    Never commit it directly to source control!');
  } catch (error) {
    console.error('❌ Encryption failed:', error.message);

    if (error.code === 'AccessDeniedException') {
      console.log('\n💡 Troubleshooting:');
      console.log('   - Check your AWS credentials are configured');
      console.log('   - Verify you have kms:Encrypt permission');
      console.log('   - Ensure the KMS key ID is correct');
    }

    process.exit(1);
  }
}

// Run
encryptDsn().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
