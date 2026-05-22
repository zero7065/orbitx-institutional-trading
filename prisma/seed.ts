import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('supersecretadmin', 10);
  const userPassword = await bcrypt.hash('password123', 10);

  // Admin (tier PRO)
  await prisma.user.upsert({
    where: { email: 'admin@cryptovault.io' },
    update: {},
    create: {
      email: 'admin@cryptovault.io',
      password: adminPassword,
      role: 'ADMIN',
      tier: 'PRO',
      referralCode: 'ADMIN777',
      balance: 1000000,
      pin: await bcrypt.hash('1234', 10),
    },
  });

  // Demo Users
  const users = [
    { email: 'user1@example.com', balance: 500.50, kyc: 'APPROVED', tier: 'PRO' },
    { email: 'user2@example.com', balance: 1200.00, kyc: 'PENDING', tier: 'STANDARD' },
    { email: 'user3@example.com', balance: 0.00, kyc: 'NONE', tier: 'STANDARD' },
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
        tier: u.tier,
        pin: await bcrypt.hash('1234', 10),
        referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      }
    });
  }

  // Spin Prizes - significant rewards
  const prizes = [
    { label: '0.005 BTC', probability: 0.03, amount: 350, crypto: 'BTC' },
    { label: '0.05 ETH', probability: 0.07, amount: 150, crypto: 'ETH' },
    { label: '100 USDT', probability: 0.15, amount: 100, crypto: 'USDT' },
    { label: '50 USDT', probability: 0.25, amount: 50, crypto: 'USDT' },
    { label: '10 USDT', probability: 0.30, amount: 10, crypto: 'USDT' },
    { label: 'Better luck', probability: 0.20, amount: 0, crypto: 'USDT' },
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
