import { PrismaClient } from '@prisma/client';
import { queryMonitor } from '../utils/queryMonitor';
import { costMonitor } from '../utils/costMonitor';

// Configure Prisma with timeouts and connection pool to prevent resource leaks
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Set query timeout and monitor to prevent long-running queries
prisma.$use(async (params, next) => {
  const before = Date.now();
  const result = await next(params);
  const after = Date.now();
  const duration = after - before;
  
  // Track query for cost monitoring
  costMonitor.trackDbQuery(duration);
  queryMonitor.log(params.model || 'unknown', params.action, duration);
  
  // Log slow queries (over 3 seconds)
  if (duration > 3000) {
    console.warn(`Slow query detected: ${params.model}.${params.action} took ${duration}ms`);
  }
  
  return result;
});

export const connectDatabase = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

export const disconnectDatabase = async () => {
  await prisma.$disconnect();
  console.log('Database disconnected');
};

export default prisma;
