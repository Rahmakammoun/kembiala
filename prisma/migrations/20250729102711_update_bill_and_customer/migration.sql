/*
  Warnings:

  - You are about to drop the column `prenom` on the `Customer` table. All the data in the column will be lost.
  - Added the required column `aval` to the `bills` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyName` to the `bills` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lieu` to the `bills` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Customer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Customer" ("createdAt", "email", "id", "nom") SELECT "createdAt", "email", "id", "nom" FROM "Customer";
DROP TABLE "Customer";
ALTER TABLE "new_Customer" RENAME TO "Customer";
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");
CREATE TABLE "new_bills" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
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
INSERT INTO "new_bills" ("amount", "bankId", "creationDate", "customerId", "dueDate", "id", "status") SELECT "amount", "bankId", "creationDate", "customerId", "dueDate", "id", "status" FROM "bills";
DROP TABLE "bills";
ALTER TABLE "new_bills" RENAME TO "bills";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
