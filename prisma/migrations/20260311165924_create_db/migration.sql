-- CreateTable
CREATE TABLE "Draw" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "year" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "drawDate" TEXT NOT NULL,
    "drawnAt" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "Draw_year_idx" ON "Draw"("year");

-- CreateIndex
CREATE UNIQUE INDEX "Draw_year_number_key" ON "Draw"("year", "number");
