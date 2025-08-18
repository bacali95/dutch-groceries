/*
  Warnings:

  - You are about to drop the column `storeSlug` on the `ProductSource` table. All the data in the column will be lost.
  - You are about to drop the `Store` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `storeKey` to the `ProductSource` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."StoreKey" AS ENUM ('ALBERT_HEIJN', 'JUMBO');

-- DropForeignKey
ALTER TABLE "public"."ProductSource" DROP CONSTRAINT "ProductSource_storeSlug_fkey";

-- AlterTable
ALTER TABLE "public"."ProductSource" DROP COLUMN "storeSlug",
ADD COLUMN     "storeKey" "public"."StoreKey" NOT NULL;

-- DropTable
DROP TABLE "public"."Store";
