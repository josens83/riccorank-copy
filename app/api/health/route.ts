import { NextResponse } from 'next/server';

/**
 * Health Check Endpoint
 * 
 * Used by Docker healthcheck and monitoring systems
 */
export async function GET() {
  try {
    // Check database connection (optional)
    // await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
