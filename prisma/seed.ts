import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('supersecretadmin', 10);
  const userPassword = await bcrypt.hash('password123', 10);

  // Admin
  await prisma.user.upsert({
    where: { email: 'admin@cryptovault.io' },
    update: {},
    create: {
      email: 'admin@cryptovault.io',
      password: adminPassword,
      role: 'ADMIN',
      referralCode: 'ADMIN777',
      balance: 1000000,
    },
  });

  // Demo Users
  const users = [
    { email: 'user1@example.com', balance: 500.50, kyc: 'APPROVED' },
    { email: 'user2@example.com', balance: 1200.00, kyc: 'PENDING' },
    { email: 'user3@example.com', balance: 0.00, kyc: 'NONE' },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        password: userPassword,
        balance: u.balance,
        kycStatus: u.kyc,
        referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      }
    });
  }

  // Spin Prizes
  const prizes = [
    { label: '0.001 BTC', probability: 0.05, amount: 25, crypto: 'BTC' },
    { label: '0.01 ETH', probability: 0.1, amount: 15, crypto: 'ETH' },
    { label: '10 USDT', probability: 0.4, amount: 10, crypto: 'USDT' },
    { label: 'Better luck next time', probability: 0.4, amount: 0, crypto: 'USDT' },
  ];

  for (const p of prizes) {
    await prisma.spinPrize.create({
      data: {
        label: p.label,
        probability: p.probability,
        rewardAmount: p.amount,
        rewardCrypto: p.crypto,
      }
    });
  }

  // Ads
  await prisma.ad.createMany({
    data: [
      { title: 'New Staking Pool', description: 'Earn 12% APY on USDT', imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80', link: '#' },
      { title: 'BTC Flash Deal', description: 'Buy BTC with zero fees for 24h', imageUrl: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&q=80', link: '#' },
    ]
  });

  console.log('Seed data created!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
