const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Create initial categories
  const categories = [
    {
      name: 'Trading Courses',
      description: 'Educational courses on trading strategies and market analysis',
    },
    {
      name: 'Trading Signals',
      description: 'Real-time trading signals and alerts',
    },
    {
      name: 'Market Analysis',
      description: 'In-depth market analysis and research reports',
    },
    {
      name: 'Trading Tools',
      description: 'Software and tools for trading',
    },
    {
      name: 'Trading Communities',
      description: 'Community access and group trading sessions',
    },
    {
      name: 'Mentorship',
      description: 'One-on-one trading mentorship and coaching',
    },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    })
  }

  console.log('Database has been seeded. 🌱')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 