import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RANKUP API',
      version: '1.0.0',
      description: '종합 금융 정보 플랫폼 API 문서',
      contact: {
        name: 'RANKUP Support',
        email: 'support@rankup.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        description: 'API Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'next-auth.session-token',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clx123...' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            image: { type: 'string', nullable: true },
            role: { type: 'string', enum: ['user', 'admin'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Stock: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            symbol: { type: 'string', example: '005930' },
            name: { type: 'string', example: '삼성전자' },
            market: { type: 'string', enum: ['KOSPI', 'KOSDAQ'] },
            currentPrice: { type: 'number' },
            change: { type: 'number' },
            changePercent: { type: 'number' },
            volume: { type: 'integer' },
            marketCap: { type: 'integer', nullable: true },
          },
        },
        Post: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            content: { type: 'string' },
            category: { type: 'string' },
            views: { type: 'integer' },
            userId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        News: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            content: { type: 'string' },
            source: { type: 'string' },
            publishedAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            data: { type: 'array', items: {} },
            meta: {
              type: 'object',
              properties: {
                total: { type: 'integer' },
                page: { type: 'integer' },
                limit: { type: 'integer' },
                totalPages: { type: 'integer' },
              },
            },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: '인증 필요',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        Forbidden: {
          description: '권한 없음',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        NotFound: {
          description: '리소스를 찾을 수 없음',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        RateLimited: {
          description: '요청 제한 초과',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: '인증 관련 API' },
      { name: 'Users', description: '사용자 관리' },
      { name: 'Stocks', description: '주식 데이터' },
      { name: 'News', description: '뉴스' },
      { name: 'Posts', description: '게시글' },
      { name: 'Comments', description: '댓글' },
      { name: 'Payments', description: '결제' },
      { name: 'Admin', description: '관리자' },
    ],
    paths: {
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          summary: '회원가입',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 8 },
                    name: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: '회원가입 성공' },
            400: { description: '잘못된 요청' },
            409: { description: '이미 존재하는 이메일' },
          },
        },
      },
      '/api/stocks': {
        get: {
          tags: ['Stocks'],
          summary: '주식 목록 조회',
          parameters: [
            { name: 'market', in: 'query', schema: { type: 'string', enum: ['KOSPI', 'KOSDAQ'] } },
            { name: 'search', in: 'query', schema: { type: 'string' } },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          ],
          responses: {
            200: {
              description: '성공',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/PaginatedResponse' },
                },
              },
            },
            429: { $ref: '#/components/responses/RateLimited' },
          },
        },
      },
      '/api/news': {
        get: {
          tags: ['News'],
          summary: '뉴스 목록 조회',
          parameters: [
            { name: 'category', in: 'query', schema: { type: 'string' } },
            { name: 'page', in: 'query', schema: { type: 'integer' } },
          ],
          responses: {
            200: { description: '성공' },
          },
        },
      },
      '/api/posts': {
        get: {
          tags: ['Posts'],
          summary: '게시글 목록',
          parameters: [
            { name: 'category', in: 'query', schema: { type: 'string' } },
            { name: 'page', in: 'query', schema: { type: 'integer' } },
          ],
          responses: {
            200: { description: '성공' },
          },
        },
        post: {
          tags: ['Posts'],
          summary: '게시글 작성',
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title', 'content', 'category'],
                  properties: {
                    title: { type: 'string' },
                    content: { type: 'string' },
                    category: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: '작성 성공' },
            401: { $ref: '#/components/responses/Unauthorized' },
          },
        },
      },
      '/api/feature-flags': {
        get: {
          tags: ['Admin'],
          summary: '사용자 Feature Flags 조회',
          security: [{ cookieAuth: [] }],
          responses: {
            200: { description: '성공' },
          },
        },
      },
      '/api/webhooks': {
        get: {
          tags: ['Admin'],
          summary: 'Webhook 이벤트 목록',
          security: [{ cookieAuth: [] }],
          responses: {
            200: { description: '성공' },
          },
        },
        post: {
          tags: ['Admin'],
          summary: 'Webhook 엔드포인트 생성',
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['url', 'events'],
                  properties: {
                    url: { type: 'string', format: 'uri' },
                    events: { type: 'array', items: { type: 'string' } },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: '생성 성공' },
            401: { $ref: '#/components/responses/Unauthorized' },
            403: { $ref: '#/components/responses/Forbidden' },
          },
        },
      },
    },
  },
  apis: [], // We define paths inline above
};

export const swaggerSpec = swaggerJsdoc(options);

// Export as JSON for static serving
export function getSwaggerSpec() {
  return swaggerSpec;
}
