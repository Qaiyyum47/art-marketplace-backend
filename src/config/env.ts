import dotenv from 'dotenv';

dotenv.config();

const { NODE_ENV, PORT, DATABASE_URL, JWT_SECRET } = process.env;

if (!JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined.');
  process.exit(1);
}

export const env = {
  NODE_ENV: NODE_ENV || 'development',
  PORT: PORT || 5000,
  DATABASE_URL: DATABASE_URL,
  JWT_SECRET: JWT_SECRET,
};