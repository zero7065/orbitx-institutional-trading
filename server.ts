import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'cryptovault-super-secret-key-2026';

async function seedInitialData() {
  const existingSettings = await prisma.platformSettings.findUnique({ where: { id: 'default' } });
  if (!existingSettings) {
    await prisma.platformSettings.create({
      data: {
        id: 'default',
        platformName: 'OrbitX',
        primaryColor: '#00D1FF',
        secondaryColor: '#F0B90B',
        maintenanceMode: false,
        registrationEnabled: true,
      }
    });
  }

  const networks = await prisma.cryptoNetwork.count();
  if (networks === 0) {
    const cryptos = [
      { name: 'Bitcoin', symbol: 'BTC', nameLower: 'bitcoin', color: '#F7931A', minDeposit: 0.001, minWithdrawal: 0.001, networkFee: 0.0001, withdrawalFee: 0.0005, sortOrder: 1 },
      { name: 'Ethereum', symbol: 'ETH', nameLower: 'ethereum', color: '#627EEA', minDeposit: 0.01, minWithdrawal: 0.01, networkFee: 0.005, withdrawalFee: 0.005, sortOrder: 2 },
      { name: 'Tether', symbol: 'USDT', nameLower: 'tether', color: '#26A17B', minDeposit: 10, minWithdrawal: 20, networkFee: 1, withdrawalFee: 2, sortOrder: 3 },
      { name: 'Solana', symbol: 'SOL', nameLower: 'solana', color: '#9945FF', minDeposit: 0.1, minWithdrawal: 0.1, networkFee: 0.00025, withdrawalFee: 0.001, sortOrder: 4 },
      { name: 'BNB', symbol: 'BNB', nameLower: 'binancecoin', color: '#F3BA2F', minDeposit: 0.01, minWithdrawal: 0.01, networkFee: 0.001, withdrawalFee: 0.001, sortOrder: 5 },
      { name: 'Ripple', symbol: 'XRP', nameLower: 'ripple', color: '#23292F', minDeposit: 20, minWithdrawal: 20, networkFee: 0.1, withdrawalFee: 0.5, sortOrder: 6 },
      { name: 'Cardano', symbol: 'ADA', nameLower: 'cardano', color: '#0033AD', minDeposit: 10, minWithdrawal: 10, networkFee: 0.1, withdrawalFee: 0.5, sortOrder: 7 },
      { name: 'Dogecoin', symbol: 'DOGE', nameLower: 'dogecoin', color: '#C2A633', minDeposit: 100, minWithdrawal: 100, networkFee: 1, withdrawalFee: 5, sortOrder: 8 },
    ];
    for (const crypto of cryptos) {
      await prisma.cryptoNetwork.create({ data: crypto });
    }
  }

  const plans = await prisma.investmentPlan.count();
  if (plans === 0) {
    const investmentPlans = [
      { name: 'Alpha Reserve', description: 'Conservative strategy for capital preservation with low volatility exposure.', roi: 2.5, roiType: 'DAILY', durationHours: 24, durationDays: 1, minAmount: 100, maxAmount: 1000, color: '#00D1FF', featured: true, priority: 1 },
      { name: 'Sigma Prime', description: 'Balanced approach targeting steady growth through diversified yield strategies.', roi: 5, roiType: 'DAILY', durationHours: 48, durationDays: 2, minAmount: 1001, maxAmount: 5000, color: '#F0B90B', featured: true, priority: 2 },
      { name: 'Omega Elite', description: 'Institutional-grade high yield for serious investors seeking maximum returns.', roi: 10, roiType: 'DAILY', durationHours: 72, durationDays: 3, minAmount: 5001, maxAmount: 50000, color: '#10B981', featured: true, priority: 3 },
      { name: 'Genesis', description: 'Entry-level investment plan for new investors starting their journey.', roi: 1.5, roiType: 'DAILY', durationHours: 12, durationDays: 0.5, minAmount: 50, maxAmount: 500, color: '#8B5CF6', priority: 4 },
    ];
    for (const plan of investmentPlans) {
      await prisma.investmentPlan.create({ data: plan });
    }
  }
}

