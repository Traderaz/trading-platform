import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

interface Livestream {
  id: string
  title: string
  description: string
  scheduledFor: Date
  videoId: string
  isPrivate: boolean
  userId: string
  isLive?: boolean
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get user's subscription status
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true }
    })

    const isPremium = user?.subscription?.status === 'active'

    // Fetch all livestreams
    const livestreams = await prisma.livestream.findMany({
      orderBy: { scheduledFor: 'desc' }
    })

    // Map livestreams to include access information
    const livestreamsWithAccess = livestreams.map((stream: Livestream) => ({
      ...stream,
      hasAccess: !stream.isPrivate || isPremium
    }))

    return NextResponse.json(livestreamsWithAccess)
  } catch (error) {
    console.error('Error fetching livestreams:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { title, description, scheduledFor, videoId, isPrivate } = body

    // Validate required fields
    if (!title || !description || !scheduledFor || !videoId) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Create new livestream
    const livestream = await prisma.livestream.create({
      data: {
        title,
        description,
        scheduledFor: new Date(scheduledFor),
        videoId,
        isPrivate: isPrivate || false,
        userId: session.user.id
      }
    })

    return NextResponse.json(livestream)
  } catch (error) {
    console.error('Error creating livestream:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 