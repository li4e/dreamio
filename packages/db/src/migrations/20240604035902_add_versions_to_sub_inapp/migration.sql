/*
  Warnings:

  - You are about to drop the column `transaction_Id` on the `Subscription` table. All the data in the column will be lost.
  - Added the required column `transaction_id` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InAppPurchase" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "transaction_Id",
ADD COLUMN     "transaction_id" TEXT NOT NULL,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;
