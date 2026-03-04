/**
 * Environment validation utility to catch missing configs on startup
 * This prevents runtime errors and cost issues from misconfiguration
 */

interface EnvValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate all required environment variables
 */
export const validateEnvironment = (): EnvValidation => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required variables
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'JWT_ISSUER',
    'JWT_AUDIENCE',
  ];

  for (const varName of required) {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  }

  // Recommended variables
  const recommended = [
    'PORT',
    'NODE_ENV',
    'CORS_ORIGINS',
    'JWT_EXPIRES_IN',
  ];

  for (const varName of recommended) {
    if (!process.env[varName]) {
      warnings.push(`Missing recommended environment variable: ${varName} (using default)`);
    }
  }

  // Validate specific configs
  if (process.env.NODE_ENV && !['development', 'production', 'test'].includes(process.env.NODE_ENV)) {
    warnings.push(`NODE_ENV should be 'development', 'production', or 'test', got: ${process.env.NODE_ENV}`);
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters for security');
  }

  if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY.length < 10) {
    errors.push('CLOUDINARY_API_KEY appears invalid (too short)');
  }

  if (process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_API_SECRET.length < 20) {
    errors.push('CLOUDINARY_API_SECRET appears invalid (too short)');
  }

  // Validate DATABASE_URL format
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('postgresql://')) {
    errors.push('DATABASE_URL must be a valid PostgreSQL connection string');
  }

  // Validate CORS_ORIGINS format
  if (process.env.CORS_ORIGINS) {
    const origins = process.env.CORS_ORIGINS.split(',');
    for (const origin of origins) {
      const trimmed = origin.trim();
      if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        warnings.push(`CORS origin "${trimmed}" should start with http:// or https://`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Validate and report environment configuration
 * Call this on server startup
 */
export const validateAndReportEnvironment = (): boolean => {
  const validation = validateEnvironment();

  if (validation.warnings.length > 0) {
    console.warn('⚠️  Environment warnings:');
    validation.warnings.forEach((warning) => console.warn(`   - ${warning}`));
  }

  if (!validation.isValid) {
    console.error('❌ Environment validation failed:');
    validation.errors.forEach((error) => console.error(`   - ${error}`));
    console.error('\nPlease check your .env file and ensure all required variables are set.');
    return false;
  }

  if (process.env.NODE_ENV === 'production') {
    console.log('✅ Environment validation passed (production mode)');
  }

  return true;
};
