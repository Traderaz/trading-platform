import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const service = await prisma.service.findUnique({
      where: { id: params.id },
      select: { creatorId: true }
    })

    if (!service) {
      return new NextResponse('Service not found', { status: 404 })
    }

    if (service.creatorId !== session.user.id) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Delete the service
    await prisma.service.delete({
      where: { id: params.id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting service:', error)
    return new NextResponse('Internal error', { status: 500 })
  }
} 