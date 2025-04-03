import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_SECRET!;
const REDIRECT_URI = `${process.env.NEXTAUTH_URL}/api/youtube/callback`;

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error(tokens.error || 'Failed to exchange code for tokens');
    }

    // Store tokens in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        youtubeAccessToken: tokens.access_token,
        youtubeRefreshToken: tokens.refresh_token,
        youtubeTokenExpiry: new Date(Date.now() + tokens.expires_in * 1000),
      },
    });

    return NextResponse.redirect(new URL('/dashboard/livestreams', request.url));
  } catch (error) {
    console.error('Error in YouTube callback:', error);
    return NextResponse.json({ error: 'Failed to complete YouTube authentication' }, { status: 500 });
  }
} 