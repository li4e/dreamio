/*
  Warnings:

  - Added the required column `credits` to the `InAppPurchase` table without a default value. This is not possible if the table is not empty.
  - Added the required column `credits` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InAppPurchase" ADD COLUMN     "credits" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "credits" INTEGER NOT NULL;
