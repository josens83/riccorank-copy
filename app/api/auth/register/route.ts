import { NextRequest } from 'next/server';
import { handleApiError, successResponse, ApiError } from '@/lib/api/errors';
import { registerSchema } from '@/lib/utils/validations';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/external/email';
import { mockUsers } from '@/lib/data';

// Mock storage for email verification tokens (in real app, use database)
export const mockVerificationTokens: Map<
  string,
  { email: string; userId: string; token: string; expiresAt: Date }
> = new Map();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.email === data.email);

    if (existingUser) {
      throw new ApiError(409, 'User already exists with this email');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create new user
    const newUser: any = {
      id: String(mockUsers.length + 1),
      email: data.email,
      name: data.name || '사용자',
      password: hashedPassword,
      image: undefined,
      provider: 'credentials',
      role: 'user',
      suspended: false,
      emailVerified: false, // User needs to verify email
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUsers.push(newUser);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');

    // Store token with 24 hour expiration
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    mockVerificationTokens.set(tokenHash, {
      email: newUser.email,
      userId: newUser.id,
      token: tokenHash,
      expiresAt,
    });

    // Send verification email
    const verificationUrl = `${
      process.env.NEXTAUTH_URL || 'http://localhost:3000'
    }/verify-email?token=${verificationToken}`;

    try {
      await sendVerificationEmail(newUser.email, newUser.name, verificationUrl);
      console.log('✅ Verification email sent to:', newUser.email);
    } catch (emailError) {
      console.error('❌ Failed to send verification email:', emailError);
      // Don't fail registration if email fails
    }

    // Don't return password
    const { password, ...userWithoutPassword } = newUser;

    return successResponse(
      {
        user: userWithoutPassword,
        message:
          'User registered successfully. Please check your email to verify your account.',
      },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
