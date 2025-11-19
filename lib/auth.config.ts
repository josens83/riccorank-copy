import type { NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { loginSchema } from './utils/validations';
import bcrypt from 'bcrypt';

// Mock user database (in real app, use Prisma)
const users = [
  {
    id: '1',
    email: 'user@example.com',
    name: '테스트 사용자',
    password: '$2a$10$YourHashedPasswordHere', // 'password123'
    image: null,
    role: 'user',
  },
  {
    id: '2',
    email: 'admin@example.com',
    name: '관리자',
    password: '$2a$10$YourHashedPasswordHere', // 'admin123'
    image: null,
    role: 'admin',
  },
];

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const { email, password } = loginSchema.parse(credentials);

          // Find user in database
          const user = users.find((u) => u.email === email);

          if (!user) {
            return null;
          }

          // Verify password
          // In real app: const isValid = await bcrypt.compare(password, user.password);
          // For demo, just check if password exists
          const isValid = password.length > 0;

          if (!isValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || 'user';
      }

      // Handle session update
      if (trigger === 'update' && session) {
        token = { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }

      return session;
    },
    async authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      // Public routes
      const publicRoutes = ['/', '/login', '/signup', '/news', '/stocklist'];
      const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

      if (isPublicRoute) {
        return true;
      }

      // Protected routes
      if (!isLoggedIn) {
        return false;
      }

      // Admin-only routes
      const adminRoutes = ['/admin'];
      const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

      if (isAdminRoute && auth.user.role !== 'admin') {
        return false;
      }

      return true;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
