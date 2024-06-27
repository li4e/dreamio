-- CreateEnum
CREATE TYPE "Status" AS ENUM ('processing', 'completed', 'error');

-- CreateEnum
CREATE TYPE "GenerationModel" AS ENUM ('dalle_2', 'dalle_3');

-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "file_path" TEXT NOT NULL,
    "public_url" TEXT NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GenerationImage" (
    "id" SERIAL NOT NULL,
    "generationId" INTEGER NOT NULL,
    "imageId" INTEGER NOT NULL,

    CONSTRAINT "GenerationImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Generation" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "promptFull" VARCHAR(1000) NOT NULL,
    "prompt" VARCHAR(500) NOT NULL,
    "style" VARCHAR(255),
    "model" "GenerationModel" NOT NULL,
    "highQuality" BOOLEAN,
    "enhancer" BOOLEAN NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'processing',
    "version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Generation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Image_file_path_key" ON "Image"("file_path");

-- CreateIndex
CREATE UNIQUE INDEX "GenerationImage_generationId_imageId_key" ON "GenerationImage"("generationId", "imageId");

-- AddForeignKey
ALTER TABLE "GenerationImage" ADD CONSTRAINT "GenerationImage_generationId_fkey" FOREIGN KEY ("generationId") REFERENCES "Generation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenerationImage" ADD CONSTRAINT "GenerationImage_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Generation" ADD CONSTRAINT "Generation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Create trigger for the Generation table
CREATE TRIGGER update_generation_version
BEFORE UPDATE ON "Generation"
FOR EACH ROW
EXECUTE FUNCTION increment_version();