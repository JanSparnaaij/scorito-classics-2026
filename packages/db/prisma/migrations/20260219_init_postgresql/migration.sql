-- CreateTable
CREATE TABLE "Race" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "sourceUrl" TEXT NOT NULL,

    CONSTRAINT "Race_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rider" (
    "id" TEXT NOT NULL,
    "pcsId" TEXT,
    "name" TEXT NOT NULL,
    "team" TEXT,
    "nationality" TEXT,

    CONSTRAINT "Rider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StartlistEntry" (
    "id" TEXT NOT NULL,
    "raceId" TEXT NOT NULL,
    "riderId" TEXT NOT NULL,
    "dorsal" INTEGER,
    "team" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StartlistEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RankingSnapshot" (
    "id" TEXT NOT NULL,
    "riderId" TEXT NOT NULL,
    "rankingType" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RankingSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Price" (
    "id" TEXT NOT NULL,
    "riderId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "amountEUR" DOUBLE PRECISION NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Price_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Race_slug_key" ON "Race"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Rider_pcsId_key" ON "Rider"("pcsId");

-- CreateIndex
CREATE UNIQUE INDEX "StartlistEntry_raceId_riderId_key" ON "StartlistEntry"("raceId", "riderId");

-- CreateIndex
CREATE INDEX "RankingSnapshot_riderId_rankingType_idx" ON "RankingSnapshot"("riderId", "rankingType");

-- CreateIndex
CREATE INDEX "Price_riderId_source_idx" ON "Price"("riderId", "source");

-- AddForeignKey
ALTER TABLE "StartlistEntry" ADD CONSTRAINT "StartlistEntry_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "Race"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StartlistEntry" ADD CONSTRAINT "StartlistEntry_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "Rider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RankingSnapshot" ADD CONSTRAINT "RankingSnapshot_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "Rider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Price" ADD CONSTRAINT "Price_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "Rider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
