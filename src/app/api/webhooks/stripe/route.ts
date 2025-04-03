// Create subscription record
const service = await prisma.service.findUnique({
  where: {
    id: session.metadata?.serviceId,
    type: 'COURSE'
  },
});

if (!service) {
  throw new Error('Service not found');
}

await prisma.subscription.create({
  data: {
    serviceId: session.metadata?.serviceId,
    userId: session.metadata?.userId,
    status: 'ACTIVE',
    paymentStatus: 'PAID',
  },
}); 