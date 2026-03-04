import dotenv from 'dotenv';

dotenv.config();

const {
  NODE_ENV,
  PORT,
  DATABASE_URL,
  JWT_SECRET,
  FRONTEND_URL,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  JWT_EXPIRES_IN,
  JWT_ISSUER,
  JWT_AUDIENCE,
  CORS_ORIGINS,
} = process.env;

const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`FATAL ERROR: Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Please check your .env file and ensure all required variables are set.');
  process.exit(1);
}

if (NODE_ENV === 'production' && !FRONTEND_URL) {
  console.warn('WARNING: FRONTEND_URL not set in production. CORS may not work properly.');
}

export const env = {
  NODE_ENV: NODE_ENV || 'development',
  PORT: Number(PORT) || 5000,
  DATABASE_URL: DATABASE_URL!,
  JWT_SECRET: JWT_SECRET!,
  JWT_EXPIRES_IN: JWT_EXPIRES_IN || '7d',
  JWT_ISSUER: JWT_ISSUER || 'art-marketplace-api',
  JWT_AUDIENCE: JWT_AUDIENCE || 'art-marketplace-client',
  FRONTEND_URL: FRONTEND_URL || 'http://localhost:3000',
  CORS_ORIGINS: (CORS_ORIGINS || FRONTEND_URL || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  CLOUDINARY_CLOUD_NAME: CLOUDINARY_CLOUD_NAME!,
  CLOUDINARY_API_KEY: CLOUDINARY_API_KEY!,
  CLOUDINARY_API_SECRET: CLOUDINARY_API_SECRET!,
};