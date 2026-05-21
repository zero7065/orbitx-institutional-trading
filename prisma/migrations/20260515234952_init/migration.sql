-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "balance" REAL NOT NULL DEFAULT 0,
    "totalDeposited" REAL NOT NULL DEFAULT 0,
    "totalWithdrawn" REAL NOT NULL DEFAULT 0,
    "totalEarned" REAL NOT NULL DEFAULT 0,
    "referralCode" TEXT NOT NULL,
    "referredBy" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "kycStatus" TEXT NOT NULL DEFAULT 'NONE',
    "kycDocument" TEXT,
    "kycSelfie" TEXT,
    "avatar" TEXT,
    "dashboardLayout" TEXT,
    "pin" TEXT NOT NULL DEFAULT '1234',
    "loginStreak" INTEGER NOT NULL DEFAULT 0,
    "lastLoginDate" DATETIME,
    "lastActivityAt" DATETIME,
    "adminNote" TEXT,
    "depositAddresses" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PlatformSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "platformName" TEXT NOT NULL DEFAULT 'OrbitX',
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#00D1FF',
    "secondaryColor" TEXT NOT NULL DEFAULT '#F0B90B',
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "registrationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "minDeposit" REAL NOT NULL DEFAULT 10,
    "maxDeposit" REAL NOT NULL DEFAULT 100000,
    "minWithdrawal" REAL NOT NULL DEFAULT 20,
    "maxWithdrawal" REAL NOT NULL DEFAULT 50000,
    "withdrawalFeePercent" REAL NOT NULL DEFAULT 2,
    "referralBonus" REAL NOT NULL DEFAULT 5,
    "referralBonusPercent" REAL NOT NULL DEFAULT 3,
    "spinEnabled" BOOLEAN NOT NULL DEFAULT true,
    "kycRequired" BOOLEAN NOT NULL DEFAULT false,
    "tradingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "investmentEnabled" BOOLEAN NOT NULL DEFAULT true,
    "telegramLink" TEXT,
    "twitterLink" TEXT,
    "facebookLink" TEXT,
    "instagramLink" TEXT,
    "youtubeLink" TEXT,
    "discordLink" TEXT,
    "supportEmail" TEXT,
    "contactPhone" TEXT,
    "companyAddress" TEXT,
    "termsUrl" TEXT,
    "privacyUrl" TEXT,
    "totalUsers" INTEGER NOT NULL DEFAULT 0,
    "totalDeposits" REAL NOT NULL DEFAULT 0,
    "totalWithdrawals" REAL NOT NULL DEFAULT 0,
    "activeInvestments" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CryptoNetwork" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "nameLower" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT NOT NULL DEFAULT '#F7931A',
    "depositAddress" TEXT,
    "withdrawalAddress" TEXT,
    "networkName" TEXT,
    "chainId" TEXT,
    "minDeposit" REAL NOT NULL DEFAULT 0,
    "minWithdrawal" REAL NOT NULL DEFAULT 0,
    "networkFee" REAL NOT NULL DEFAULT 0,
    "withdrawalFee" REAL NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "depositEnabled" BOOLEAN NOT NULL DEFAULT true,
    "withdrawalEnabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "InvestmentPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "description" TEXT NOT NULL,
    "descriptionAr" TEXT,
    "roi" REAL NOT NULL,
    "roiType" TEXT NOT NULL DEFAULT 'DAILY',
    "durationHours" INTEGER NOT NULL,
    "durationDays" REAL NOT NULL,
    "minAmount" REAL NOT NULL,
    "maxAmount" REAL NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#00D1FF',
    "icon" TEXT,
    "imageUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "maxInvestmentsPerUser" INTEGER NOT NULL DEFAULT 10,
    "totalCapacity" REAL NOT NULL DEFAULT 0,
    "currentInvested" REAL NOT NULL DEFAULT 0,
    "requiredKycLevel" TEXT NOT NULL DEFAULT 'NONE',
    "autoComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Investment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "roi" REAL NOT NULL,
    "roiType" TEXT NOT NULL,
    "expectedReturn" REAL NOT NULL,
    "actualReturn" REAL,
    "profit" REAL NOT NULL DEFAULT 0,
    "startTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" DATETIME NOT NULL,
    "completedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Investment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Investment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "InvestmentPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Deposit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "networkId" TEXT,
    "amount" REAL NOT NULL,
    "cryptoAmount" REAL,
    "cryptoType" TEXT NOT NULL,
    "txHash" TEXT,
    "fromAddress" TEXT,
    "toAddress" TEXT,
    "confirmations" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Deposit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Deposit_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "CryptoNetwork" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Withdrawal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "networkId" TEXT,
    "amount" REAL NOT NULL,
    "cryptoAmount" REAL,
    "cryptoType" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "txHash" TEXT,
    "fee" REAL NOT NULL DEFAULT 0,
    "netAmount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "processedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Withdrawal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Withdrawal_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "CryptoNetwork" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "fee" REAL NOT NULL DEFAULT 0,
    "netAmount" REAL,
    "description" TEXT NOT NULL,
    "referenceId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'INFO',
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'INFO',
    "imageUrl" TEXT,
    "link" TEXT,
    "showOnLanding" BOOLEAN NOT NULL DEFAULT true,
    "showOnDashboard" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adminId" TEXT NOT NULL,
    "adminEmail" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "targetEmail" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "description" TEXT,
    "ipAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SpinPrize" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "labelAr" TEXT,
    "probability" REAL NOT NULL,
    "rewardAmount" REAL NOT NULL,
    "rewardCrypto" TEXT NOT NULL,
    "rewardType" TEXT NOT NULL DEFAULT 'BALANCE',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Ad" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "adminResponse" TEXT,
    "resolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");
