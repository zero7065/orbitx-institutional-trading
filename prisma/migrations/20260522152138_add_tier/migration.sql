-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
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
    "tier" TEXT NOT NULL DEFAULT 'STANDARD',
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
INSERT INTO "new_User" ("adminNote", "avatar", "balance", "createdAt", "dashboardLayout", "depositAddresses", "email", "id", "kycDocument", "kycSelfie", "kycStatus", "lastActivityAt", "lastLoginDate", "loginStreak", "password", "pin", "referralCode", "referredBy", "role", "status", "totalDeposited", "totalEarned", "totalWithdrawn", "updatedAt") SELECT "adminNote", "avatar", "balance", "createdAt", "dashboardLayout", "depositAddresses", "email", "id", "kycDocument", "kycSelfie", "kycStatus", "lastActivityAt", "lastLoginDate", "loginStreak", "password", "pin", "referralCode", "referredBy", "role", "status", "totalDeposited", "totalEarned", "totalWithdrawn", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
