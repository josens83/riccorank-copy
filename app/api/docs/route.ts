import { NextResponse } from 'next/server';
import { getSwaggerSpec } from '@/lib/swagger';

/**
 * GET /api/docs
 * Returns OpenAPI specification JSON
 */
export async function GET() {
  const spec = getSwaggerSpec();

  return NextResponse.json(spec, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
