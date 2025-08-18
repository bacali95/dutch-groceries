/*
  Warnings:

  - You are about to drop the column `storeId` on the `ProductSource` table. All the data in the column will be lost.
  - The primary key for the `Store` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Store` table. All the data in the column will be lost.
  - Added the required column `storeSlug` to the `ProductSource` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Store` table without a default value. This is not possible if the table is not empty.
  - Made the column `url` on table `Store` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'USER');

-- DropForeignKey
ALTER TABLE "public"."ProductSource" DROP CONSTRAINT "ProductSource_storeId_fkey";

-- DropIndex
DROP INDEX "public"."Store_name_key";

-- AlterTable
ALTER TABLE "public"."ProductSource" DROP COLUMN "storeId",
ADD COLUMN     "storeSlug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Store" DROP CONSTRAINT "Store_pkey",
DROP COLUMN "id",
ADD COLUMN     "slug" TEXT NOT NULL,
ALTER COLUMN "url" SET NOT NULL,
ADD CONSTRAINT "Store_pkey" PRIMARY KEY ("slug");

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "role" "public"."UserRole" NOT NULL DEFAULT 'USER';

-- AddForeignKey
ALTER TABLE "public"."ProductSource" ADD CONSTRAINT "ProductSource_storeSlug_fkey" FOREIGN KEY ("storeSlug") REFERENCES "public"."Store"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;