async function startServer() {
  await seedInitialData();

  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(cookieParser());
  app.use(cors({ origin: true, credentials: true }));

  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  app.get('/api/health', (req, res) => res.json({ status: 'ALIVE', timestamp: new Date().toISOString() }));

  app.get('/api/settings', async (req, res) => {
    const settings = await prisma.platformSettings.findUnique({ where: { id: 'default' } });
    res.json(settings);
  });

  app.get('/api/networks', async (req, res) => {
    const networks = await prisma.cryptoNetwork.findMany({ where: { enabled: true }, orderBy: { sortOrder: 'asc' } });
    res.json(networks);
  });

  app.get('/api/investment-plans', async (req, res) => {
    const plans = await prisma.investmentPlan.findMany({ where: { active: true }, orderBy: { priority: 'asc' } });
    res.json(plans);
  });

  app.get('/api/announcements', async (req, res) => {
    const announcements = await prisma.announcement.findMany({ where: { active: true }, orderBy: { createdAt: 'desc' } });
    res.json(announcements);
  });

  const authenticateToken = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: 'Forbidden' });
      req.user = user;
      next();
    });
  };

  const isAdmin = (req: any, res: any, next: any) => {
    if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'Admin access required' });
    next();
  };

  app.post('/api/auth/register', async (req, res) => {
    try {
      const settings = await prisma.platformSettings.findUnique({ where: { id: 'default' } });
      if (!settings?.registrationEnabled) return res.status(403).json({ error: 'Registration is currently disabled' });

      const { email, password, referralCode } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const userRefCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          referralCode: userRefCode,
          referredBy: referralCode || null,
          balance: referralCode ? settings.referralBonus : 0,
        }
      });

      if (referralCode) {
        const referrer = await prisma.user.findUnique({ where: { referralCode } });
        if (referrer) {
          const bonusAmount = settings.referralBonus;
          await prisma.user.update({ where: { id: referrer.id }, data: { balance: { increment: bonusAmount } } });
          await prisma.transaction.create({
            data: { userId: referrer.id, type: 'REFERRAL', amount: bonusAmount, description: `Referral bonus from ${email}` }
          });
        }
      }

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
      res.cookie('token', token, { httpOnly: true });
      res.json({ user: { id: user.id, email: user.email, role: user.role } });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (user.status === 'SUSPENDED' || user.status === 'BANNED') {
      return res.status(403).json({ error: `Account ${user.status.toLowerCase()}. Contact support.` });
    }

    const now = new Date();
    let loginStreak = user.loginStreak;
    if (user.lastLoginDate) {
      const lastLogin = new Date(user.lastLoginDate);
      const diffDays = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 1) loginStreak += 1;
      else if (diffDays > 1) loginStreak = 1;
    } else { loginStreak = 1; }

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginDate: now, loginStreak, lastActivityAt: now } });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.cookie('token', token, { httpOnly: true });
    res.json({ user: { id: user.id, email: user.email, role: user.role, balance: user.balance, kycStatus: user.kycStatus, status: user.status } });
  });

  app.post('/api/auth/logout', (req, res) => { res.clearCookie('token'); res.json({ message: 'Logged out' }); });

  app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    res.json({ user });
  });

  app.get('/api/user/stats', authenticateToken, async (req: any, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { transactions: { take: 10, orderBy: { createdAt: 'desc' } } }
    });
    res.json(user);
  });

  app.get('/api/user/investments', authenticateToken, async (req: any, res) => {
    const investments = await prisma.investment.findMany({
      where: { userId: req.user.id },
      include: { plan: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(investments);
  });

  app.get('/api/notifications', authenticateToken, async (req: any, res) => {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(notifications);
  });

  app.put('/api/notifications/:id/read', authenticateToken, async (req: any, res) => {
    await prisma.notification.update({ where: { id: req.params.id }, data: { read: true, readAt: new Date() } });
    res.json({ success: true });
  });

  app.get('/api/ads', async (req, res) => {
    const ads = await prisma.ad.findMany({ where: { active: true } });
    res.json(ads);
  });

  app.post('/api/deposit', authenticateToken, async (req: any, res) => {
    const { amount, cryptoType, networkId } = req.body;
    await new Promise(resolve => setTimeout(resolve, 1500));

    const network = networkId ? await prisma.cryptoNetwork.findUnique({ where: { id: networkId } }) : null;

    const deposit = await prisma.deposit.create({
      data: {
        userId: req.user.id,
        networkId: networkId || null,
        amount,
        cryptoAmount: amount,
        cryptoType: network?.symbol || cryptoType,
        txHash: '0x' + Math.random().toString(16).substring(2, 42),
        status: 'CONFIRMED'
      }
    });

    await prisma.user.update({ where: { id: req.user.id }, data: { balance: { increment: amount }, totalDeposited: { increment: amount } } });
    await prisma.transaction.create({ data: { userId: req.user.id, type: 'DEPOSIT', amount, description: `Deposit of ${amount} ${cryptoType}` } });
    res.json(deposit);
  });

  app.post('/api/deposit/fiat', authenticateToken, async (req: any, res) => {
    const { amount, paymentMethodId, cryptoType } = req.body;
    const paymentMethod = await prisma.paymentMethod.findUnique({ where: { id: paymentMethodId } });
    if (!paymentMethod) return res.status(400).json({ error: 'Invalid payment method' });
    if (amount < paymentMethod.minAmount || amount > paymentMethod.maxAmount) return res.status(400).json({ error: 'Amount outside allowed range' });

    await new Promise(resolve => setTimeout(resolve, 1500));

    const basePrices: any = { BTC: 65432.10, ETH: 3456.78, USDT: 1.00, SOL: 143.50, BNB: 598.20 };
    const volatility = 0.02;
    const basePrice = basePrices[cryptoType] || 500;
    const cryptoPrice = basePrice + basePrice * (Math.random() - 0.5) * volatility;
    const cryptoAmount = amount / cryptoPrice;

    const deposit = await prisma.deposit.create({
      data: {
        userId: req.user.id,
        amount,
        cryptoAmount,
        cryptoType,
        txHash: 'FIAT-' + Math.random().toString(36).substring(2, 15),
        status: 'CONFIRMED',
        paymentMethod: paymentMethod.name
      }
    });

    await prisma.user.update({ where: { id: req.user.id }, data: { balance: { increment: amount }, totalDeposited: { increment: amount } } });
    await prisma.transaction.create({ data: { userId: req.user.id, type: 'DEPOSIT', amount, description: `Fiat purchase: ${amount} USD via ${paymentMethod.name}` } });
    res.json(deposit);
  });

  const withdrawalCodes = new Map<string, string>();

  app.post('/api/withdraw/request-code', authenticateToken, async (req: any, res) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    withdrawalCodes.set(req.user.id, code);
    console.log(`[CODE] ${req.user.email}: ${code}`);
    res.json({ message: 'Code sent', code: process.env.NODE_ENV === 'development' ? code : undefined });
  });

  app.post('/api/withdraw', authenticateToken, async (req: any, res) => {
    const { amount, walletAddress, pin, code, networkId } = req.body;
    const storedCode = withdrawalCodes.get(req.user.id);
    if (!storedCode || storedCode !== code) return res.status(400).json({ error: 'Invalid confirmation code' });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.pin !== pin) return res.status(400).json({ error: 'Invalid PIN' });

    const settings = await prisma.platformSettings.findUnique({ where: { id: 'default' } });
    const fee = amount * (settings?.withdrawalFeePercent || 2) / 100;
    const netAmount = amount - fee;

    if (user.balance < amount) return res.status(400).json({ error: 'Insufficient balance' });

    const network = networkId ? await prisma.cryptoNetwork.findUnique({ where: { id: networkId } }) : null;

    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId: req.user.id,
        networkId: networkId || null,
        amount,
        cryptoAmount: amount,
        cryptoType: network?.symbol || 'USD',
        walletAddress,
        fee,
        netAmount,
        status: 'PENDING'
      }
    });

    withdrawalCodes.delete(req.user.id);
    res.json(withdrawal);
  });

  app.post('/api/invest', authenticateToken, async (req: any, res) => {
    const { planId, amount } = req.body;
    const plan = await prisma.investmentPlan.findUnique({ where: { id: planId } });
    if (!plan || !plan.active) return res.status(400).json({ error: 'Invalid plan' });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (amount < plan.minAmount || amount > plan.maxAmount) {
      return res.status(400).json({ error: `Amount must be between ${plan.minAmount} and ${plan.maxAmount}` });
    }

    if (user.balance < amount) return res.status(400).json({ error: 'Insufficient balance' });

    const expectedReturn = amount * (plan.roi / 100);
    const endTime = new Date(Date.now() + plan.durationHours * 60 * 60 * 1000);

    await prisma.user.update({ where: { id: req.user.id }, data: { balance: { decrement: amount } } });

    const investment = await prisma.investment.create({
      data: {
        userId: req.user.id,
        planId: plan.id,
        amount,
        roi: plan.roi,
        roiType: plan.roiType,
        expectedReturn,
        endTime,
        status: 'ACTIVE'
      }
    });

    await prisma.transaction.create({
      data: { userId: req.user.id, type: 'INVESTMENT', amount: -amount, description: `Investment in ${plan.name}` }
    });

    res.json(investment);
  });

  app.post('/api/investments/:id/claim', authenticateToken, async (req: any, res) => {
    const investment = await prisma.investment.findUnique({ where: { id: req.params.id } });
    if (!investment || investment.userId !== req.user.id) return res.status(404).json({ error: 'Investment not found' });
    if (investment.status !== 'ACTIVE') return res.status(400).json({ error: 'Investment not active' });

    const now = new Date();
    const canClaim = now >= investment.endTime;
    if (!canClaim && !investment.plan.autoComplete) return res.status(400).json({ error: 'Investment not yet completed' });

    const profit = investment.expectedReturn;
    await prisma.user.update({ where: { id: req.user.id }, data: { balance: { increment: investment.amount + profit }, totalEarned: { increment: profit } } });

    await prisma.investment.update({ where: { id: investment.id }, data: { status: 'COMPLETED', actualReturn: profit, profit, completedAt: now } });

    await prisma.transaction.create({
      data: { userId: req.user.id, type: 'INVESTMENT_RETURN', amount: profit, description: `Returns from ${investment.plan.name}` }
    });

    res.json({ success: true, profit });
  });

  app.post('/api/user/profile', authenticateToken, async (req: any, res) => {
    const { avatar, dashboardLayout } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatar: avatar !== undefined ? avatar : undefined, dashboardLayout: dashboardLayout !== undefined ? JSON.stringify(dashboardLayout) : undefined }
    });
    res.json(user);
  });

  app.post('/api/auth/change-password', authenticateToken, async (req: any, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || !(await bcrypt.compare(currentPassword, user.password))) return res.status(400).json({ error: 'Current password incorrect' });
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } });
    res.json({ message: 'Password updated successfully' });
  });

  app.post('/api/auth/change-pin', authenticateToken, async (req: any, res) => {
    const { currentPin, newPin } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || user.pin !== currentPin) return res.status(400). json({ error: 'Current PIN incorrect' });
    await prisma.user.update({ where: { id: user.id }, data: { pin: newPin } });
    res.json({ message: 'PIN updated successfully' });
  });

  app.get('/api/transactions', authenticateToken, async (req: any, res) => {
    const transactions = await prisma.transaction.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } });
    res.json(transactions);
  });

  app.get('/api/spin/prizes', async (req, res) => {
    const prizes = await prisma.spinPrize.findMany({ where: { active: true } });
    res.json(prizes);
  });

  app.post('/api/spin/claim', authenticateToken, async (req: any, res) => {
    const { prizeId } = req.body;
    const prize = await prisma.spinPrize.findUnique({ where: { id: prizeId } });
    if (!prize) return res.status(404).json({ error: 'Prize not found' });

    await prisma.user.update({ where: { id: req.user.id }, data: { balance: { increment: prize.rewardAmount } } });
    await prisma.transaction.create({ data: { userId: req.user.id, type: 'SPIN_WIN', amount: prize.rewardAmount, description: `Won ${prize.rewardAmount} from Spin Wheel` } });
    res.json({ message: 'Claimed successfully', prize });
  });

  app.post('/api/kyc/upload', authenticateToken, async (req: any, res) => {
    const { document, selfie } = req.body;
    await prisma.user.update({ where: { id: req.user.id }, data: { kycDocument: document, kycSelfie: selfie, kycStatus: 'PENDING' } });
    res.json({ message: 'KYC submitted' });
  });

  app.post('/api/support/ticket', authenticateToken, async (req: any, res) => {
    const { subject, message, priority } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    await prisma.supportTicket.create({
      data: { userId: user!.id, userEmail: user!.email, subject, message, priority: priority || 'MEDIUM' }
    });
    res.json({ message: 'Ticket created' });
  });

  // Railway fix: bind to 0.0.0.0
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT} (bind 0.0.0.0) — Railway compatible`);
  });
}

startServer().catch(console.error);