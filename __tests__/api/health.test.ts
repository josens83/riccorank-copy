import { GET } from '@/app/api/health/route';
import { NextResponse } from 'next/server';

describe('Health Check API', () => {
  it('should return healthy status', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.status).toBe('healthy');
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('uptime');
    expect(data).toHaveProperty('environment');
  });

  it('should return 200 status code', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
  });

  it('should include timestamp in ISO format', async () => {
    const response = await GET();
    const data = await response.json();
    
    const timestamp = new Date(data.timestamp);
    expect(timestamp.toISOString()).toBe(data.timestamp);
  });

  it('should include uptime as a number', async () => {
    const response = await GET();
    const data = await response.json();
    
    expect(typeof data.uptime).toBe('number');
    expect(data.uptime).toBeGreaterThanOrEqual(0);
  });
});
