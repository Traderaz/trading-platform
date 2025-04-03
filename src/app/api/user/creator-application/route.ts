import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Update user role to CREATOR
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        role: 'CREATOR',
        isVerified: true
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user role:', error)
    return new NextResponse(
      `Error updating user role: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { status: 500 }
    )
  }
} 