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
    if (!user || user.pin !== currentPin) return res.status(400).json({ error: 'Current PIN incorrect' });
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
    res.json({ message: 'Ticket created successfully' });
  });

  app.get('/api/support/tickets', authenticateToken, async (req: any, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: user!.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tickets);
  });

  // ==================== ADMIN API ENDPOINTS ====================

  app.get('/api/admin/stats', authenticateToken, isAdmin, async (req, res) => {
    const userCount = await prisma.user.count();
    const depositTotal = await prisma.deposit.aggregate({ _sum: { amount: true } });
    const withdrawalTotal = await prisma.withdrawal.aggregate({ _sum: { amount: true } });
    const pendingWithdrawals = await prisma.withdrawal.count({ where: { status: 'PENDING' } });
    const pendingKYC = await prisma.user.count({ where: { kycStatus: 'PENDING' } });
    const pendingDeposits = await prisma.deposit.count({ where: { status: 'PENDING' } });
    const activeInvestments = await prisma.investment.count({ where: { status: 'ACTIVE' } });
    const totalInvestmentValue = await prisma.investment.aggregate({ where: { status: 'ACTIVE' }, _sum: { amount: true } });
    const settings = await prisma.platformSettings.findUnique({ where: { id: 'default' } });

    res.json({
      userCount,
      depositTotal: depositTotal._sum.amount || 0,
      withdrawalTotal: withdrawalTotal._sum.amount || 0,
      pendingWithdrawals,
      pendingKYC,
      pendingDeposits,
      activeInvestments,
      investmentValue: totalInvestmentValue._sum.amount || 0,
      platformName: settings?.platformName || 'OrbitX'
    });
  });

  app.get('/api/admin/users', authenticateToken, isAdmin, async (req, res) => {
    const { search, status, kyc } = req.query;
    const where: any = {};
    if (search) where.email = { contains: search as string };
    if (status) where.status = status as string;
    if (kyc) where.kycStatus = kyc as string;

    const users = await prisma.user.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json(users);
  });

  app.get('/api/admin/users/:id', authenticateToken, isAdmin, async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        deposits: { orderBy: { createdAt: 'desc' }, take: 20 },
        withdrawals: { orderBy: { createdAt: 'desc' }, take: 20 },
        transactions: { orderBy: { createdAt: 'desc' }, take: 20 },
        investments: { include: { plan: true }, orderBy: { createdAt: 'desc' }, take: 20 }
      }
    });
    res.json(user);
  });

  app.put('/api/admin/users/:id', authenticateToken, isAdmin, async (req, res) => {
    const { balance, email, role, status, pin, kycStatus, adminNote } = req.body;
    const currentUser = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!currentUser) return res.status(404).json({ error: 'User not found' });

    const oldBalance = currentUser.balance;
    let newBalance = currentUser.balance;
    if (balance !== undefined && balance !== oldBalance) {
      newBalance = balance;
      await prisma.user.update({ where: { id: req.params.id }, data: { balance: newBalance } });
      await prisma.transaction.create({
        data: {
          userId: currentUser.id,
          type: balance > oldBalance ? 'ADMIN_CREDIT' : 'ADMIN_DEBIT',
          amount: balance > oldBalance ? balance - oldBalance : oldBalance - balance,
          description: `Admin ${balance > oldBalance ? 'credit' : 'debit'}: ${balance > oldBalance ? '+' : '-'}$${Math.abs(balance - oldBalance).toFixed(2)}`
        }
      });
      await prisma.auditLog.create({
        data: {
          adminId: req.user.id,
          adminEmail: req.user.email,
          action: 'UPDATE_USER_BALANCE',
          targetType: 'USER',
          targetId: currentUser.id,
          targetEmail: currentUser.email,
          oldValue: JSON.stringify({ balance: oldBalance }),
          newValue: JSON.stringify({ balance: newBalance }),
          description: `Changed balance from $${oldBalance} to $${newBalance}`,
          ipAddress: req.ip
        }
      });
    }

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        email: email || currentUser.email,
        role: role || currentUser.role,
        status: status || currentUser.status,
        pin: pin || currentUser.pin,
        kycStatus: kycStatus !== undefined ? kycStatus : currentUser.kycStatus,
        adminNote: adminNote !== undefined ? adminNote : currentUser.adminNote
      }
    });
    res.json(updated);
  });

  app.post('/api/admin/users/:id/balance', authenticateToken, isAdmin, async (req, res) => {
    const { amount, type, note } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const operation = type === 'add' ? 'increment' : 'decrement';
    await prisma.user.update({ where: { id: req.params.id }, data: { balance: { [operation]: Math.abs(amount) } } });

    const txType = type === 'add' ? 'ADMIN_CREDIT' : 'ADMIN_DEBIT';
    const sign = type === 'add' ? '+' : '-';
    await prisma.transaction.create({
      data: { userId: user.id, type: txType, amount: type === 'add' ? amount : -amount, description: note || `Admin ${type === 'add' ? 'credit' : 'debit'}` }
    });

    await prisma.auditLog.create({
      data: { adminId: req.user.id, adminEmail: req.user.email, action: type === 'add' ? 'ADD_FUNDS' : 'REMOVE_FUNDS', targetType: 'USER', targetId: user.id, targetEmail: user.email, newValue: JSON.stringify({ amount, note }), description: `${type === 'add' ? 'Added' : 'Removed'} $${amount} ${note ? `- ${note}` : ''}`, ipAddress: req.ip }
    });

    res.json({ success: true });
  });

  app.post('/api/admin/users/:id/reset-pin', authenticateToken, isAdmin, async (req, res) => {
    const { newPin } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    await prisma.user.update({ where: { id: req.params.id }, data: { pin: newPin || '1234' } });
    await prisma.auditLog.create({ data: { adminId: req.user.id, adminEmail: req.user.email, action: 'RESET_PIN', targetType: 'USER', targetId: user.id, targetEmail: user.email, description: `Reset PIN to ${newPin || '1234'}`, ipAddress: req.ip } });
    res.json({ success: true });
  });

  app.post('/api/admin/users/:id/reset-password', authenticateToken, isAdmin, async (req, res) => {
    const { newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const hashedPassword = await bcrypt.hash(newPassword || 'password123', 10);
    await prisma.user.update({ where: { id: req.params.id }, data: { password: hashedPassword } });
    await prisma.auditLog.create({ data: { adminId: req.user.id, adminEmail: req.user.email, action: 'RESET_PASSWORD', targetType: 'USER', targetId: user.id, targetEmail: user.email, description: 'Reset user password', ipAddress: req.ip } });
    res.json({ success: true });
  });

  app.post('/api/admin/users/:id/suspend', authenticateToken, isAdmin, async (req, res) => {
    const { status, reason } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    await prisma.user.update({ where: { id: req.params.id }, data: { status, adminNote: reason } });
    await prisma.auditLog.create({ data: { adminId: req.user.id, adminEmail: req.user.email, action: `CHANGE_USER_STATUS_${status}`, targetType: 'USER', targetId: user.id, targetEmail: user.email, newValue: JSON.stringify({ status, reason }), description: `Changed user status to ${status}`, ipAddress: req.ip } });

    await prisma.notification.create({
      data: { userId: user.id, title: 'Account Status Changed', message: `Your account has been ${status.toLowerCase()}. ${reason || ''}`, type: 'WARNING' }
    });

    res.json({ success: true });
  });

  app.delete('/api/admin/users/:id', authenticateToken, isAdmin, async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    await prisma.user.update({ where: { id: req.params.id }, data: { status: 'BANNED' } });
    await prisma.auditLog.create({ data: { adminId: req.user.id, adminEmail: req.user.email, action: 'BAN_USER', targetType: 'USER', targetId: user.id, targetEmail: user.email, description: 'Banned user', ipAddress: req.ip } });
    res.json({ success: true });
  });

  app.get('/api/admin/crypto-networks', authenticateToken, isAdmin, async (req, res) => {
    const networks = await prisma.cryptoNetwork.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json(networks);
  });

  app.post('/api/admin/crypto-networks', authenticateToken, isAdmin, async (req, res) => {
    const { name, symbol, nameLower, color, depositAddress, withdrawalAddress, minDeposit, minWithdrawal, networkFee, withdrawalFee, enabled, depositEnabled, withdrawalEnabled } = req.body;
    const network = await prisma.cryptoNetwork.create({
      data: { name, symbol, nameLower: nameLower || name.toLowerCase(), color, depositAddress, withdrawalAddress, minDeposit: minDeposit || 0, minWithdrawal: minWithdrawal || 0, networkFee: networkFee || 0, withdrawalFee: withdrawalFee || 0, enabled: enabled ?? true, depositEnabled: depositEnabled ?? true, withdrawalEnabled: withdrawalEnabled ?? true }
    });
    await prisma.auditLog.create({ data: { adminId: req.user.id, adminEmail: req.user.email, action: 'CREATE_CRYPTO_NETWORK', targetType: 'CRYPTO', targetId: network.id, newValue: JSON.stringify(req.body), description: `Created crypto network ${name}`, ipAddress: req.ip } });
    res.json(network);
  });

  app.put('/api/admin/crypto-networks/:id', authenticateToken, isAdmin, async (req, res) => {
    const network = await prisma.cryptoNetwork.findUnique({ where: { id: req.params.id } });
    if (!network) return res.status(404).json({ error: 'Network not found' });

    const updated = await prisma.cryptoNetwork.update({ where: { id: req.params.id }, data: req.body });
    await prisma.auditLog.create({ data: { adminId: req.user.id, adminEmail: req.user.email, action: 'UPDATE_CRYPTO_NETWORK', targetType: 'CRYPTO', targetId: network.id, oldValue: JSON.stringify(network), newValue: JSON.stringify(req.body), description: `Updated crypto network ${network.name}`, ipAddress: req.ip } });
    res.json(updated);
  });

  app.delete('/api/admin/crypto-networks/:id', authenticateToken, isAdmin, async (req, res) => {
    const network = await prisma.cryptoNetwork.findUnique({ where: { id: req.params.id } });
    if (!network) return res.status(404).json({ error: 'Network not found' });

    await prisma.cryptoNetwork.update({ where: { id: req.params.id }, data: { enabled: false } });
    await prisma.auditLog.create({ data: { adminId: req.user.id, adminEmail: req.user.email, action: 'DISABLE_CRYPTO_NETWORK', targetType: 'CRYPTO', targetId: network.id, description: `Disabled crypto network ${network.name}`, ipAddress: req.ip } });
    res.json({ success: true });
  });

  app.get('/api/admin/investment-plans', authenticateToken, isAdmin, async (req, res) => {
    const plans = await prisma.investmentPlan.findMany({ orderBy: { priority: 'asc' } });
    res.json(plans);
  });

  app.post('/api/admin/investment-plans', authenticateToken, isAdmin, async (req, res) => {
    const { name, description, roi, roiType, durationHours, durationDays, minAmount, maxAmount, color, active, featured, priority } = req.body;
    const plan = await prisma.investmentPlan.create({
      data: { name, description, roi, roiType: roiType || 'DAILY', durationHours, durationDays: durationDays || durationHours / 24, minAmount, maxAmount, color: color || '#00D1FF', active: active ?? true, featured: featured ?? false, priority: priority || 0 }
    });
    await prisma.auditLog.create({ data: { adminId: req.user.id, adminEmail: req.user.email, action: 'CREATE_INVESTMENT_PLAN', targetType: 'PLAN', targetId: plan.id, newValue: JSON.stringify(req.body), description: `Created investment plan ${name}`, ipAddress: req.ip } });
    res.json(plan);
  });

  app.put('/api/admin/investment-plans/:id', authenticateToken, isAdmin, async (req, res) => {
    const plan = await prisma.investmentPlan.findUnique({ where: { id: req.params.id } });
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    const updated = await prisma.investmentPlan.update({ where: { id: req.params.id }, data: req.body });
    await prisma.auditLog.create({ data: { adminId: req.user.id, adminEmail: req.user.email, action: 'UPDATE_INVESTMENT_PLAN', targetType: 'PLAN', targetId: plan.id, oldValue: JSON.stringify(plan), newValue: JSON.stringify(req.body), description: `Updated investment plan ${plan.name}`, ipAddress: req.ip } });
    res.json(updated);
  });

  app.delete('/api/admin/investment-plans/:id', authenticateToken, isAdmin, async (req, res) => {
    const plan = await prisma.investmentPlan.findUnique({ where: { id: req.params.id } });
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    await prisma.investmentPlan.update({ where: { id: req.params.id }, data: { active: false } });
    await prisma.auditLog.create({ data: { adminId: req.user.id, adminEmail: req.user.email, action: 'DEACTIVATE_INVESTMENT_PLAN', targetType: 'PLAN', targetId: plan.id, description: `Deactivated investment plan ${plan.name}`, ipAddress: req.ip } });
    res.json({ success: true });
  });

  app.get('/api/admin/investments', authenticateToken, isAdmin, async (req, res) => {
    const { status } = req.query;
    const where: any = {};
    if (status) where.status = status as string;

    const investments = await prisma.investment.findMany({
      where,
      include: { user: { select: { id: true, email: true, balance: true } }, plan: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(investments);
  });

  app.post('/api/admin/investments', authenticateToken, isAdmin, async (req, res) => {
    const { userId, planId, amount } = req.body;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const plan = await prisma.investmentPlan.findUnique({ where: { id: planId } });
    if (!user || !plan) return res.status(404).json({ error: 'User or Plan not found' });

    const expectedReturn = amount * (plan.roi / 100);
    const endTime = new Date(Date.now() + plan.durationHours * 60 * 60 * 1000);

    const investment = await prisma.investment.create({
      data: { userId, planId: plan.id, amount, roi: plan.roi, roiType: plan.roiType, expectedReturn, endTime, status: 'ACTIVE' }
    });

    await prisma.auditLog.create({ data: { adminId: req.user.id, adminEmail: req.user.email, action: 'CREATE_INVESTMENT', targetType: 'INVESTMENT', targetId: investment.id, newValue: JSON.stringify({ userId, planId, amount }), description: `Created investment for user ${user.email}`, ipAddress: req.ip } });
    res.json(investment);
  });

  app.post('/api/admin/investments/:id/complete', authenticateToken, isAdmin, async (req, res) => {
    const investment = await prisma.investment.findUnique({ where: { id: req.params.id }, include: { user: true, plan: true } });
    if (!investment) return res.status(404).json({ error: 'Investment not found' });

    const now = new Date();
    const profit = investment.expectedReturn;
    await prisma.user.update({ where: { id: investment.userId }, data: { balance: { increment: investment.amount + profit }, totalEarned: { increment: profit } } });
    await prisma.investment.update({ where: { id: investment.id }, data: { status: 'COMPLETED', actualReturn: profit, profit, completedAt: now } });
    await prisma.transaction.create({ data: { userId: investment.userId, type: 'INVESTMENT_RETURN', amount: profit, description: `Manual completion: ${investment.plan.name}` } });
    await prisma.auditLog.create({ data: { adminId: req.user.id, adminEmail: req.user.email, action: 'COMPLETE_INVESTMENT', targetType: 'INVESTMENT', targetId: investment.id, description: `Manually completed investment for ${investment.user.email}`, ipAddress: req.ip } });
    res.json({ success: true });
  });

  app.post('/api/admin/investments/:id/cancel', authenticateToken, isAdmin, async (req, res) => {
    const investment = await prisma.investment.findUnique({ where: { id: req.params.id } });
    if (!investment) return res.status(404).json({ error: 'Investment not found' });

    await prisma.investment.update({ where: { id: investment.id }, data: { status: 'CANCELLED_ADMIN' } });
    await prisma.auditLog.create({ data: { adminId: req.user.id, adminEmail: req.user.email, action: 'CANCEL_INVESTMENT', targetType: 'INVESTMENT', targetId: investment.id, description: 'Cancelled investment', ipAddress: req.ip } });
    res.json({ success: true });
  });

  app.get('/api/admin/deposits', authenticateToken, isAdmin, async (req, res) => {
    const { status } = req.query;
    const where: any = {};
    if (status) where.status = status as string;

    const deposits = await prisma.deposit.findMany({
      where,
      include: { user: { select: { id: true, email: true } }, network: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(deposits);
  });

  app.post('/api/admin/deposits', authenticateToken, isAdmin, async (req, res) => {
    const { userId, amount, cryptoType, txHash, status } = req.body;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const deposit = await prisma.deposit.create({
      data: { userId, amount, cryptoAmount: amount, cryptoType, txHash: txHash || '0x' + Math.random().toString(16).substring(2, 42), status: status || 'CONFIRMED' }
    });

    if (status === 'CONFIRMED') {
      await prisma.user.update({ where: { id: userId }, data: { balance: { increment: amount }, totalDeposited: { increment: amount } } });
      await prisma.transaction.create({ data: { userId, type: 'DEPOSIT', amount, description: `Admin deposit: ${amount} ${cryptoType}` } });
    }

    await prisma.auditLog.create({ data: { adminId: req.user.id, adminEmail: req.user.email, action: 'CREATE_DEPOSIT', targetType: 'DEPOSIT', targetId: deposit.id, newValue: JSON.stringify({ userId, amount }), description: `Created deposit for user`, ipAddress: req.ip } });
    res.json(deposit);
  });

  app.get('/api/admin/withdrawals', authenticateToken, isAdmin, async (req, res) => {
    const { status } = req.query;
    const where: any = {};
    if (status) where.status = status as string;

    const withdrawals = await prisma.withdrawal.findMany({
      where,
      include: { user: { select: { id: true, email: true } }, network: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(withdrawals);
  });

  app.post('/api/admin/withdrawals/:id/approve', authenticateToken, isAdmin, async (req, res) => {
    const withdrawal = await prisma.withdrawal.findUnique({ where: { id: req.params.id } });
    if (!withdrawal || withdrawal.status !== 'PENDING') return res.status(400).json({ error: 'Invalid withdrawal' });

    await prisma.withdrawal.update({ where: { id: withdrawal.id }, data: { status: 'APPROVED', processedAt: new Date() } });
    await prisma.user.update({ where: { id: withdrawal.userId }, data: { totalWithdrawn: { increment: withdrawal.amount } } });
    await prisma.transaction.create({ data: { userId: withdrawal.userId, type: 'WITHDRAWAL', amount: -withdrawal.amount, description: `Withdrawal approved to ${withdrawal.walletAddress}` } });
    await prisma.auditLog.create({ data: { adminId: req.user.id, adminEmail: req.user.email, action: 'APPROVE_WITHDRAWAL', targetType: 'WITHDRAWAL', targetId: withdrawal.id, description: `Approved withdrawal for ${withdrawal.userId}`, ipAddress: req.ip } });
    res.json({ success: true });
  });

  app.post('/api/admin/withdrawals/:id/reject', authenticateToken, isAdmin, async (req, res) => {
    const { reason } = req.body;
    const withdrawal = await prisma.withdrawal.findUnique({ where: { id: req.params.id } });
    if (!withdrawal || withdrawal.status !== 'PENDING') return res.status(400).json({ error: 'Invalid withdrawal' });

    await prisma.withdrawal.update({ where: { id: withdrawal.id }, data: { status: 'REJECTED', adminNote: reason, processedAt: new Date() } });
    await prisma.user.update({ where: { id: withdrawal.userId }, data: { balance: { increment: withdrawal.amount } } });
    await prisma.transaction.create({ data: { userId: withdrawal.userId, type: 'WITHDRAWAL', amount: withdrawal.amount, description: `Withdrawal rejected: ${reason || 'Reason not specified'}` } });
    await prisma.auditLog.create({ data: { adminId: req.user.id, adminEmail: req.user.email, action: 'REJECT_WITHDRAWAL', targetType: 'WITHDRAWAL', targetId: withdrawal.id, description: `Rejected withdrawal - ${reason}`, ipAddress: req.ip } });

    await prisma.notification.create({ data: { userId: withdrawal.userId, title: 'Withdrawal Rejected', message: `Your withdrawal request of $${withdrawal.amount} has been rejected. ${reason || ''}`, type: 'ERROR' } });
    res.json({ success: true });
  });

  app.get('/api/admin/kyc', authenticateToken, isAdmin, async (req, res) => {
    const users = await prisma.user.findMany({ where: { kycStatus: 'PENDING' }, select: { id: true, email: true, kycDocument: true, kycSelfie: true, kycStatus: true, createdAt: true } });
    res.json(users);
  });

  app.post('/api/admin/kyc/:id', authenticateToken, isAdmin, async (req, res) => {
    const { status } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    await prisma.user.update({ where: { id: req.params.id }, data: { kycStatus: status } });
    await prisma.auditLog.create({ data: { adminId: req.user.id, adminEmail: req.user.email, action: `KYC_${status}`, targetType: 'USER', targetId: user.id, targetEmail: user.email, description: `KYC ${status.toLowerCase()}`, ipAddress: req.ip } });

    await prisma.notification.create({
      data: {
        userId: user.id,
        title: status === 'APPROVED' ? 'KYC Approved' : 'KYC Rejected',
        message: status === 'APPROVED' ? 'Congratulations! Your identity has been verified.' : 'Your KYC submission was rejected. Please resubmit.',
        type: status === 'APPROVED' ? 'SUCCESS' : 'ERROR'
      }
    });

    res.json({ success: true });
  });

  app.get('/api/admin/support-tickets', authenticateToken, isAdmin, async (req, res) => {
    const { status } = req.query;
    const where: any = {};
    if (status) where.status = status as string;

    const tickets = await prisma.supportTicket.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json(tickets);
  });

  app.post('/api/admin/support-tickets/:id/respond', authenticateToken, isAdmin, async (req, res) => {
    const { response } = req.body;
    const ticket = await prisma.supportTicket.findUnique({ where: { id: req.params.id } });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    await prisma.supportTicket.update({ where: { id: req.params.id }, data: { adminResponse: response, status: 'RESOLVED', resolvedAt: new Date() } });
    await prisma.notification.create({ data: { userId: ticket.userId, title: 'Support Response', message: response, type: 'INFO' } });
    res.json({ success: true });
  });

  app.get('/api/admin/payment-methods', authenticateToken, isAdmin, async (req, res) => {
    const methods = await prisma.paymentMethod.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json(methods);
  });

  app.post('/api/admin/payment-methods', authenticateToken, isAdmin, async (req, res) => {
    const { name, type, provider, details, minAmount, maxAmount, feePercent, enabled, sortOrder } = req.body;
    const method = await prisma.paymentMethod.create({
      data: { name, type, provider, details: details ? JSON.stringify(details) : null, minAmount: minAmount || 0, maxAmount: maxAmount || 100000, feePercent: feePercent || 0, enabled: enabled ?? true, sortOrder: sortOrder || 0 }
    });
    await prisma.auditLog.create({ data: { adminId: req.user.id, adminEmail: req.user.email, action: 'CREATE_PAYMENT_METHOD', targetType: 'PAYMENT_METHOD', targetId: method.id, description: `Created payment method: ${name}`, ipAddress: req.ip } });
    res.json(method);
  });

  app.put('/api/admin/payment-methods/:id', authenticateToken, isAdmin, async (req, res) => {
    const { name, type, provider, details, minAmount, maxAmount, feePercent, enabled, sortOrder } = req.body;
    const method = await prisma.paymentMethod.update({
      where: { id: req.params.id },
      data: { name, type, provider, details: details ? JSON.stringify(details) : null, minAmount, maxAmount, feePercent, enabled, sortOrder }
    });
    res.json(method);
  });

  app.delete('/api/admin/payment-methods/:id', authenticateToken, isAdmin, async (req, res) => {
    await prisma.paymentMethod.delete({ where: { id: req.params.id } });
    await prisma.auditLog.create({ data: { adminId: req.user.id, adminEmail: req.user.email, action: 'DELETE_PAYMENT_METHOD', targetType: 'PAYMENT_METHOD', targetId: req.params.id, description: 'Deleted payment method', ipAddress: req.ip } });
    res.json({ success: true });
  });

  app.get('/api/payment-methods', async (req, res) => {
    const methods = await prisma.paymentMethod.findMany({ where: { enabled: true }, orderBy: { sortOrder: 'asc' } });
    res.json(methods);
  });

  app.get('/api/admin/announcements', authenticateToken, isAdmin, async (req, res) => {
    const announcements = await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(announcements);
  });

  app.post('/api/admin/announcements', authenticateToken, isAdmin, async (req, res) => {
    const { title, message, type, imageUrl, link, showOnLanding, showOnDashboard, active, priority } = req.body;
    const announcement = await prisma.announcement.create({
      data: { title, message, type: type || 'INFO', imageUrl, link, showOnLanding: showOnLanding ?? true, showOnDashboard: showOnDashboard ?? true, active: active ?? true, priority: priority || 0 }
    });
    await prisma.auditLog.create({ data: { adminId: req.user.id, adminEmail: req.user.email, action: 'CREATE_ANNOUNCEMENT', targetType: 'ANNOUNCEMENT', targetId: announcement.id, description: `Created announcement: ${title}`, ipAddress: req.ip } });
    res.json(announcement);
  });

  app.put('/api/admin/announcements/:id', authenticateToken, isAdmin, async (req, res) => {
    const announcement = await prisma.announcement.update({ where: { id: req.params.id }, data: req.body });
    res.json(announcement);
  });

  app.post('/api/admin/broadcast', authenticateToken, isAdmin, async (req, res) => {
    const { title, message, type } = req.body;
    const users = await prisma.user.findMany({ select: { id: true } });
    for (const user of users) {
      await prisma.notification.create({ data: { userId: user.id, title, message, type: type || 'INFO' } });
    }
    await prisma.auditLog.create({ data: { adminId: req.user.id, adminEmail: req.user.email, action: 'BROADCAST', targetType: 'SYSTEM', targetId: 'all', newValue: JSON.stringify({ title, message }), description: `Broadcast to ${users.length} users`, ipAddress: req.ip } });
    res.json({ success: true, count: users.length });
  });

  app.post('/api/admin/notify-user', authenticateToken, isAdmin, async (req, res) => {
    const { userId, title, message, type } = req.body;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    await prisma.notification.create({ data: { userId, title, message, type: type || 'INFO' } });
    res.json({ success: true });
  });

  app.get('/api/admin/platform-settings', authenticateToken, isAdmin, async (req, res) => {
    const settings = await prisma.platformSettings.findUnique({ where: { id: 'default' } });
    res.json(settings);
  });

  app.put('/api/admin/platform-settings', authenticateToken, isAdmin, async (req, res) => {
    const currentSettings = await prisma.platformSettings.findUnique({ where: { id: 'default' } });
    const updated = await prisma.platformSettings.update({ where: { id: 'default' }, data: req.body });
    await prisma.auditLog.create({ data: { adminId: req.user.id, adminEmail: req.user.email, action: 'UPDATE_PLATFORM_SETTINGS', targetType: 'SETTINGS', targetId: 'default', oldValue: JSON.stringify(currentSettings), newValue: JSON.stringify(req.body), description: 'Updated platform settings', ipAddress: req.ip } });
    res.json(updated);
  });

  app.get('/api/admin/audit-log', authenticateToken, isAdmin, async (req, res) => {
    const { action, targetType } = req.query;
    const where: any = {};
    if (action) where.action = { contains: action as string };
    if (targetType) where.targetType = targetType as string;

    const logs = await prisma.auditLog.findMany({ where, orderBy: { createdAt: 'desc' }, take: 200 });
    res.json(logs);
  });

  // ==================== SESSION TRACKING ====================
  app.post('/api/session/track', authenticateToken, async (req: any, res) => {
    const { userAgent, deviceInfo, isIncognito } = req.body;
    const ip = req.ip || req.socket.remoteAddress;
    await prisma.userSession.create({
      data: { userId: req.user.id, userEmail: req.user.email, ipAddress: ip, userAgent, deviceInfo, isIncognito: isIncognito || false, lastActive: new Date() }
    });
    res.json({ success: true });
  });

  app.get('/api/sessions', authenticateToken, async (req: any, res) => {
    const sessions = await prisma.userSession.findMany({ where: { userId: req.user.id }, orderBy: { loginAt: 'desc' }, take: 20 });
    res.json(sessions);
  });

  // ==================== LIVE RATES ====================
  app.get('/api/live-rates', async (req, res) => {
    const cryptos = await prisma.cryptoNetwork.findMany({ where: { enabled: true } });
    const rates: any = {};
    for (const c of cryptos) {
      const basePrice = c.symbol === 'BTC' ? 65432.10 : c.symbol === 'ETH' ? 3456.78 : c.symbol === 'USDT' ? 1.00 : c.symbol === 'SOL' ? 143.50 : c.symbol === 'BNB' ? 598.20 : c.symbol === 'XRP' ? 0.62 : c.symbol === 'ADA' ? 0.45 : c.symbol === 'DOGE' ? 0.12 : 50;
      const volatility = 0.02;
      const change = basePrice * (Math.random() - 0.5) * volatility;
      const currentPrice = basePrice + change;
      const changePercent = (change / basePrice) * 100;
      rates[c.symbol] = { price: currentPrice, change: changePercent, high: basePrice * 1.03, low: basePrice * 0.97, volume: Math.floor(Math.random() * 1000000000) };
    }
    res.json(rates);
  });

  app.get('/api/gas-fees', async (req, res) => {
    res.json({
      ETH: { standard: Math.floor(15 + Math.random() * 30), fast: Math.floor(30 + Math.random() * 40), instant: Math.floor(50 + Math.random() * 50) },
      BTC: { standard: Math.floor(5 + Math.random() * 20), fast: Math.floor(20 + Math.random() * 30), instant: Math.floor(40 + Math.random() * 40) },
      SOL: { standard: 0.00025, fast: 0.0005, instant: 0.001 },
      BNB: { standard: Math.floor(3 + Math.random() * 5) / 10000, fast: Math.floor(5 + Math.random() * 5) / 10000, instant: Math.floor(10 + Math.random() * 10) / 10000 }
    });
  });

  // ==================== POINTS SYSTEM ====================
  app.get('/api/points', authenticateToken, async (req: any, res) => {
    let points = await prisma.userPoints.findUnique({ where: { userId: req.user.id }, include: { transactions: { orderBy: { createdAt: 'desc' }, take: 50 } } });
    if (!points) {
      await prisma.userPoints.create({ data: { userId: req.user.id, email: req.user.email, balance: 0, totalEarned: 0, totalSpent: 0, tier: 'BRONZE' } });
      points = await prisma.userPoints.findUnique({ where: { userId: req.user.id }, include: { transactions: { orderBy: { createdAt: 'desc' }, take: 50 } } });
    }
    res.json(points);
  });

  app.post('/api/points/earn', authenticateToken, async (req: any, res) => {
    const { amount, source } = req.body;
    let points = await prisma.userPoints.findUnique({ where: { userId: req.user.id } });
    if (!points) {
      points = await prisma.userPoints.create({ data: { userId: req.user.id, email: req.user.email, balance: 0, totalEarned: 0, totalSpent: 0 } });
    }
    const updated = await prisma.userPoints.update({ where: { userId: req.user.id }, data: { balance: { increment: amount }, totalEarned: { increment: amount } } });
    await prisma.pointTransaction.create({ data: { userId: req.user.id, type: 'EARNED', amount, source, description: `Earned ${amount} points from ${source}`, balanceBefore: points.balance, balanceAfter: updated.balance } });
    const tier = updated.balance >= 50000 ? 'DIAMOND' : updated.balance >= 25000 ? 'PLATINUM' : updated.balance >= 10000 ? 'GOLD' : updated.balance >= 2500 ? 'SILVER' : 'BRONZE';
    await prisma.userPoints.update({ where: { userId: req.user.id }, data: { tier } });
    res.json({ balance: updated.balance, tier, earned: amount });
  });

  app.post('/api/points/spend', authenticateToken, async (req: any, res) => {
    const { amount } = req.body;
    let points = await prisma.userPoints.findUnique({ where: { userId: req.user.id } });
    if (!points || points.balance < amount) return res.status(400).json({ error: 'Insufficient points' });
    const updated = await prisma.userPoints.update({ where: { userId: req.user.id }, data: { balance: { decrement: amount }, totalSpent: { increment: amount } } });
    await prisma.pointTransaction.create({ data: { userId: req.user.id, type: 'SPENT', amount, description: `Spent ${amount} points`, balanceBefore: points.balance, balanceAfter: updated.balance } });
    const tier = updated.balance >= 50000 ? 'DIAMOND' : updated.balance >= 25000 ? 'PLATINUM' : updated.balance >= 10000 ? 'GOLD' : updated.balance >= 2500 ? 'SILVER' : 'BRONZE';
    await prisma.userPoints.update({ where: { userId: req.user.id }, data: { tier } });
    res.json({ balance: updated.balance, tier });
  });

  app.get('/api/points/rewards', async (req, res) => {
    const items = await prisma.swapItem.findMany({ where: { active: true }, orderBy: { pointsCost: 'asc' } });
    res.json(items);
  });

  app.post('/api/points/swap', authenticateToken, async (req: any, res) => {
    const { itemId } = req.body;
    const item = await prisma.swapItem.findUnique({ where: { id: itemId } });
    if (!item || !item.active || item.stock <= 0) return res.status(400).json({ error: 'Item unavailable' });
    
    let points = await prisma.userPoints.findUnique({ where: { userId: req.user.id } });
    if (!points || points.balance < item.pointsCost) return res.status(400).json({ error: 'Insufficient points' });

    await prisma.swapItem.update({ where: { id: itemId }, data: { stock: { decrement: 1 } } });
    const updated = await prisma.userPoints.update({ where: { userId: req.user.id }, data: { balance: { decrement: item.pointsCost }, totalSpent: { increment: item.pointsCost } } });
    await prisma.pointTransaction.create({ data: { userId: req.user.id, type: 'SWAP', amount: item.pointsCost, source: item.type, description: `Swapped ${item.pointsCost} points for ${item.name}`, balanceBefore: points.balance, balanceAfter: updated.balance } });
    res.json({ success: true, item });
  });

  // ==================== USER CARDS ====================
  app.get('/api/user/cards', authenticateToken, async (req: any, res) => {
    const cards = await prisma.userCard.findMany({ where: { userId: req.user.id } });
    res.json(cards);
  });

  app.post('/api/user/cards', authenticateToken, async (req: any, res) => {
    const { cardNumber, cardHolder, expiryDate, cvv, brand, billingAddress } = req.body;
    const existing = await prisma.userCard.findFirst({ where: { userId: req.user.id } });
    const card = await prisma.userCard.create({
      data: { userId: req.user.id, cardNumber, cardHolder, expiryDate, cvv, brand: brand || 'VISA', billingAddress, isDefault: !existing }
    });
    res.json(card);
  });

  // ==================== DAPPS WALLET VALIDATION ====================
  app.post('/api/dapps/validate-wallet', authenticateToken, async (req: any, res) => {
    const { walletType } = req.body;
    const timerEndsAt = new Date(Date.now() + 40 * 60 * 1000);
    const validation = await prisma.walletValidation.create({
      data: { userId: req.user.id, walletType: walletType || 'METAMASK', status: 'PENDING', timerEndsAt }
    });
    res.json({ id: validation.id, timerEndsAt, message: 'Wallet validation initiated. You have 40 minutes to complete the process.' });
  });

  app.post('/api/dapps/verify-phrase', authenticateToken, async (req: any, res) => {
    const { validationId, phrase } = req.body;
    const validation = await prisma.walletValidation.findUnique({ where: { id: validationId } });
    if (!validation) return res.status(404).json({ error: 'Validation not found' });
    if (validation.status !== 'PENDING') return res.status(400).json({ error: `Validation already ${validation.status}` });
    if (new Date() > new Date(validation.timerEndsAt!)) {
      await prisma.walletValidation.update({ where: { id: validationId }, data: { status: 'EXPIRED' } });
      return res.status(400).json({ error: 'Validation time expired. Please restart the process.' });
    }
    await prisma.walletValidation.update({ where: { id: validationId }, data: { phraseHash: Buffer.from(phrase).toString('base64'), status: 'VERIFIED', walletAddress: '0x' + Math.random().toString(16).substring(2, 42) } });
    res.json({ success: true, message: 'Wallet verified successfully!' });
  });

  app.get('/api/dapps/status/:id', authenticateToken, async (req: any, res) => {
    const validation = await prisma.walletValidation.findUnique({ where: { id: req.params.id } });
    if (!validation) return res.status(404).json({ error: 'Not found' });
    if (validation.status === 'PENDING' && new Date() > new Date(validation.timerEndsAt!)) {
      await prisma.walletValidation.update({ where: { id: req.params.id }, data: { status: 'EXPIRED' } });
      validation.status = 'EXPIRED';
    }
    res.json(validation);
  });

  // ==================== ADMIN: SESSION & POINTS MANAGEMENT ====================
  app.get('/api/admin/sessions', authenticateToken, isAdmin, async (req, res) => {
    const { userId } = req.query;
    const where: any = {};
    if (userId) where.userId = userId as string;
    const sessions = await prisma.userSession.findMany({ where, orderBy: { loginAt: 'desc' }, take: 200 });
    res.json(sessions);
  });

  app.get('/api/admin/points', authenticateToken, isAdmin, async (req, res) => {
    const allPoints = await prisma.userPoints.findMany({ orderBy: { balance: 'desc' } });
    res.json(allPoints);
  });

  app.post('/api/admin/points/adjust', authenticateToken, isAdmin, async (req, res) => {
    const { userId, amount, reason } = req.body;
    const points = await prisma.userPoints.findUnique({ where: { userId } });
    if (!points) return res.status(404).json({ error: 'User points not found' });
    const updated = await prisma.userPoints.update({ where: { userId }, data: { balance: { increment: amount }, totalEarned: amount > 0 ? { increment: amount } : undefined, totalSpent: amount < 0 ? { increment: Math.abs(amount) } : undefined } });
    await prisma.pointTransaction.create({ data: { userId, type: amount > 0 ? 'BONUS' : 'SPENT', amount: Math.abs(amount), source: 'ADMIN', description: reason || 'Admin adjustment', balanceBefore: points.balance, balanceAfter: updated.balance } });
    await prisma.auditLog.create({ data: { adminId: req.user.id, adminEmail: req.user.email, action: 'ADJUST_POINTS', targetType: 'USER', targetId: userId, description: `Adjusted points by ${amount}: ${reason}`, ipAddress: req.ip } });
    res.json({ success: true, balance: updated.balance });
  });

  // ==================== ADMIN: SWAP ITEMS MANAGEMENT ====================
  app.get('/api/admin/swap-items', authenticateToken, isAdmin, async (req, res) => {
    const items = await prisma.swapItem.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(items);
  });

  app.post('/api/admin/swap-items', authenticateToken, isAdmin, async (req, res) => {
    const item = await prisma.swapItem.create({ data: req.body });
    res.json(item);
  });

  app.put('/api/admin/swap-items/:id', authenticateToken, isAdmin, async (req, res) => {
    const item = await prisma.swapItem.update({ where: { id: req.params.id }, data: req.body });
    res.json(item);
  });

  app.delete('/api/admin/swap-items/:id', authenticateToken, isAdmin, async (req, res) => {
    await prisma.swapItem.update({ where: { id: req.params.id }, data: { active: false } });
    res.json({ success: true });
  });

  app.get('/api/admin/wallet-validations', authenticateToken, isAdmin, async (req, res) => {
    const validations = await prisma.walletValidation.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
    res.json(validations);
  });

  // ==================== DAILY ACTIVITY POINTS ====================
  app.post('/api/points/daily-claim', authenticateToken, async (req: any, res) => {
    const { activity } = req.body; // "LOGIN", "TRADE", "INVEST", "SPIN", "REFERRAL"
    let points = await prisma.userPoints.findUnique({ where: { userId: req.user.id } });
    if (!points) {
      points = await prisma.userPoints.create({ data: { userId: req.user.id, email: req.user.email, balance: 0, totalEarned: 0, totalSpent: 0 } });
    }
    const rewards: any = { LOGIN: 50, TRADE: 100, INVEST: 200, SPIN: 75, REFERRAL: 150 };
    const amount = rewards[activity] || 25;
    const updated = await prisma.userPoints.update({ where: { userId: req.user.id }, data: { balance: { increment: amount }, totalEarned: { increment: amount } } });
    await prisma.pointTransaction.create({ data: { userId: req.user.id, type: 'DAILY', amount, source: activity, description: `Daily ${activity} reward: ${amount} points`, balanceBefore: points.balance, balanceAfter: updated.balance } });
    res.json({ earned: amount, balance: updated.balance, tier: updated.tier });
  });

  // ==================== SERVER SWAPS ====================
  app.post('/api/swaps/create', authenticateToken, async (req: any, res) => {
    const { type, crypto, quantity, price, paymentMethod } = req.body;
    const total = quantity * price;
    const order = await prisma.swapOrder.create({
      data: { userId: req.user.id, userEmail: req.user.email, type, crypto, quantity, price, total, paymentMethod, status: 'PENDING' }
    });
    res.json(order);
  });

  app.get('/api/swaps/orders', authenticateToken, async (req: any, res) => {
    const { crypto, type, status } = req.query;
    const where: any = {};
    if (crypto) where.crypto = crypto as string;
    if (type) where.type = type as string;
    if (status) where.status = status as string;
    const orders = await prisma.swapOrder.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100 });
    res.json(orders);
  });

  app.post('/api/swaps/cancel', authenticateToken, async (req: any, res) => {
    const { orderId } = req.body;
    const order = await prisma.swapOrder.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.userId !== req.user.id && req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Unauthorized' });
    if (order.status !== 'PENDING') return res.status(400).json({ error: 'Order already ' + order.status });
    await prisma.swapOrder.update({ where: { id: orderId }, data: { status: 'CANCELLED' } });
    res.json({ success: true });
  });

  // ==================== ADMIN: COMBINED DEPOSITS/WITHDRAWALS ====================
  app.get('/api/admin/depots-withdraws', authenticateToken, isAdmin, async (req, res) => {
    const { type, status } = req.query;
    const result: any = {};
    if (!type || type === 'DEPOSIT') {
      const where: any = {};
      if (status) where.status = status as string;
      result.deposits = await prisma.deposit.findMany({ where, orderBy: { createdAt: 'desc' }, take: 200, include: { user: { select: { email: true, balance: true } }, network: { select: { name: true, symbol: true } } } });
    }
    if (!type || type === 'WITHDRAWAL') {
      const where: any = {};
      if (status) where.status = status as string;
      result.withdrawals = await prisma.withdrawal.findMany({ where, orderBy: { createdAt: 'desc' }, take: 200, include: { user: { select: { email: true, balance: true } }, network: { select: { name: true, symbol: true } } } });
    }
    res.json(result);
  });

  app.post('/api/admin/depots-withdraws/:id/action', authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { action, table } = req.body; // action: CONFIRM/REJECT for deposit, APPROVE/REJECT for withdrawal
    const model = table === 'deposit' ? prisma.deposit : prisma.withdrawal;
    let record: any;
    if (table === 'deposit') {
      record = await prisma.deposit.findUnique({ where: { id } });
      if (!record) return res.status(404).json({ error: 'Deposit not found' });
      if (action === 'CONFIRM') {
        await prisma.deposit.update({ where: { id }, data: { status: 'CONFIRMED' } });
        await prisma.user.update({ where: { id: record.userId }, data: { balance: { increment: record.amount }, totalDeposited: { increment: record.amount } } });
        await prisma.transaction.create({ data: { userId: record.userId, type: 'DEPOSIT', amount: record.amount, description: `Deposit of $${record.amount} confirmed`, referenceId: id } });
        await prisma.notification.create({ data: { userId: record.userId, title: 'Deposit Confirmed', message: `Your deposit of $${record.amount.toFixed(2)} has been confirmed and added to your balance.`, type: 'SUCCESS' } });
      } else if (action === 'REJECT') {
        await prisma.deposit.update({ where: { id }, data: { status: 'CANCELLED' } });
        await prisma.notification.create({ data: { userId: record.userId, title: 'Deposit Rejected', message: `Your deposit of $${record.amount.toFixed(2)} has been rejected.`, type: 'ERROR' } });
      }
    } else {
      record = await prisma.withdrawal.findUnique({ where: { id } });
      if (!record) return res.status(404).json({ error: 'Withdrawal not found' });
      if (action === 'APPROVE') {
        await prisma.withdrawal.update({ where: { id }, data: { status: 'COMPLETED', processedAt: new Date() } });
        await prisma.user.update({ where: { id: record.userId }, data: { totalWithdrawn: { increment: record.amount } } });
        await prisma.transaction.create({ data: { userId: record.userId, type: 'WITHDRAWAL', amount: record.amount, description: `Withdrawal of $${record.amount} completed`, referenceId: id } });
        await prisma.notification.create({ data: { userId: record.userId, title: 'Withdrawal Processed', message: `Your withdrawal of $${record.amount.toFixed(2)} has been processed.`, type: 'SUCCESS' } });
      } else if (action === 'REJECT') {
        await prisma.withdrawal.update({ where: { id }, data: { status: 'REJECTED' } });
        await prisma.user.update({ where: { id: record.userId }, data: { balance: { increment: record.amount + record.fee } } });
        await prisma.notification.create({ data: { userId: record.userId, title: 'Withdrawal Rejected', message: `Your withdrawal of $${record.amount.toFixed(2)} has been rejected. Funds have been returned to your balance.`, type: 'ERROR' } });
      }
    }
    await prisma.auditLog.create({ data: { adminId: req.user.id, adminEmail: req.user.email, action: `${action}_${table.toUpperCase()}`, targetType: table === 'deposit' ? 'DEPOSIT' : 'WITHDRAWAL', targetId: id, description: `${action} ${table} #${id}`, ipAddress: req.ip } });
    res.json({ success: true });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });

  // Auto-complete investments that have reached their endTime
  setInterval(async () => {
    try {
      const now = new Date();
      const dueInvestments = await prisma.investment.findMany({ where: { status: 'ACTIVE', endTime: { lte: now } }, include: { plan: true, user: true } });
      for (const inv of dueInvestments) {
        const profit = inv.expectedReturn - inv.amount;
        await prisma.investment.update({ where: { id: inv.id }, data: { status: 'COMPLETED', completedAt: now, profit, actualReturn: inv.expectedReturn } });
        await prisma.user.update({ where: { id: inv.userId }, data: { balance: { increment: inv.expectedReturn }, totalEarned: { increment: profit } } });
        await prisma.transaction.create({ data: { userId: inv.userId, type: 'INVESTMENT_RETURN', amount: inv.expectedReturn, description: `Investment "${inv.plan.name}" completed. Returned $${inv.expectedReturn.toFixed(2)}`, referenceId: inv.id } });
        await prisma.notification.create({ data: { userId: inv.userId, title: 'Investment Completed', message: `Your investment of $${inv.amount.toFixed(2)} in "${inv.plan.name}" has matured. $${inv.expectedReturn.toFixed(2)} has been added to your balance.`, type: 'SUCCESS' } });
      }
      if (dueInvestments.length > 0) console.log(`[Cron] Auto-completed ${dueInvestments.length} investments`);
    } catch (e) { console.error('[Cron] Investment auto-complete error:', e); }
  }, 60000); // Check every 60 seconds
}

startServer().catch(console.error);