/**
 * OpenAPI 3.0 Schema Generator
 * API 문서 자동 생성
 */

export const openAPISchema = {
  openapi: '3.0.0',
  info: {
    title: 'RANKUP API',
    version: '1.0.0',
    description: '엔터프라이즈급 금융 정보 플랫폼 API',
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
      url: 'https://rankup.com/api',
      description: 'Production',
    },
    {
      url: 'http://localhost:3000/api',
      description: 'Development',
    },
  ],
  tags: [
    { name: 'Auth', description: '인증 및 사용자 관리' },
    { name: 'Stocks', description: '주식 정보' },
    { name: 'News', description: '뉴스 피드' },
    { name: 'Posts', description: '게시글' },
    { name: 'Comments', description: '댓글' },
    { name: 'Recommendations', description: '추천 시스템' },
    { name: 'AB Testing', description: 'A/B 테스팅' },
    { name: 'Admin', description: '관리자' },
  ],
  paths: {
    '/recommendations': {
      get: {
        tags: ['Recommendations'],
        summary: '맞춤 추천 콘텐츠',
        description: '사용자 행동 기반 개인화된 추천',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'type',
            in: 'query',
            schema: { type: 'string', enum: ['posts', 'trending', 'stocks'] },
            description: '추천 타입',
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 10, minimum: 1, maximum: 50 },
            description: '추천 개수',
          },
        ],
        responses: {
          200: {
            description: '추천 목록',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          itemId: { type: 'string' },
                          score: { type: 'number' },
                          reason: { type: 'string' },
                        },
                      },
                    },
                    meta: {
                      type: 'object',
                      properties: {
                        type: { type: 'string' },
                        limit: { type: 'integer' },
                        count: { type: 'integer' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: '인증 필요' },
        },
      },
    },
    '/ab-test': {
      get: {
        tags: ['AB Testing'],
        summary: 'A/B 테스트 변형 할당',
        description: '사용자에게 A/B 테스트 변형 할당',
        parameters: [
          {
            name: 'testId',
            in: 'query',
            schema: { type: 'string' },
            description: '테스트 ID (없으면 모든 활성 테스트 반환)',
          },
        ],
        responses: {
          200: {
            description: '변형 할당 결과',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        testId: { type: 'string' },
                        variantId: { type: 'string' },
                        config: { type: 'object' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/ab-test/track': {
      post: {
        tags: ['AB Testing'],
        summary: 'A/B 테스트 결과 추적',
        description: 'A/B 테스트 메트릭 기록',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['testId', 'variantId'],
                properties: {
                  testId: { type: 'string' },
                  variantId: { type: 'string' },
                  metrics: {
                    type: 'object',
                    properties: {
                      conversion: { type: 'boolean' },
                      clickThrough: { type: 'boolean' },
                      timeSpent: { type: 'number' },
                      customMetrics: { type: 'object' },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: '추적 성공' },
          400: { description: '잘못된 요청' },
        },
      },
    },
    '/health': {
      get: {
        tags: ['System'],
        summary: '헬스 체크',
        description: '시스템 상태 확인',
        responses: {
          200: {
            description: '정상',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'healthy' },
                    timestamp: { type: 'string', format: 'date-time' },
                    uptime: { type: 'number' },
                    environment: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              code: { type: 'string' },
              details: { type: 'object' },
            },
          },
        },
      },
      RecommendationScore: {
        type: 'object',
        properties: {
          itemId: { type: 'string' },
          score: { type: 'number' },
          reason: { type: 'string' },
        },
      },
    },
  },
};

/**
 * OpenAPI 스키마를 JSON으로 export
 */
export function generateOpenAPIJSON(): string {
  return JSON.stringify(openAPISchema, null, 2);
}

/**
 * Swagger UI 설정
 */
export const swaggerUIConfig = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'RANKUP API Documentation',
};
