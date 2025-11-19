import {
  getStocksSchema,
  stockSymbolSchema,
  getNewsSchema,
  createPostSchema,
  updatePostSchema,
  getPostsSchema,
  createCommentSchema,
  updateCommentSchema,
  likeSchema,
  bookmarkSchema,
  registerSchema,
  loginSchema,
  updateProfileSchema,
} from '@/lib/utils/validations';

describe('Stock Validations', () => {
  describe('getStocksSchema', () => {
    it('should validate correct stock query parameters', () => {
      const validData = {
        market: 'KOSPI' as const,
        search: 'Samsung',
        sortBy: 'rank' as const,
        sortOrder: 'asc' as const,
        page: 1,
        limit: 20,
      };

      const result = getStocksSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should use default values for page and limit', () => {
      const result = getStocksSchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should reject invalid market value', () => {
      const invalidData = { market: 'INVALID' };
      const result = getStocksSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject page less than 1', () => {
      const invalidData = { page: 0 };
      const result = getStocksSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject limit greater than 100', () => {
      const invalidData = { limit: 101 };
      const result = getStocksSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should coerce string numbers to numbers', () => {
      const data = { page: '2', limit: '30' };
      const result = getStocksSchema.parse(data);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(30);
    });
  });

  describe('stockSymbolSchema', () => {
    it('should validate non-empty symbol', () => {
      const validData = { symbol: 'AAPL' };
      const result = stockSymbolSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty symbol', () => {
      const invalidData = { symbol: '' };
      const result = stockSymbolSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

describe('News Validations', () => {
  describe('getNewsSchema', () => {
    it('should validate correct news query parameters', () => {
      const validData = {
        category: 'finance',
        search: 'stock market',
        isHot: true,
        page: 1,
        limit: 10,
      };

      const result = getNewsSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should use default values', () => {
      const result = getNewsSchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should coerce string boolean to boolean', () => {
      const data = { isHot: 'true' };
      const result = getNewsSchema.parse(data);
      expect(result.isHot).toBe(true);
    });

    it('should reject limit greater than 50', () => {
      const invalidData = { limit: 51 };
      const result = getNewsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

describe('Post Validations', () => {
  describe('createPostSchema', () => {
    it('should validate correct post data', () => {
      const validData = {
        title: 'Test Post',
        content: 'This is a test post content',
        category: 'stock' as const,
        tags: 'tag1,tag2',
        stockId: 'stock-123',
      };

      const result = createPostSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty title', () => {
      const invalidData = {
        title: '',
        content: 'Content',
        category: 'stock' as const,
      };

      const result = createPostSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject title longer than 200 characters', () => {
      const invalidData = {
        title: 'a'.repeat(201),
        content: 'Content',
        category: 'stock' as const,
      };

      const result = createPostSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty content', () => {
      const invalidData = {
        title: 'Title',
        content: '',
        category: 'stock' as const,
      };

      const result = createPostSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid category', () => {
      const invalidData = {
        title: 'Title',
        content: 'Content',
        category: 'invalid',
      };

      const result = createPostSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should allow optional fields to be omitted', () => {
      const validData = {
        title: 'Title',
        content: 'Content',
        category: 'free' as const,
      };

      const result = createPostSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('updatePostSchema', () => {
    it('should validate partial updates', () => {
      const validData = { title: 'Updated Title' };
      const result = updatePostSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should allow all fields to be optional', () => {
      const validData = {};
      const result = updatePostSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('getPostsSchema', () => {
    it('should use correct default values', () => {
      const result = getPostsSchema.parse({});
      expect(result.sortBy).toBe('createdAt');
      expect(result.sortOrder).toBe('desc');
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });
});

describe('Comment Validations', () => {
  describe('createCommentSchema', () => {
    it('should validate correct comment data', () => {
      const validData = {
        content: 'This is a comment',
        postId: 'post-123',
        parentId: 'comment-456',
      };

      const result = createCommentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty content', () => {
      const invalidData = {
        content: '',
        postId: 'post-123',
      };

      const result = createCommentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject content longer than 500 characters', () => {
      const invalidData = {
        content: 'a'.repeat(501),
        postId: 'post-123',
      };

      const result = createCommentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should allow parentId to be optional', () => {
      const validData = {
        content: 'Comment',
        postId: 'post-123',
      };

      const result = createCommentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('updateCommentSchema', () => {
    it('should validate comment update', () => {
      const validData = { content: 'Updated comment' };
      const result = updateCommentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty content', () => {
      const invalidData = { content: '' };
      const result = updateCommentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

describe('Like/Bookmark Validations', () => {
  describe('likeSchema', () => {
    it('should validate postId', () => {
      const validData = { postId: 'post-123' };
      const result = likeSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should require postId', () => {
      const invalidData = {};
      const result = likeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('bookmarkSchema', () => {
    it('should validate stockId', () => {
      const validData = { stockId: 'stock-123' };
      const result = bookmarkSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should require stockId', () => {
      const invalidData = {};
      const result = bookmarkSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

describe('User Validations', () => {
  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'John Doe',
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'Password123!',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject password shorter than 8 characters', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Pass1!',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should allow name to be optional', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject name shorter than 2 characters', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'A',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject name longer than 50 characters', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'a'.repeat(51),
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'anypassword',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid',
        password: 'password',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('updateProfileSchema', () => {
    it('should validate correct profile update', () => {
      const validData = {
        name: 'Jane Doe',
        image: 'https://example.com/avatar.jpg',
      };

      const result = updateProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should allow all fields to be optional', () => {
      const validData = {};
      const result = updateProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid image URL', () => {
      const invalidData = {
        image: 'not-a-url',
      };

      const result = updateProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject name shorter than 2 characters', () => {
      const invalidData = { name: 'A' };
      const result = updateProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
