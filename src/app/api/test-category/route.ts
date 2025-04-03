import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Checking categories...');
    
    // Get all categories
    const categories = await prisma.category.findMany();
    console.log('Existing categories:', categories);

    if (categories.length === 0) {
      console.log('No categories found, creating default category...');
      // Create a default category
      const defaultCategory = await prisma.category.create({
        data: {
          name: 'Trading',
          description: 'Default category for trading courses and services'
        }
      });
      console.log('Created default category:', defaultCategory);
      return NextResponse.json({ message: 'Created default category', category: defaultCategory });
    }

    return NextResponse.json({ message: 'Categories found', categories });
  } catch (error) {
    console.error('Error checking/creating categories:', error);
    return new NextResponse(`Internal Server Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
} 