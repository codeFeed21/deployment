/*
  Warnings:

  - The `status` column on the `Bookings` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('unconfirmed', 'checkedIn', 'checkedOut');

-- AlterTable
ALTER TABLE "Bookings" DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'unconfirmed';
