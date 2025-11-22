import { PrismaClient } from '@prisma/client';
import { log } from '@/lib/logger';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Prisma 클라이언트 설정
const prismaClientOptions = {
  log:
    process.env.NODE_ENV === 'development'
      ? [
          { emit: 'event', level: 'query' } as const,
          { emit: 'event', level: 'error' } as const,
          { emit: 'event', level: 'warn' } as const,
        ]
      : [{ emit: 'event', level: 'error' } as const],

  // 연결 풀링 설정 (프로덕션 최적화)
  // PgBouncer 사용 시 필요한 설정
  datasources: process.env.DATABASE_URL?.includes('pgbouncer=true')
    ? {
        db: {
          url: process.env.DATABASE_URL,
        },
      }
    : undefined,
};

export const prisma = globalForPrisma.prisma || new PrismaClient(prismaClientOptions);

// 개발 환경에서 쿼리 로깅
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e: any) => {
    log.debug('Prisma Query', {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`,
    });
  });
}

prisma.$on('error', (e: any) => {
  log.error('Prisma Error', new Error(e.message));
});

prisma.$on('warn', (e: any) => {
  log.warn('Prisma Warning', { message: e.message });
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// 연결 풀 상태 확인 유틸리티
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    log.error('Database connection failed', error as Error);
    return false;
  }
}

// 연결 종료 (graceful shutdown용)
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  log.info('Database disconnected');
}
