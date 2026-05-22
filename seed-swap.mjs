import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function seed() {
  const existing = await prisma.swapItem.count();
  if (existing === 0) {
    const items = [
      { name: '10 USDT Bonus', description: 'Get 10 USDT added to your wallet', type: 'BONUS', pointsCost: 500, valueUsd: 10, stock: 100 },
      { name: '50 USDT Bonus', description: 'Get 50 USDT added to your wallet', type: 'BONUS', pointsCost: 2000, valueUsd: 50, stock: 50 },
      { name: 'Mystery NFT Pack', description: 'Random rare NFT from our collection', type: 'NFT', pointsCost: 3500, valueUsd: 25, stock: 30 },
      { name: '1 SOL Token', description: 'Swap for 1 Solana token', type: 'TOKEN', pointsCost: 10000, valueUsd: 143, stock: 20 },
      { name: '0.01 BTC', description: 'Receive 0.01 Bitcoin directly', type: 'CRYPTO', pointsCost: 45000, valueUsd: 654, stock: 10 },
      { name: 'Premium Bot Access', description: '1 month free premium trading bot', type: 'BONUS', pointsCost: 8000, valueUsd: 500, stock: 25 },
      { name: '0.1 ETH Token', description: 'Swap for 0.1 Ethereum', type: 'CRYPTO', pointsCost: 25000, valueUsd: 345, stock: 15 },
      { name: 'Diamond NFT Badge', description: 'Exclusive Diamond tier NFT badge', type: 'NFT', pointsCost: 50000, valueUsd: 500, stock: 5 },
      { name: 'VIP Support Access', description: 'Priority support for 3 months', type: 'BONUS', pointsCost: 1500, valueUsd: 50, stock: 50 },
      { name: '500 USDT Boost', description: '500 USDT added to trading balance', type: 'CRYPTO', pointsCost: 100000, valueUsd: 500, stock: 3 },
    ];
    for (const item of items) await prisma.swapItem.create({ data: item });
    console.log('Seeded ' + items.length + ' swap items');
  } else {
    console.log('Swap items already exist: ' + existing);
  }
  await prisma.$disconnect();
}
seed().catch(e => { console.error(e); prisma.$disconnect(); });
