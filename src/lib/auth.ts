import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (session?.user) {
        // Get the user with their role
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            role: true,
            isVerified: true
          }
        });

        // Add user id and role to session
        session.user.id = user.id;
        session.user.role = dbUser?.role || 'BUYER';
        session.user.isVerified = dbUser?.isVerified || false;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
} 