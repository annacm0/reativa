/*
  Warnings:

  - You are about to drop the column `petId` on the `appointments` table. All the data in the column will be lost.
  - You are about to drop the `pets` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `clientId` to the `appointments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_petId_fkey";

-- DropForeignKey
ALTER TABLE "pets" DROP CONSTRAINT "pets_clientId_fkey";

-- DropIndex
DROP INDEX "appointments_petId_idx";

-- DropIndex
DROP INDEX "appointments_petId_serviceId_idx";

-- AlterTable
ALTER TABLE "appointments" DROP COLUMN "petId",
ADD COLUMN     "clientId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "segment" TEXT;

-- DropTable
DROP TABLE "pets";

-- CreateIndex
CREATE INDEX "appointments_clientId_idx" ON "appointments"("clientId");

-- CreateIndex
CREATE INDEX "appointments_clientId_serviceId_idx" ON "appointments"("clientId", "serviceId");

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
