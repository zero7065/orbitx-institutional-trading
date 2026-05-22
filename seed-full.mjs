import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function seed() {
  // Seed admin user
  let admin = await prisma.user.findUnique({ where: { email: 'admin@cryptovault.io' } });
  if (!admin) {
    const code = 'ADMIN' + Math.random().toString(36).substring(2, 8).toUpperCase();
    admin = await prisma.user.create({
      data: { email: 'admin@cryptovault.io', password: await bcrypt.hash('supersecretadmin', 10), role: 'ADMIN', referralCode: code, kycStatus: 'APPROVED', balance: 1000000, pin: '1234' }
    });
    console.log('Admin user created');
  } else {
    console.log('Admin user exists');
  }

  // Seed test user
  let user1 = await prisma.user.findUnique({ where: { email: 'user1@example.com' } });
  if (!user1) {
    const code = 'USER' + Math.random().toString(36).substring(2, 8).toUpperCase();
    user1 = await prisma.user.create({
      data: { email: 'user1@example.com', password: await bcrypt.hash('password123', 10), role: 'USER', referralCode: code, kycStatus: 'APPROVED', balance: 50000, pin: '1234' }
    });
    console.log('Test user created');
  } else {
    console.log('Test user exists');
  }

  // Seed payment methods
  const existingPM = await prisma.paymentMethod.count();
  if (existingPM === 0) {
    const methods = [
      { name: 'Bank Transfer (USD)', type: 'BANK', provider: 'Chase', details: JSON.stringify({ bankName: 'Chase Bank', accountNumber: '****1234', routingNumber: '021000021' }), minAmount: 50, maxAmount: 50000, feePercent: 1.5, enabled: true, sortOrder: 1 },
      { name: 'Credit Card', type: 'CARD', provider: 'Visa/Mastercard', details: JSON.stringify({ accepted: ['Visa', 'Mastercard', 'Amex'] }), minAmount: 10, maxAmount: 25000, feePercent: 2.5, enabled: true, sortOrder: 2 },
      { name: 'USDT (TRC20)', type: 'WALLET', provider: 'Tether', details: JSON.stringify({ network: 'TRC20', address: 'TXYZ...789' }), minAmount: 20, maxAmount: 100000, feePercent: 0.5, enabled: true, sortOrder: 3 },
      { name: 'PayPal', type: 'WALLET', provider: 'PayPal', details: JSON.stringify({ email: 'payments@orbitx.io' }), minAmount: 10, maxAmount: 10000, feePercent: 2.0, enabled: true, sortOrder: 4 },
    ];
    for (const m of methods) await prisma.paymentMethod.create({ data: m });
    console.log('Payment methods seeded: ' + methods.length);
  } else {
    console.log('Payment methods exist: ' + existingPM);
  }

  // Seed platform settings if not exist
  const settings = await prisma.platformSettings.findUnique({ where: { id: 'default' } });
  if (!settings) {
    await prisma.platformSettings.create({
      data: { id: 'default', platformName: 'OrbitX', minDeposit: 10, maxDeposit: 100000, minWithdrawal: 20, maxWithdrawal: 50000, withdrawalFeePercent: 2, referralBonus: 5 }
    });
    console.log('Platform settings created');
  }

  // Seed crypto networks
  const existingNets = await prisma.cryptoNetwork.count();
  if (existingNets === 0) {
    const nets = [
      { name: 'Bitcoin', nameLower: 'bitcoin', symbol: 'BTC', color: '#F7931A', minDeposit: 0.001, minWithdrawal: 0.002, networkFee: 0.0005, withdrawalFee: 0.001, enabled: true, depositEnabled: true, withdrawalEnabled: true },
      { name: 'Ethereum', nameLower: 'ethereum', symbol: 'ETH', color: '#627EEA', minDeposit: 0.01, minWithdrawal: 0.02, networkFee: 0.005, withdrawalFee: 0.01, enabled: true, depositEnabled: true, withdrawalEnabled: true },
      { name: 'Tether', nameLower: 'tether', symbol: 'USDT', color: '#26A17B', minDeposit: 10, minWithdrawal: 20, networkFee: 1, withdrawalFee: 2, enabled: true, depositEnabled: true, withdrawalEnabled: true },
      { name: 'BNB', nameLower: 'bnb', symbol: 'BNB', color: '#F3BA2F', minDeposit: 0.1, minWithdrawal: 0.2, networkFee: 0.005, withdrawalFee: 0.01, enabled: true, depositEnabled: true, withdrawalEnabled: true },
      { name: 'Solana', nameLower: 'solana', symbol: 'SOL', color: '#00FFA3', minDeposit: 0.5, minWithdrawal: 1, networkFee: 0.0005, withdrawalFee: 0.001, enabled: true, depositEnabled: true, withdrawalEnabled: true },
    ];
    for (const n of nets) await prisma.cryptoNetwork.create({ data: n });
    console.log('Crypto networks seeded: ' + nets.length);
  }

  // Seed swap items if not exist
  const existingItems = await prisma.swapItem.count();
  if (existingItems === 0) {
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
    console.log('Swap items seeded: ' + items.length);
  }

  // Seed demo swap orders if not exist
  const existingOrders = await prisma.swapOrder.count();
  if (existingOrders === 0 && user1) {
    const orders = [
      { userId: user1.id, userEmail: user1.email, type: 'SELL', crypto: 'BTC', quantity: 0.5, price: 65000, total: 32500, status: 'PENDING' },
      { userId: user1.id, userEmail: user1.email, type: 'BUY', crypto: 'ETH', quantity: 5, price: 3400, total: 17000, status: 'PENDING' },
      { userId: user1.id, userEmail: user1.email, type: 'SELL', crypto: 'SOL', quantity: 50, price: 140, total: 7000, status: 'PENDING' },
      { userId: user1.id, userEmail: user1.email, type: 'BUY', crypto: 'BNB', quantity: 10, price: 590, total: 5900, status: 'FILLED' },
      { userId: user1.id, userEmail: user1.email, type: 'SELL', crypto: 'USDT', quantity: 10000, price: 1.01, total: 10100, status: 'PENDING' },
    ];
    for (const o of orders) await prisma.swapOrder.create({ data: o });
    console.log('Swap orders seeded: ' + orders.length);
  }

  // Update existing users to have proper kyc
  const noKyc = await prisma.user.findMany({ where: { kycStatus: 'NONE' } });
  for (const u of noKyc) {
    await prisma.user.update({ where: { id: u.id }, data: { kycStatus: 'APPROVED' } });
  }
  if (noKyc.length > 0) console.log('Updated KYC for ' + noKyc.length + ' users');

  console.log('Seed complete!');
  await prisma.$disconnect();
}
seed().catch(e => { console.error(e); prisma.$disconnect(); });
