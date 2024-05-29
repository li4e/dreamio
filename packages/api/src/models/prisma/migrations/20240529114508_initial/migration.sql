-- CreateEnum
CREATE TYPE "Store" AS ENUM ('app_store', 'play_store', 'adapty');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "freeCredits" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FirebaseUser" (
    "id" SERIAL NOT NULL,
    "firebaseId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "FirebaseUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" SERIAL NOT NULL,
    "product_id" TEXT NOT NULL,
    "transaction_Id" TEXT NOT NULL,
    "original_transaction_id" TEXT NOT NULL,
    "store" "Store" NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "is_lifetime" BOOLEAN NOT NULL,
    "is_in_trial" BOOLEAN NOT NULL,
    "is_in_grace_period" BOOLEAN NOT NULL,
    "will_renew" BOOLEAN NOT NULL,
    "is_sandbox" BOOLEAN NOT NULL,
    "base_plan_id" TEXT,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InAppPurchase" (
    "id" SERIAL NOT NULL,
    "product_id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "original_transaction_id" TEXT NOT NULL,
    "store" "Store" NOT NULL,
    "is_refunded" BOOLEAN NOT NULL,
    "is_sandbox" BOOLEAN NOT NULL,

    CONSTRAINT "InAppPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserSubscriptions" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_UserInAppPurchases" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "FirebaseUser_firebaseId_key" ON "FirebaseUser"("firebaseId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_store_original_transaction_id_key" ON "Subscription"("store", "original_transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "InAppPurchase_store_original_transaction_id_key" ON "InAppPurchase"("store", "original_transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "_UserSubscriptions_AB_unique" ON "_UserSubscriptions"("A", "B");

-- CreateIndex
CREATE INDEX "_UserSubscriptions_B_index" ON "_UserSubscriptions"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_UserInAppPurchases_AB_unique" ON "_UserInAppPurchases"("A", "B");

-- CreateIndex
CREATE INDEX "_UserInAppPurchases_B_index" ON "_UserInAppPurchases"("B");

-- AddForeignKey
ALTER TABLE "FirebaseUser" ADD CONSTRAINT "FirebaseUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserSubscriptions" ADD CONSTRAINT "_UserSubscriptions_A_fkey" FOREIGN KEY ("A") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserSubscriptions" ADD CONSTRAINT "_UserSubscriptions_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserInAppPurchases" ADD CONSTRAINT "_UserInAppPurchases_A_fkey" FOREIGN KEY ("A") REFERENCES "InAppPurchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserInAppPurchases" ADD CONSTRAINT "_UserInAppPurchases_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
