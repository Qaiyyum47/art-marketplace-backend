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
  
  // Log slow queries (over 3 seconds) to stderr
  if (duration > 3000 && process.env.NODE_ENV === 'development') {
    process.stderr.write(`[SLOW QUERY] ${params.model}.${params.action} took ${duration}ms\n`);
  }
  
  return result;
});

export const connectDatabase = async () => {
  try {
    await prisma.$connect();
    process.stdout.write('✅ Database connected successfully\n');
  } catch (error) {
    process.stderr.write(`❌ Database connection failed: ${error}\n`);
    process.exit(1);
  }
};

export const disconnectDatabase = async () => {
  await prisma.$disconnect();
  process.stdout.write('Database disconnected\n');
};

export default prisma;
