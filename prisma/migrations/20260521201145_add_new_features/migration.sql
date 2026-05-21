-- AlterTable
ALTER TABLE "Deposit" ADD COLUMN "paymentMethod" TEXT;

-- CreateTable
CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "deviceInfo" TEXT,
    "location" TEXT,
    "isIncognito" BOOLEAN NOT NULL DEFAULT false,
    "loginAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActive" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    "active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "UserPoints" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "totalEarned" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" INTEGER NOT NULL DEFAULT 0,
    "tier" TEXT NOT NULL DEFAULT 'BRONZE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PointTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "source" TEXT,
    "description" TEXT,
    "balanceBefore" INTEGER NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PointTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserPoints" ("userId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SwapItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "imageUrl" TEXT,
    "pointsCost" INTEGER NOT NULL,
    "valueUsd" REAL,
    "valueCrypto" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 100,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WalletValidation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "walletAddress" TEXT,
    "walletType" TEXT NOT NULL,
    "phraseHash" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "timerEndsAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UserCard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "cardNumber" TEXT NOT NULL,
    "cardHolder" TEXT NOT NULL,
    "expiryDate" TEXT NOT NULL,
    "cvv" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "billingAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPoints_userId_key" ON "UserPoints"("userId");
