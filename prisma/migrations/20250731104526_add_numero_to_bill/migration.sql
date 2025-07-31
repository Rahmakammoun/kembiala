/*
  Warnings:

  - Added the required column `numero` to the `bills` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_bills" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "creationDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "companyName" TEXT NOT NULL,
    "aval" TEXT NOT NULL,
    "lieu" TEXT NOT NULL,
    "customerId" INTEGER NOT NULL,
    "bankId" INTEGER NOT NULL,
    CONSTRAINT "bills_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "bills_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_bills" ("amount", "aval", "bankId", "companyName", "creationDate", "customerId", "dueDate", "id", "lieu", "status") SELECT "amount", "aval", "bankId", "companyName", "creationDate", "customerId", "dueDate", "id", "lieu", "status" FROM "bills";
DROP TABLE "bills";
ALTER TABLE "new_bills" RENAME TO "bills";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
