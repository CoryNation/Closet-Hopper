/*
  Warnings:

  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."License" ADD COLUMN     "giftMessage" TEXT,
ADD COLUMN     "giftRecipientEmail" TEXT,
ADD COLUMN     "isGift" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "redeemedAt" TIMESTAMP(3),
ADD COLUMN     "redeemedBy" TEXT,
ALTER COLUMN "status" SET DEFAULT 'available';

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "name";
