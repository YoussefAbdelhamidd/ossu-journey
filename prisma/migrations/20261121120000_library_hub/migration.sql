-- CreateTable
CREATE TABLE "LibraryGroup" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "coverImage" TEXT,
    "isCourse" BOOLEAN NOT NULL DEFAULT false,
    "playlistUrl" TEXT,
    "startedAt" TIMESTAMP(3),
    "shareToken" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LibraryGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibraryEpisode" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "youtubeId" TEXT,
    "durationSeconds" INTEGER,
    "order" INTEGER NOT NULL,

    CONSTRAINT "LibraryEpisode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LibraryGoal" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "LibraryGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserContentMix" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "percent" INTEGER NOT NULL,

    CONSTRAINT "UserContentMix_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EpisodeNote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "episodeId" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EpisodeNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EpisodePlayback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "episodeId" TEXT NOT NULL,
    "positionSeconds" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EpisodePlayback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LibraryGroup_shareToken_key" ON "LibraryGroup"("shareToken");

-- CreateIndex
CREATE INDEX "LibraryGroup_ownerId_idx" ON "LibraryGroup"("ownerId");

-- CreateIndex
CREATE INDEX "LibraryGroup_category_idx" ON "LibraryGroup"("category");

-- CreateIndex
CREATE INDEX "LibraryEpisode_groupId_idx" ON "LibraryEpisode"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "LibraryEpisode_groupId_number_key" ON "LibraryEpisode"("groupId", "number");

-- CreateIndex
CREATE INDEX "LibraryGoal_groupId_idx" ON "LibraryGoal"("groupId");

-- CreateIndex
CREATE INDEX "UserContentMix_userId_idx" ON "UserContentMix"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserContentMix_userId_category_key" ON "UserContentMix"("userId", "category");

-- CreateIndex
CREATE INDEX "EpisodeNote_userId_idx" ON "EpisodeNote"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EpisodeNote_userId_episodeId_key" ON "EpisodeNote"("userId", "episodeId");

-- CreateIndex
CREATE INDEX "EpisodePlayback_userId_idx" ON "EpisodePlayback"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EpisodePlayback_userId_episodeId_key" ON "EpisodePlayback"("userId", "episodeId");

-- AddForeignKey
ALTER TABLE "LibraryGroup" ADD CONSTRAINT "LibraryGroup_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryEpisode" ADD CONSTRAINT "LibraryEpisode_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "LibraryGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryGoal" ADD CONSTRAINT "LibraryGoal_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "LibraryGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserContentMix" ADD CONSTRAINT "UserContentMix_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EpisodeNote" ADD CONSTRAINT "EpisodeNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EpisodeNote" ADD CONSTRAINT "EpisodeNote_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "LibraryEpisode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EpisodePlayback" ADD CONSTRAINT "EpisodePlayback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EpisodePlayback" ADD CONSTRAINT "EpisodePlayback_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "LibraryEpisode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
