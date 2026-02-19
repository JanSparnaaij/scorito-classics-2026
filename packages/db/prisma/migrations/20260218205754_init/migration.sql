-- CreateTable
CREATE TABLE "Race" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "sourceUrl" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Rider" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pcsId" TEXT,
    "name" TEXT NOT NULL,
    "team" TEXT,
    "nationality" TEXT
);

-- CreateTable
CREATE TABLE "StartlistEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "raceId" TEXT NOT NULL,
    "riderId" TEXT NOT NULL,
    "dorsal" INTEGER,
    "team" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StartlistEntry_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "Race" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StartlistEntry_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "Rider" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RankingSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "riderId" TEXT NOT NULL,
    "rankingType" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "capturedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RankingSnapshot_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "Rider" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Price" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "riderId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "amountEUR" REAL NOT NULL,
    "capturedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Price_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "Rider" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
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
