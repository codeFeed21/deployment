/*
  Warnings:

  - You are about to drop the column `userId` on the `Bookings` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Bookings" DROP CONSTRAINT "Bookings_userId_fkey";

-- AlterTable
ALTER TABLE "Bookings" DROP COLUMN "userId";
