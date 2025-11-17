import { NextRequest } from 'next/server';
import { handleApiError, successResponse, ApiError } from '@/lib/api-utils';
import { registerSchema } from '@/lib/validations';
import bcrypt from 'bcrypt';

// Mock user storage (in real app, use Prisma)
const users: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = users.find((u) => u.email === data.email);

    if (existingUser) {
      throw new ApiError(409, 'User already exists with this email');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create new user
    const newUser = {
      id: String(users.length + 1),
      email: data.email,
      name: data.name || null,
      password: hashedPassword,
      image: null,
      provider: 'email',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    users.push(newUser);

    // Don't return password
    const { password, ...userWithoutPassword } = newUser;

    return successResponse(
      {
        user: userWithoutPassword,
        message: 'User registered successfully',
      },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
