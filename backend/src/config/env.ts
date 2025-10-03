/**
 * Environment variable validation
 * Validates all required environment variables on startup
 */

interface EnvConfig {
  // Server
  PORT: number;
  NODE_ENV: string;

  // Database
  DATABASE_URL: string;

  // Redis
  REDIS_HOST: string;
  REDIS_PORT: number;

  // JWT
  JWT_SECRET: string;

  // Encryption
  ENCRYPTION_KEY: string;

  // Stripe
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;

  // Frontend
  FRONTEND_URL: string;

  // Azure OpenAI
  AZURE_OPENAI_ENDPOINT: string;
  AZURE_OPENAI_API_KEY: string;
  AZURE_OPENAI_DEPLOYMENT_NAME: string;
}

/**
 * Validate required environment variables
 */
export function validateEnv(): EnvConfig {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'ENCRYPTION_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'FRONTEND_URL',
    'AZURE_OPENAI_ENDPOINT',
    'AZURE_OPENAI_API_KEY',
    'AZURE_OPENAI_DEPLOYMENT_NAME',
  ];

  const missing: string[] = [];

  required.forEach((key) => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach((key) => console.error(`   - ${key}`));
    console.error('\nPlease check your .env file and ensure all required variables are set.');
    process.exit(1);
  }

  // Validate encryption key format
  const encryptionKey = process.env.ENCRYPTION_KEY!;
  if (Buffer.from(encryptionKey, 'hex').length !== 32) {
    console.error('❌ ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
    console.error('   Generate a new key with: openssl rand -hex 32');
    process.exit(1);
  }

  const config: EnvConfig = {
    PORT: parseInt(process.env.PORT || '4000', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DATABASE_URL!,
    REDIS_HOST: process.env.REDIS_HOST || 'localhost',
    REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
    JWT_SECRET: process.env.JWT_SECRET!,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY!,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,
    FRONTEND_URL: process.env.FRONTEND_URL!,
    AZURE_OPENAI_ENDPOINT: process.env.AZURE_OPENAI_ENDPOINT!,
    AZURE_OPENAI_API_KEY: process.env.AZURE_OPENAI_API_KEY!,
    AZURE_OPENAI_DEPLOYMENT_NAME: process.env.AZURE_OPENAI_DEPLOYMENT_NAME!,
  };

  // Log configuration (without secrets)
  if (config.NODE_ENV === 'development') {
    console.log('✅ Environment configuration:');
    console.log(`   NODE_ENV: ${config.NODE_ENV}`);
    console.log(`   PORT: ${config.PORT}`);
    console.log(`   DATABASE: ${config.DATABASE_URL.split('@')[1] || 'configured'}`);
    console.log(`   REDIS: ${config.REDIS_HOST}:${config.REDIS_PORT}`);
    console.log(`   FRONTEND_URL: ${config.FRONTEND_URL}`);
    console.log(`   AZURE_OPENAI: ${config.AZURE_OPENAI_ENDPOINT}`);
  }

  return config;
}

export const env = validateEnv();
