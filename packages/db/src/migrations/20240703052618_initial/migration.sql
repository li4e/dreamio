-- CreateEnum
CREATE TYPE "Store" AS ENUM ('app_store', 'play_store', 'adapty');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('processing', 'completed', 'error');

-- CreateEnum
CREATE TYPE "GenerationModel" AS ENUM ('dalle_2', 'dalle_3');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('pending', 'accepted', 'rejected');

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
    "image_id" INTEGER NOT NULL,
    "generation_id" INTEGER NOT NULL,

    CONSTRAINT "ImageGeneration_pkey" PRIMARY KEY ("image_id")
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
    "user_id" INTEGER NOT NULL,
    "image_generation_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "likes_count" INTEGER NOT NULL DEFAULT 0,
    "comments_count" INTEGER NOT NULL DEFAULT 0,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "blocked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostLike" (
    "post_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "PostComment" (
    "id" BIGSERIAL NOT NULL,
    "post_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "likes_count" INTEGER NOT NULL DEFAULT 0,
    "child_count" INTEGER NOT NULL DEFAULT 0,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "blocked" BOOLEAN NOT NULL DEFAULT false,
    "parent_id" BIGINT,
    "reply_id" BIGINT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostCommentLike" (
    "comment_id" BIGINT NOT NULL,
    "user_id" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "PostClaim" (
    "id" SERIAL NOT NULL,
    "post_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "reason" CHAR(255) NOT NULL,
    "status" "ClaimStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommentClaim" (
    "id" SERIAL NOT NULL,
    "comment_id" BIGINT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "ClaimStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommentClaim_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "ImageGeneration_image_id_key" ON "ImageGeneration"("image_id");

-- CreateIndex
CREATE INDEX "ImageGeneration_generation_id_idx" ON "ImageGeneration"("generation_id");

-- CreateIndex
CREATE UNIQUE INDEX "Post_image_generation_id_key" ON "Post"("image_generation_id");

-- CreateIndex
CREATE INDEX "Post_user_id_idx" ON "Post"("user_id");

-- CreateIndex
CREATE INDEX "Post_updated_at_idx" ON "Post"("updated_at");

-- CreateIndex
CREATE INDEX "Post_likes_count_idx" ON "Post"("likes_count");

-- CreateIndex
CREATE INDEX "Post_user_id_updated_at_idx" ON "Post"("user_id", "updated_at");

-- CreateIndex
CREATE INDEX "Post_user_id_likes_count_idx" ON "Post"("user_id", "likes_count");

-- CreateIndex
CREATE UNIQUE INDEX "PostLike_user_id_post_id_key" ON "PostLike"("user_id", "post_id");

-- CreateIndex
CREATE INDEX "PostComment_post_id_idx" ON "PostComment"("post_id");

-- CreateIndex
CREATE INDEX "PostComment_created_at_idx" ON "PostComment"("created_at");

-- CreateIndex
CREATE INDEX "PostComment_likes_count_idx" ON "PostComment"("likes_count");

-- CreateIndex
CREATE INDEX "PostComment_post_id_created_at_idx" ON "PostComment"("post_id", "created_at");

-- CreateIndex
CREATE INDEX "PostComment_post_id_likes_count_idx" ON "PostComment"("post_id", "likes_count");

-- CreateIndex
CREATE UNIQUE INDEX "PostCommentLike_user_id_comment_id_key" ON "PostCommentLike"("user_id", "comment_id");

-- CreateIndex
CREATE UNIQUE INDEX "PostClaim_user_id_post_id_key" ON "PostClaim"("user_id", "post_id");

-- CreateIndex
CREATE UNIQUE INDEX "CommentClaim_user_id_comment_id_key" ON "CommentClaim"("user_id", "comment_id");

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
ALTER TABLE "ImageGeneration" ADD CONSTRAINT "ImageGeneration_generation_id_fkey" FOREIGN KEY ("generation_id") REFERENCES "Generation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImageGeneration" ADD CONSTRAINT "ImageGeneration_image_id_fkey" FOREIGN KEY ("image_id") REFERENCES "Image"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Generation" ADD CONSTRAINT "Generation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_image_generation_id_fkey" FOREIGN KEY ("image_generation_id") REFERENCES "ImageGeneration"("image_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostLike" ADD CONSTRAINT "PostLike_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostLike" ADD CONSTRAINT "PostLike_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "PostComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_reply_id_fkey" FOREIGN KEY ("reply_id") REFERENCES "PostComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostCommentLike" ADD CONSTRAINT "PostCommentLike_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "PostComment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostCommentLike" ADD CONSTRAINT "PostCommentLike_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostClaim" ADD CONSTRAINT "PostClaim_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostClaim" ADD CONSTRAINT "PostClaim_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentClaim" ADD CONSTRAINT "CommentClaim_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "PostComment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentClaim" ADD CONSTRAINT "CommentClaim_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserSubscriptions" ADD CONSTRAINT "_UserSubscriptions_A_fkey" FOREIGN KEY ("A") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserSubscriptions" ADD CONSTRAINT "_UserSubscriptions_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserInAppPurchases" ADD CONSTRAINT "_UserInAppPurchases_A_fkey" FOREIGN KEY ("A") REFERENCES "InAppPurchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserInAppPurchases" ADD CONSTRAINT "_UserInAppPurchases_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
