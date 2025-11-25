import { NextResponse } from 'next/server';
import { openAPISchema } from '@/lib/api/openapi-schema';

/**
 * GET /api/docs
 * OpenAPI 3.0 스키마 반환
 */
export async function GET() {
  return NextResponse.json(openAPISchema);
}
