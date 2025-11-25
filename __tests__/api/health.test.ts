/**
 * @jest-environment node
 */

// Extend global namespace for tests
declare global {
  var GET: () => Promise<Response>;
}

// Mock Next.js server Response
global.Response = class Response {
  constructor(private body: BodyInit | null, private init?: ResponseInit) {}

  async json() {
    return JSON.parse(this.body as string);
  }

  get status() {
    return this.init?.status || 200;
  }
} as unknown as typeof Response;

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown, init?: ResponseInit) => {
      return new Response(JSON.stringify(data), init);
    },
  },
}));

// Make this file a module
export {};

describe('Health Check API', () => {
  beforeAll(async () => {
    // Import after mocks are set up
    const { GET } = await import('@/app/api/health/route');
    global.GET = GET;
  });

  it('should return healthy status', async () => {
    const response = await global.GET();
    const data = await response.json();

    expect(data.status).toBe('healthy');
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('uptime');
    expect(data).toHaveProperty('environment');
  });

  it('should return 200 status code', async () => {
    const response = await global.GET();
    expect(response.status).toBe(200);
  });

  it('should include timestamp in ISO format', async () => {
    const response = await global.GET();
    const data = await response.json();

    const timestamp = new Date(data.timestamp);
    expect(timestamp.toISOString()).toBe(data.timestamp);
  });

  it('should include uptime as a number', async () => {
    const response = await global.GET();
    const data = await response.json();

    expect(typeof data.uptime).toBe('number');
    expect(data.uptime).toBeGreaterThanOrEqual(0);
  });
});
