-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('CANCELLED', 'PENDING', 'APPROVED', 'REJECTED', 'WAITED', 'RETURNED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ReservationRoom" AS ENUM ('LARGE', 'SMALL');

-- CreateTable
CREATE TABLE "Reservation" (
    "id" SERIAL NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reservatorName" TEXT NOT NULL,
    "clubName" TEXT,
    "studentId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "room" "ReservationRoom" NOT NULL,
    "purpose" TEXT NOT NULL,
    "numPeople" INTEGER NOT NULL,
    "reservationDate" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "actualReturnTime" TIMESTAMP(3),
    "returnImageUrls" TEXT[],
    "damageDetails" TEXT,
    "token" TEXT NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_token_key" ON "Reservation"("token");
