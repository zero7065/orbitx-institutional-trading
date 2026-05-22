import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function seed() {
  // Seed demo swap orders
  const existing = await prisma.swapOrder.count();
  if (existing === 0) {
    const users = await prisma.user.findMany({ take: 5 });
    if (users.length > 0) {
      const orders = [
        { userId: users[0].id, userEmail: users[0].email, type: 'SELL', crypto: 'BTC', quantity: 0.5, price: 65000, total: 32500, status: 'PENDING' },
        { userId: users[0].id, userEmail: users[0].email, type: 'BUY', crypto: 'ETH', quantity: 5, price: 3400, total: 17000, status: 'PENDING' },
        { userId: users[users.length > 1 ? 1 : 0].id, userEmail: users[users.length > 1 ? 1 : 0].email, type: 'SELL', crypto: 'SOL', quantity: 50, price: 140, total: 7000, status: 'PENDING' },
        { userId: users[users.length > 2 ? 2 : 0].id, userEmail: users[users.length > 2 ? 2 : 0].email, type: 'BUY', crypto: 'BNB', quantity: 10, price: 590, total: 5900, status: 'FILLED' },
        { userId: users[users.length > 0 ? 0 : 0].id, userEmail: users[users.length > 0 ? 0 : 0].email, type: 'SELL', crypto: 'USDT', quantity: 10000, price: 1.01, total: 10100, status: 'PENDING' },
      ];
      for (const o of orders) await prisma.swapOrder.create({ data: o });
      console.log('Seeded ' + orders.length + ' demo swap orders');
    }
  } else {
    console.log('Swap orders already exist: ' + existing);
  }
  await prisma.$disconnect();
}
seed().catch(e => { console.error(e); prisma.$disconnect(); });
