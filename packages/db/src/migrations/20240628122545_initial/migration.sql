-- CreateEnum
CREATE TYPE "Store" AS ENUM ('app_store', 'play_store', 'adapty');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('processing', 'completed', 'error');

-- CreateEnum
CREATE TYPE "GenerationModel" AS ENUM ('dalle_2', 'dalle_3');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "freeCredits" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FirebaseUser" (
    "firebaseId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" SERIAL NOT NULL,
    "product_id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "original_transaction_id" TEXT NOT NULL,
    "store" "Store" NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "is_lifetime" BOOLEAN NOT NULL,
    "is_in_trial" BOOLEAN NOT NULL,
    "is_in_grace_period" BOOLEAN NOT NULL,
    "will_renew" BOOLEAN NOT NULL,
    "is_sandbox" BOOLEAN NOT NULL,
    "base_plan_id" TEXT,
    "credits" INTEGER NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,

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
    "credits" INTEGER NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "InAppPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "file_path" TEXT NOT NULL,
    "public_url" TEXT NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImageGeneration" (
    "imageId" INTEGER NOT NULL,
    "generationId" INTEGER NOT NULL,

    CONSTRAINT "ImageGeneration_pkey" PRIMARY KEY ("imageId")
);

-- CreateTable
CREATE TABLE "Generation" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "promptFull" VARCHAR(1000) NOT NULL,
    "prompt" VARCHAR(500) NOT NULL,
    "style" VARCHAR(255),
    "model" "GenerationModel" NOT NULL,
    "n" INTEGER NOT NULL DEFAULT 1,
    "highQuality" BOOLEAN,
    "enhancer" BOOLEAN NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'processing',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Generation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "generation_id" INTEGER NOT NULL,
    "image_generation_id" INTEGER NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "likes_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostLike" (
    "postId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL
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
CREATE UNIQUE INDEX "FirebaseUser_firebaseId_userId_key" ON "FirebaseUser"("firebaseId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_store_original_transaction_id_key" ON "Subscription"("store", "original_transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "InAppPurchase_store_original_transaction_id_key" ON "InAppPurchase"("store", "original_transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "Image_file_path_key" ON "Image"("file_path");

-- CreateIndex
CREATE UNIQUE INDEX "ImageGeneration_imageId_key" ON "ImageGeneration"("imageId");

-- CreateIndex
CREATE UNIQUE INDEX "Post_generation_id_image_generation_id_key" ON "Post"("generation_id", "image_generation_id");

-- CreateIndex
CREATE UNIQUE INDEX "PostLike_userId_postId_key" ON "PostLike"("userId", "postId");

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
ALTER TABLE "ImageGeneration" ADD CONSTRAINT "ImageGeneration_generationId_fkey" FOREIGN KEY ("generationId") REFERENCES "Generation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImageGeneration" ADD CONSTRAINT "ImageGeneration_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Generation" ADD CONSTRAINT "Generation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_generation_id_fkey" FOREIGN KEY ("generation_id") REFERENCES "Generation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostLike" ADD CONSTRAINT "PostLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostLike" ADD CONSTRAINT "PostLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserSubscriptions" ADD CONSTRAINT "_UserSubscriptions_A_fkey" FOREIGN KEY ("A") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserSubscriptions" ADD CONSTRAINT "_UserSubscriptions_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserInAppPurchases" ADD CONSTRAINT "_UserInAppPurchases_A_fkey" FOREIGN KEY ("A") REFERENCES "InAppPurchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserInAppPurchases" ADD CONSTRAINT "_UserInAppPurchases_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
