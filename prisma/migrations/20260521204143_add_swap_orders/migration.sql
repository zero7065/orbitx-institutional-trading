-- CreateTable
CREATE TABLE "SwapOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "crypto" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "price" REAL NOT NULL,
    "total" REAL NOT NULL,
    "paymentMethod" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
